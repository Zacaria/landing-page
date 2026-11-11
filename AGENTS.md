# HaveSomeCode landing page

Static personal site. Production source is `client/`; `dist/` is generated. `DESIGN.md` defines the Editorial Authority system; design tokens and self-hosted fonts live in `client/assets/`. `tests/` contains site checks, `sketches/` earlier directions, and `submission/` award material. The Gatsby starter is separate from the production site.

## Development and checks

- `make dev` serves `client/` with `npx http-server`.
- `python3 tests/test_site.py -v` runs the site tests.
- `npx -y html-validate 'client/*.html'` and `npx -y @google/design.md lint DESIGN.md` validate HTML and design documentation; npx may download tools.
- `make build` deletes `dist/` and copies `client/` into it.

Preserve semantic content, no-JavaScript and reduced-motion fallbacks, accessible navigation, local assets, and the design specification. Refresh production audit claims after material changes.

## Boundaries

Vercel serves the production site; `make deploy-preview` and `make deploy-prod` build and deploy externally. Review the preview and validation before production deployment. Submission materials are not a submission: account, payment, publication and infrastructure actions need applicable authorization. Keep private information and credentials out of source and artifacts.

## Shared workspace rules

Read and follow the shared workspace policy for every project, including projects with real users.

@/home/hermes/repos/prompts-lib/AGENTS_WORKSPACE.md

## Shared building rules

Read the shared file below before changing this project. Its development rules apply only if the project has no real users yet; confirm that status before applying them. Existing project-specific security, data-preservation, and release requirements still apply.

@/home/hermes/repos/prompts-lib/AGENTS_BUILDING.md

Record project-specific corrections in this project's `## Lessons` section, not in the shared file.

## Lessons