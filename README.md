# node-agent

Kubernetes node temperature exporter. The agent listens on port 80 and serves
`node_temp_celcius` at `/metrics` and `/metrics/`, reading millidegrees from
`/sys/class/thermal/thermal_zone0/temp`. `NODE_NAME` identifies the node in startup
logs. Preserve the existing metric spelling for dashboard compatibility.

## Build and verify

Use the pinned Node 24 LTS base and locked production dependencies:

```sh
docker build -t node-agent:verify .
docker run --rm --network none -v "$PWD/test:/app/test:ro" node-agent:verify npm test
docker run --rm node-agent:verify npm audit --omit=dev
```

The test starts the real entrypoint inside an isolated container with a thermal
read fixture. It checks the sensor command, Celsius conversion, exact metric,
content type, both scrape paths, unknown-route response and startup configuration.
It publishes no host ports and does not read or modify a real sensor.

## Release

Push changes to `main`. The workflow verifies actual runtime/package versions,
metrics compatibility and current production/OS advisories on native AMD64 and
ARM64 runners. High or critical scanner findings block publication, including
findings without an available fix. After verification, push a new `vX.Y.Z` tag
matching `package.json`. The tag workflow repeats verification before publishing
`ghcr.io/edwmurph/node-agent:X.Y.Z` for both architectures. It leaves `latest`
unchanged. Deploy using the published manifest digest, never a mutable tag.

Cluster rollout belongs to the personal repository. Keep old image versions until
running consumers and required rollback references are cleared and verified.
