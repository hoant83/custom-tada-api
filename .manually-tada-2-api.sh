#!/bin/sh
git checkout develop
git pull origin develop
yarn
yarn build
yarn install --production
(cd dist; zip -r ../dist.zip .)
zip -r node_modules.zip ./node_modules
scp -r ./dist.zip netpower@192.168.181.173:/home/netpower/builds/tada-2/api
scp -r ./node_modules.zip netpower@192.168.181.173:/home/netpower/builds/tada-2
ssh netpower@192.168.181.173 "sh /home/netpower/scripts/tada-2/azure-api.sh"
