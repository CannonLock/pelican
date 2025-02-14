# Federation Development Docker Setup

The federation setup is intended to pull out all the pieces of the federation into their own pieces with their
own configs to enable easier development and testing on a single piece of the federation.

**This is built for OSX, if you are on Linux you can save yourself some time by running on the host network.**

## Relevant URLS

# Web UIs

- [Director Web UI (https://localhost:8400)](https://localhost:8400)
- [Registry Web UI (https://localhost:8300)](https://localhost:8300)
- [Origin Web UI (https://localhost:8200)](https://localhost:8200)
- [Cache Web UI (https://localhost:8100)](https://localhost:8100)

# XRootD

- [Origin XRootD (https://localhost:8201)](https://localhost:8201)
- [Cache XRootD (https://localhost:8101)](https://localhost:8101)

## Relevant Files

- `pelican.yaml` The pelican config file for pelican in a box
- `./data` The pelican data directory mounted on the Origin by default
- `.env.local` The environment variables used to proxy requests to the external pelican api
- `./config` The config directory that is mounted to `/etc/pelican`

## Web UI Password

Hardcoded to `test` for all web UIs
