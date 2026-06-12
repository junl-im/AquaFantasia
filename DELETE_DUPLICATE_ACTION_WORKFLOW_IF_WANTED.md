# Optional: remove the manual duplicate workflow from the Actions sidebar

This patch changes `.github/workflows/aqua-static-validate.yml` to manual-only, so it will not run on push.

If you want only one workflow name to appear in the GitHub Actions sidebar, delete this file after applying the patch:

```txt
.github/workflows/aqua-static-validate.yml
```

Keep this file if you want a manual validation button.
