# Container Runtime

This folder contains the production container entrypoint used by `Dockerfile`.

Supported startup modes:

- Default baked-image startup using the source and build artifacts copied into the image
- Optional Git sync on container boot using `GIT_SYNC_ENABLED=true`
- Optional rebuild on container boot using `BUILD_ON_START=true`

Persistent runtime data should live under `/opt/cxnext/runtime`:

- `/opt/cxnext/runtime/config/runtime-config.json`
- `/opt/cxnext/runtime/storage`
