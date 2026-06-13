# v6.0.0a CI Cache Hotfix Checklist

- [x] Setup Node no longer uses `cache: npm` without a lock file.
- [x] Push workflow remains `.github/workflows/pages.yml`.
- [x] Legacy/manual validation workflow is safe if it still exists in the user's repo.
- [x] Node 24 remains enabled.
- [x] Install uses `npm install`, not `npm ci`.
- [x] No runtime/gameplay version bump required.
