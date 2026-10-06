# N-WAVE node packs

Community node packs for [N-WAVE](https://github.com/HCIstudio/N-WAVE). A node pack is a
JSON file holding one or more custom nodes. Each node has its Nextflow process or workflow,
its ports and settings, and the nf-core modules it includes.

N-WAVE lists the packs in [`index.json`](index.json) under
**Add node → Node packs → Import → Community packs**. Click **Load**, check the preview,
and import. The nodes then appear in the node menu under "Pack: \<name\>". This works in
the Docker install and in the [online demo](https://hcistudio.github.io/N-WAVE/).

Adding a node to N-WAVE for everyone is a pull request to this repository, not to N-WAVE.
See [CONTRIBUTING.md](CONTRIBUTING.md).

## Layout

| Path | What it is |
| --- | --- |
| `index.json` | The list of packs N-WAVE shows (`format: "n-wave-node-pack-index"`). |
| `packs/` | The pack files, `<pack-id>-<version>.nwave-pack.json`. |
| `scripts/check.mjs` | Checks the index and pack files; runs on every pull request. |

The pack format is described on the N-WAVE wiki page
[Node packs](https://github.com/HCIstudio/N-WAVE/blob/main/wiki/Node-Packs.md).

## Packs

| Pack | Version | Nodes |
| --- | --- | --- |
| Text tools (`text-tools`) | 1.0.0 | Head lines, Count lines. A starter pack and an example of the format. |
