#!/bin/bash
set -e

if [ "$TRAVIS_PULL_REQUEST" != "false" ]; then
  echo "We are in a pull request, not setting up release"
  exit 0
fi

if [[ $TRAVIS_BRANCH == 'master' ]]; then
  git config --global user.email $GH_EMAIL
  git config --global user.name $GH_USER
  git config --global push.default simple

  git checkout master
  git remote set-url origin https://$GH_USER:$GH_TOKEN@github.com/MailOnline/mol-video-ad-sdk.git
  git pull

  git fetch --tags
  git branch -u origin/$TRAVIS_BRANCH
  git fsck --full #debug

  yarn build

  lerna publish --conventional-commits --skip-git skip-npm --registry //registry.npmjs.org/:_authToken=${NPM_TOKEN} --yes

  NEW_PACKAGE_VERSION = node -pe "require('./lerna.json').version"

  git commit -am "$NEW_PACKAGE_VERSION"
  git tag -a "v$NEW_PACKAGE_VERSION" -m "$NEW_PACKAGE_VERSION"
  git push && git push --tags;
fi