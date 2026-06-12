# Aqua Fantasia v5.5.3 Single Actions Flow Fix

## Why this patch exists

After the v5.5.2c CI repair, GitHub Actions could appear to run twice on every push because two workflow files were present at the same time:

- `.github/workflows/pages.yml` from the original GitHub Pages deployment setup
- `.github/workflows/aqua-static-validate.yml` added by the v5.5 mobile validation patch

A ZIP overwrite patch cannot delete old files that already exist in the repository, so both workflows could remain active after extraction.

## What changed

- `.github/workflows/pages.yml` is now the single automatic push workflow.
- It validates, typechecks, audits, checks runtime files, checks renderer files, checks atlas files, writes the clean report, and deploys to GitHub Pages in one job.
- `.github/workflows/aqua-static-validate.yml` is changed to manual-only `workflow_dispatch` so it no longer runs automatically on push.
- `tools/check-v55-mobile-feel.mjs` and `tools/check-v552-ci-hotfix.mjs` now accept either `pages.yml` or `aqua-static-validate.yml` as the validation workflow, so the old static workflow can be safely deleted later.
- Node 24 and `FORCE_JAVASCRIPT_ACTIONS_TO_NODE24=true` are kept.

## Optional cleanup

If you want only one workflow to appear in the GitHub Actions sidebar, delete this file manually after applying the patch:

```txt
.github/workflows/aqua-static-validate.yml
```

The project will still validate and deploy through:

```txt
.github/workflows/pages.yml
```
