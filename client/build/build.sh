#!/bin/bash
r.js -o build.js dir=../dist/$1
rm ../dist/$1/config.json
rm -rf ../dist/$1/templates