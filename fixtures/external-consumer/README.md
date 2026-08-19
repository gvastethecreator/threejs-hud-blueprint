# External consumer fixture

The release test places a freshly packed `@scope/three-hud` tarball at `three-hud-package.tgz`, installs this directory without workspace linking, then typechecks/builds it. The tarball is generated and ignored.
