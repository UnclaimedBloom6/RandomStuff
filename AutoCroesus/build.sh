#!/bin/bash

cd "$(dirname "$0")"
cd ../

rm -rf AutoCroesus/out/

mkdir AutoCroesus/out
mkdir AutoCroesus/out/AutoCroesus

rsync -rv --exclude-from=".gitignore"\
    --exclude="build.sh"\
    --exclude="data/*.json"\
    --exclude="data/*.txt"\
    --exclude="out/"\
    AutoCroesus/* AutoCroesus/out/AutoCroesus/

cd AutoCroesus/out/
zip -r AutoCroesus.zip AutoCroesus/
rm -r AutoCroesus