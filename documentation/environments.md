# Frontend environments

Builds use production optimisation in both hosted environments. `VUE_APP_ENVIRONMENT` selects `dev` or `live`; it does not depend on the Git branch or hostname. Local development defaults to dev, and builds default to live for compatibility.

| Branch | Site | API | S3 destination | CloudFront |
| --- | --- | --- | --- | --- |
| dev | https://causef.bouchelle.co.uk | https://causeapi.bouchelle.co.uk | s3://causef.jamiebuckell.co.uk/development/ | E2G9Q9M0SNBI07 |
| main | https://portal.cause-foundation.org.uk | https://api.cause-foundation.org.uk | s3://causef.jamiebuckell.co.uk/ | E3S4Z05K6XBLYL |

The dev CloudFront origin uses `/development` and maps missing SPA routes to its own `/index.html`. Its GitHub role can write only the development prefix and invalidate only the dev distribution. The production workflow must not sync with `--delete` at the bucket root, because the development files share the bucket.

Pushes to dev run `deploy-dev.yml`. Pushes to main run `deploy-main.yml`. Each workflow also checks its branch for manual dispatches. Do not use the legacy `npm run deploy` script for dev: it targets the production bucket root.

`/version.json` records the environment, full source commit and build version. Compare this file between domains to identify deployed code. No account or email action is needed.
