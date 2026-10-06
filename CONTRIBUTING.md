# Contributing a node pack

1. **Build and test the nodes in N-WAVE.** Create them with **Add node → Custom process**, or
   use **Convert to custom node** on a node's Code tab. Use them in a workflow and run it, or
   export the project and run it with Nextflow.
2. **Export the pack.** Go to **Add node → Node packs → Export**, tick the nodes, and give the
   pack a name, a version (for example `1.0.0`), a description and an author. Click
   **Download pack**. N-WAVE checks the pack the way an import does before it downloads it.
3. **Check that it imports.** Import the file into a fresh browser, for example the
   [online demo](https://hcistudio.github.io/N-WAVE/) in a private window. Each node should
   import without errors.
4. **Add it here.** Fork this repository:
   - copy the file to `packs/<pack-id>-<version>.nwave-pack.json`;
   - add an entry to `index.json`, with `id`, `name` and `version` matching the pack, a
     short `description`, the `author`, and `url: "packs/<file>"`;
   - add a row to the table in `README.md`.

   Run `node scripts/check.mjs`, then open a pull request.

## Guidelines

- **One topic per pack**, such as "BAM tools" or "Text tools", with nodes that are useful
  on their own.
- **Keep node ids stable.** Saved workflows refer to nodes by id, so a new version of a
  pack must keep the ids of the nodes it still has.
- **New version, new file.**
  - Add `packs/<id>-<new-version>.nwave-pack.json` and point the index entry at it.
  - Remove the old file, unless you list it as a separate entry.
  - Bump the major version when you remove nodes, ports or settings.
- **Containers:** set a `container` directive in processes that need tools beyond a basic
  Linux image. Prefer versioned images from BioContainers or Seqera Containers.
- **nf-core:** nodes made from nf-core modules or subworkflows list them under `nfcore`.
  N-WAVE installs them on import, so don't copy module code into the pack.
- **No secrets** (tokens, passwords, private paths) in sources or settings.
- **License:** by contributing, you agree to publish your pack under this repository's
  license.

## Review

Maintainers check that:
- the pack imports into N-WAVE without errors;
- the processes do what their descriptions say;
- nothing in a source downloads or runs code it shouldn't.

`scripts/check.mjs` runs on every pull request and catches structural mistakes. It looks for
invalid ids, index entries that don't match their files, and sources that don't declare
their process.
