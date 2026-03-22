export type SimParams = {
  nSites: number;
  generations: number;
  seed: number;

  // baseline rates
  pMaint: number; // H->M after replication
  pDeNovo: number; // U->H or H->M
  pDemeth: number; // M->H or H->U

  // neighbor effect
  beta: number; // logistic strength; 0 means no neighbor coupling

  // event window (inclusive start, inclusive end)
  eventStart: number;
  eventEnd: number;

  // multipliers during event window
  eventMaintMult: number;
  eventDeNovoMult: number;
  eventDemethMult: number;
};

export type SimResult = {
  // methylation level (0, 0.5, 1) matrix: [g][i]
  methyl: number[][];
  // expression proxy per generation (1 - mean methyl)
  expression: number[];
};

function clamp01(x: number) {
  return Math.max(0, Math.min(1, x));
}

// Small deterministic PRNG (Mulberry32)
function mulberry32(seed: number) {
  let a = seed >>> 0;
  return function rand() {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function sigmoid(x: number) {
  return 1 / (1 + Math.exp(-x));
}

function logit(p: number) {
  const pp = clamp01(p);
  const eps = 1e-9;
  const q = Math.min(1 - eps, Math.max(eps, pp));
  return Math.log(q / (1 - q));
}

function isEvent(gen: number, p: SimParams) {
  return gen >= p.eventStart && gen <= p.eventEnd;
}

function neighborSignal(states: Uint8Array, i: number): number {
  // states are 0/1/2; map to 0/0.5/1 then average neighbors (±1)
  const left = i > 0 ? states[i - 1] / 2 : states[i] / 2;
  const right = i < states.length - 1 ? states[i + 1] / 2 : states[i] / 2;
  return (left + right) / 2;
}

function neighborAdjustedProb(pBase: number, beta: number, s: number): number {
  // p_eff = sigmoid(logit(pBase) + beta * (s - 0.5))
  if (beta === 0) return clamp01(pBase);
  return clamp01(sigmoid(logit(pBase) + beta * (s - 0.5)));
}

export function runSimulation(params: SimParams): SimResult {
  const rand = mulberry32(params.seed);

  const G = params.generations;
  const N = params.nSites;

  // state per site: 0 U, 1 H, 2 M
  let states = new Uint8Array(N);
  // start with random low methylation (public-friendly, tweakable later)
  for (let i = 0; i < N; i++) {
    const r = rand();
    states[i] = r < 0.85 ? 0 : r < 0.95 ? 1 : 2;
  }

  const methyl: number[][] = [];
  const expression: number[] = [];

  const record = () => {
    const row: number[] = new Array(N);
    let sum = 0;
    for (let i = 0; i < N; i++) {
      const m = states[i] / 2;
      row[i] = m;
      sum += m;
    }
    methyl.push(row);
    expression.push(1 - sum / N);
  };

  record(); // generation 0

  for (let gen = 1; gen <= G; gen++) {
    const inEvent = isEvent(gen, params);

    const pMaintBase = clamp01(
      params.pMaint * (inEvent ? params.eventMaintMult : 1)
    );
    const pDeNovoBase = clamp01(
      params.pDeNovo * (inEvent ? params.eventDeNovoMult : 1)
    );
    const pDemethBase = clamp01(
      params.pDemeth * (inEvent ? params.eventDemethMult : 1)
    );

    // 1) replication
    for (let i = 0; i < N; i++) {
      const st = states[i];
      if (st === 2) {
        states[i] = 1; // M -> H
      } else if (st === 1) {
        // H -> U with 0.5 approximation
        states[i] = rand() < 0.5 ? 0 : 1;
      } // U stays U
    }

    // 2) maintenance (neighbor-influenced)
    for (let i = 0; i < N; i++) {
      if (states[i] !== 1) continue;
      const s = neighborSignal(states, i);
      const pEff = neighborAdjustedProb(pMaintBase, params.beta, s);
      if (rand() < pEff) states[i] = 2; // H -> M
    }

    // 3) de novo (neighbor-influenced)
    for (let i = 0; i < N; i++) {
      const s = neighborSignal(states, i);
      const pEff = neighborAdjustedProb(pDeNovoBase, params.beta, s);

      if (states[i] === 0) {
        if (rand() < pEff) states[i] = 1; // U -> H
      } else if (states[i] === 1) {
        if (rand() < pEff) states[i] = 2; // H -> M
      }
    }

    // 4) demethylation (not neighbor-influenced by default)
    for (let i = 0; i < N; i++) {
      if (states[i] === 2) {
        if (rand() < pDemethBase) states[i] = 1; // M -> H
      } else if (states[i] === 1) {
        if (rand() < pDemethBase) states[i] = 0; // H -> U
      }
    }

    record();
  }

  return { methyl, expression };
}