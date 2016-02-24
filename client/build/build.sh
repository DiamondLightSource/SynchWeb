#!/bin/bash
HASH=`git log --pretty=format:'%h' -n 1`
echo "Building into: $HASH"

r.js -o build.js dir=../dist/$HASH
rm ../dist/$HASH/config.json
rm -rf ../dist/$HASH/templates
echo "Linking config.json"
cd ../dist/$HASH
ln -s ../../js/config.json config.json
