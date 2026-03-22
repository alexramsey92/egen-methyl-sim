# egen-methyl-sim

Interactive epigenetic methylation simulator showing how environmental shocks can influence gene silencing across generations.

## What this is
This project is a **toy epigenetics simulator** meant for intuition-building and public outreach, with enough structure to be academically interpretable.

- We simulate a single lineage across discrete **generations**.
- Each site can be unmethylated / hemimethylated / fully methylated.
- Methylation is treated as a **gene-silencing mark** (proxy):
  - `silencing = mean(methylation)`
  - `expression = 1 - silencing`
- A configurable event window (e.g. a famine) temporarily changes methylation dynamics.

## How the “event” works (public-friendly)
Think of DNA as a cookbook and methylation as sticky-note annotations that tend to *mute* certain recipes. A major event (e.g. famine) can change how frequently those notes are added/removed/copied. Even when the event ends, copies can carry the altered annotation pattern forward for some time.

## Scientific grounding (careful wording)
- DNA methylation is a widely studied epigenetic mark and is **often associated** with transcriptional repression, especially when occurring in regulatory contexts. The relationship is **context dependent**.
- Maintenance methylation during DNA replication provides a mechanism for marks to be copied across cell divisions; the extent to which environmentally induced marks persist across generations varies by organism, locus, and developmental context.
- This simulator does **not** claim any specific historical event (including the Irish potato famine) caused a particular methylation pattern; the “event” is an intuitive way to explore *how rate changes could propagate* in a simplified model.

## Turnkey local dev (Laravel Herd)
This repo is structured to be run as a static web app served locally.

### Prereqs
- **Laravel Herd** installed
- **Node.js** (LTS) + npm

### Run
1. In Herd, add this repository as a site (any local domain is fine).
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the dev server:
   ```bash
   npm run dev
   ```
4. Open the Herd site URL.

> Note: if you prefer, you can also run without Herd using `npm run dev` and open the localhost URL Vite prints.

## Planned MVP UI
- Heatmap: CpG/site index × generation, color = methylation level (0, 0.5, 1)
- Line: expression proxy vs generation
- Shaded event window
- Sliders for parameters + random seed

## License
TBD