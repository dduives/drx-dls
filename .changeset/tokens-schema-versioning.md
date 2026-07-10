---
"@drx-dls/tokens": minor
---

Add schema versioning + validation for theme inputs. `validateThemeInputs`, `migrateThemeInputs`, `formatValidationIssue`, and `CURRENT_SCHEMA_VERSION` are now exported; `drx-theme build` validates loaded `drx.theme.json` files (failing with clear messages on invalid shapes/versions) and migrates older files before generating a theme. Per-app files may declare a `version` field.
