import { useMemo, useState } from "react";
import Plot from "react-plotly.js";
import { runSimulation, SimParams } from "./sim/methylation";

function num(v: string) {
  const x = Number(v);
  return Number.isFinite(x) ? x : 0;
}

export default function App() {
  const [params, setParams] = useState<SimParams>({
    nSites: 120,
    generations: 300,
    seed: 42,

    pMaint: 0.97,
    pDeNovo: 0.01,
    pDemeth: 0.003,

    beta: 5.0,

    eventStart: 80,
    eventEnd: 140,

    eventMaintMult: 0.98,
    eventDeNovoMult: 2.5,
    eventDemethMult: 1.5,
  });

  const result = useMemo(() => runSimulation(params), [params]);

  const heatmap = useMemo(() => {
    // Plotly expects z as [y][x]; we have methyl[g][i]
    return {
      z: result.methyl,
      x: Array.from({ length: params.nSites }, (_, i) => i),
      y: Array.from({ length: params.generations + 1 }, (_, g) => g),
    };
  }, [result.methyl, params.nSites, params.generations]);

  const shapes = useMemo(() => {
    const y0 = params.eventStart;
    const y1 = params.eventEnd;
    if (y1 < y0) return [];
    return [
      {
        type: "rect",
        xref: "paper",
        x0: 0,
        x1: 1,
        yref: "y",
        y0,
        y1,
        fillcolor: "rgba(245, 158, 11, 0.18)",
        line: { width: 0 },
        layer: "below",
      },
    ];
  }, [params.eventStart, params.eventEnd]);

  return (
    <div className="container">
      <div className="header">
        <h1>egen-methyl-sim</h1>
        <p>
          A toy methylation (gene-silencing) simulator across generations with
          neighbor effects and an environmental “event window”.
        </p>
      </div>

      <div className="grid">
        <div className="panel">
          <h2>Parameters</h2>

          <div className="field">
            <label>Sites (N)</label>
            <input
              type="number"
              min={10}
              max={800}
              value={params.nSites}
              onChange={(e) =>
                setParams((p) => ({ ...p, nSites: Math.floor(num(e.target.value)) }))
              }
            />
          </div>

          <div className="field">
            <label>Generations (G)</label>
            <input
              type="number"
              min={10}
              max={3000}
              value={params.generations}
              onChange={(e) =>
                setParams((p) => ({
                  ...p,
                  generations: Math.floor(num(e.target.value)),
                }))
              }
            />
          </div>

          <div className="field">
            <label>Seed</label>
            <input
              type="number"
              value={params.seed}
              onChange={(e) =>
                setParams((p) => ({ ...p, seed: Math.floor(num(e.target.value)) }))
              }
            />
          </div>

          <div className="field">
            <label>pMaint</label>
            <input
              type="range"
              min={0}
              max={1}
              step={0.001}
              value={params.pMaint}
              onChange={(e) => setParams((p) => ({ ...p, pMaint: num(e.target.value) }))}
            />
          </div>
          <div className="small">Maintenance efficiency (H→M after replication)</div>

          <div className="field">
            <label>pDeNovo</label>
            <input
              type="range"
              min={0}
              max={0.2}
              step={0.0005}
              value={params.pDeNovo}
              onChange={(e) => setParams((p) => ({ ...p, pDeNovo: num(e.target.value) }))}
            />
          </div>
          <div className="small">De novo methylation probability</div>

          <div className="field">
            <label>pDemeth</label>
            <input
              type="range"
              min={0}
              max={0.05}
              step={0.0005}
              value={params.pDemeth}
              onChange={(e) => setParams((p) => ({ ...p, pDemeth: num(e.target.value) }))}
            />
          </div>
          <div className="small">Demethylation probability</div>

          <div className="field">
            <label>Neighbor β</label>
            <input
              type="range"
              min={0}
              max={12}
              step={0.1}
              value={params.beta}
              onChange={(e) => setParams((p) => ({ ...p, beta: num(e.target.value) }))}
            />
          </div>
          <div className="small">
            Cooperativity strength (0 = independent sites). Higher β encourages domains.
          </div>

          <h2 style={{ marginTop: 14 }}>Event window (“Famine”)</h2>

          <div className="field">
            <label>Start gen</label>
            <input
              type="number"
              min={0}
              max={params.generations}
              value={params.eventStart}
              onChange={(e) =>
                setParams((p) => ({ ...p, eventStart: Math.floor(num(e.target.value)) }))
              }
            />
          </div>

          <div className="field">
            <label>End gen</label>
            <input
              type="number"
              min={0}
              max={params.generations}
              value={params.eventEnd}
              onChange={(e) =>
                setParams((p) => ({ ...p, eventEnd: Math.floor(num(e.target.value)) }))
              }
            />
          </div>

          <div className="field">
            <label>Maint ×</label>
            <input
              type="number"
              step={0.01}
              value={params.eventMaintMult}
              onChange={(e) =>
                setParams((p) => ({ ...p, eventMaintMult: num(e.target.value) }))
              }
            />
          </div>

          <div className="field">
            <label>De novo ×</label>
            <input
              type="number"
              step={0.1}
              value={params.eventDeNovoMult}
              onChange={(e) =>
                setParams((p) => ({ ...p, eventDeNovoMult: num(e.target.value) }))
              }
            />
          </div>

          <div className="field">
            <label>Demeth ×</label>
            <input
              type="number"
              step={0.1}
              value={params.eventDemethMult}
              onChange={(e) =>
                setParams((p) => ({ ...p, eventDemethMult: num(e.target.value) }))
              }
            />
          </div>

          <div className="row">
            <button
              onClick={() =>
                setParams((p) => ({ ...p, seed: Math.floor(Math.random() * 1_000_000_000) }))
              }
            >
              Randomize seed
            </button>
            <button
              className="primary"
              onClick={() => setParams((p) => ({ ...p }))}
              title="Re-run with current parameters"
            >
              Re-run
            </button>
          </div>

          <p className="small" style={{ marginTop: 10 }}>
            Expression proxy shown is <code>1 - mean(methylation)</code>.
          </p>
        </div>

        <div className="charts">
          <div className="chartCard">
            <Plot
              data={[
                {
                  type: "heatmap",
                  z: heatmap.z,
                  x: heatmap.x,
                  y: heatmap.y,
                  colorscale: [
                    [0.0, "#f8fafc"],
                    [0.5, "#60a5fa"],
                    [1.0, "#111827"],
                  ],
                  zmin: 0,
                  zmax: 1,
                  colorbar: { title: "methyl" },
                },
              ]}
              layout={{
                title: "Methylation across sites and generations",
                height: 520,
                margin: { l: 60, r: 20, t: 50, b: 50 },
                xaxis: { title: "site index" },
                yaxis: { title: "generation", autorange: "reversed" },
                shapes,
              }}
              config={{ displayModeBar: false, responsive: true }}
              style={{ width: "100%" }}
            />
          </div>

          <div className="chartCard">
            <Plot
              data={[
                {
                  type: "scatter",
                  mode: "lines",
                  x: Array.from({ length: params.generations + 1 }, (_, g) => g),
                  y: result.expression,
                  line: { color: "#111827", width: 2 },
                  name: "expression",
                },
              ]}
              layout={{
                title: "Expression proxy over generations",
                height: 260,
                margin: { l: 60, r: 20, t: 50, b: 50 },
                xaxis: { title: "generation" },
                yaxis: { title: "expression (proxy)", range: [0, 1] },
                shapes: [
                  {
                    type: "rect",
                    xref: "x",
                    x0: params.eventStart,
                    x1: params.eventEnd,
                    yref: "paper",
                    y0: 0,
                    y1: 1,
                    fillcolor: "rgba(245, 158, 11, 0.18)",
                    line: { width: 0 },
                    layer: "below",
                  },
                ],
              }}
              config={{ displayModeBar: false, responsive: true }}
              style={{ width: "100%" }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}