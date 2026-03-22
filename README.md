# egen-methyl-sim

<img width="1824" height="1286" alt="Screenshot 2026-03-22 155214" src="https://github.com/user-attachments/assets/258cf693-fe0a-4c31-b69a-90ff7c75d670" />


Interactive epigenetic methylation simulator showing how environmental shocks can influence gene silencing across generations.

## What this is
This project is a **toy epigenetics simulator** meant for intuition-building and public outreach, with enough structure to be academically interpretable.

- We simulate a single lineage across discrete **generations**.
- Each site can be unmethylated / hemimethylated / fully methylated.
- Methylation is treated as a **gene-silencing mark** (proxy):
  - `silencing = mean(methylation)`
  - `expression = 1 - silencing`
- A configurable event window (e.g. a famine) temporarily changes methylation dynamics.

## How the “event” works 
Think of DNA as a cookbook and methylation as sticky-note annotations that tend to *mute* certain recipes. A major event (e.g. famine) can change how frequently those notes are added/removed/copied. Even when the event ends, copies can carry the altered annotation pattern forward for some time.

### Prereqs
- **Node.js** (LTS) + npm

### Run

1. Install dependencies:
   ```bash
   npm install
   ```
2. Start the dev server:
   ```bash
   npm run dev
   ```

