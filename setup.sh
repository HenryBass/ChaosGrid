#! /bin/sh

set -eux

echo $(uname -a)

ls -la

npm i

rm -rf /root/.cache
