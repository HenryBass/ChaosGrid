#! /usr/bin/env bash

set -eux

# docker build -t sconaway/chaosgrid:amd64-latest .
# docker build -t sconaway/chaosgrid:arm64-latest -f Dockerfile.arm64 .

docker buildx build --platform linux/amd64 --push --tag sconaway/chaosgrid:amd64-latest .
docker buildx build --platform linux/arm64 --push --tag sconaway/chaosgrid:arm64-latest -f Dockerfile.arm64 .

docker manifest create sconaway/chaosgrid:latest sconaway/chaosgrid:amd64-latest sconaway/chaosgrid:arm64-latest

docker manifest annotate --arch amd64 sconaway/chaosgrid:latest sconaway/chaosgrid:amd64-latest
docker manifest annotate --arch arm64 sconaway/chaosgrid:latest sconaway/chaosgrid:arm64-latest

docker manifest push --purge sconaway/chaosgrid
