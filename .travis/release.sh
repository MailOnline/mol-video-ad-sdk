#!/bin/bash
set -e

BRANCH="`git symbolic-ref HEAD | cut -d/ -f3-`";

if [ "$BRANCH" != "master" ]; then
  echo "We are not in master branch, release canceled"
  exit 0
fi

if [[ "$BRANCH" == 'master' ]]; then
  git fetch --tags
  git fsck --full

  yarn build

  lerna publish --conventional-commits --skip-git --npm-client=npm --registry //registry.npmjs.org/:_authToken=${NPM_TOKEN} --yes

  NEW_PACKAGE_VERSION = node -pe "require('./lerna.json').version"

  git commit -am "$NEW_PACKAGE_VERSION"
  git tag -a "v$NEW_PACKAGE_VERSION" -m "$NEW_PACKAGE_VERSION"
  git push && git push --tags;
fi