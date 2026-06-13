# AquaFantasia v6.0.0a CI Cache Setup Hotfix

## Purpose
Fix GitHub Actions failure in the `Setup Node` step when `actions/setup-node@v6` was configured with `cache: npm` but the repository did not contain a lock file.

## Fix
- Removed `cache: npm` from `.github/workflows/pages.yml`.
- Re-added `.github/workflows/aqua-static-validate.yml` as a manual-only workflow without npm cache, so existing repositories with this old file are overwritten safely instead of failing again.
- Kept Node 24 and `FORCE_JAVASCRIPT_ACTIONS_TO_NODE24=true`.
- Kept `npm install` instead of `npm ci`, because this project currently does not ship a lock file.

## Runtime
No gameplay runtime change. APP_VERSION remains `6.0.0` intentionally to avoid triggering unnecessary client cache migrations or v6.0 validation drift.
