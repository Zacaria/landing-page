# HaveSomeCode landing page

Static personal landing page for Zacaria Chtatar. The production source is in `client/`; `dist/` is the clean build output.

## Local development

```sh
make dev
```

## Validation and build

```sh
python3 tests/test_site.py -v
npx -y html-validate 'client/*.html'
npx -y @google/design.md lint DESIGN.md
make build
```

`make build` removes the previous output before copying `client/` to `dist/`.

## Visual identity

- `DESIGN.md` is the normative Editorial Authority design specification.
- `client/assets/design-tokens.json` is its W3C DTCG export.
- `client/assets/social-card.png` is the 1200×630 social preview; its editable source is `sketches/social-card-source.html`.
- `sketches/` preserves the three visual directions evaluated before production implementation.
- `client/assets/fonts/` contains the self-hosted WOFF2 type system; SIL Open Font License notices are in `licenses/`.

## Award-readiness

- `AWARD-READINESS.md` records current award criteria, recent references, design constraints, and the target rubric.
- `submission/README.md` contains jury-facing copy, measured scores, submission assets, and the final deployment checklist.
- `submission/scorecard.json` is the machine-readable Lighthouse and verification summary.

## Deployment

The production project is `havesomecode-landing` on Vercel. `www.havesomecode.io` is its production domain; the apex domain remains a Gandi-managed redirect to `www`.

```sh
make deploy-preview
# After reviewing the preview and completing validation:
make deploy-prod
```

The tracked GitHub workflow performs verification only. Vercel owns production delivery; the landing page no longer uses repository AWS credentials or S3 deployment commands.

## Generate responsive images

https://responsivebreakpoints.com/