#!/bin/sh
git checkout feature/dev-p2-sa
git pull origin feature/dev-p2-sa
yarn
yarn build
yarn install --production
(cd dist; zip -r ../dist.zip .)
zip -r node_modules.zip ./node_modules
scp -r ./dist.zip tadatruck@13.212.5.196:/home/tadatruck/builds/tada/api
scp -r ./node_modules.zip tadatruck@13.212.5.196:/home/tadatruck/builds/tada
ssh tadatruck@13.212.5.196 "sh /home/tadatruck/scripts/tada/azure-api.sh"
