#!/bin/sh

set -eo pipefail # exit on first failed command
n=litdown
cd $(dirname $0)/..

echo Running Litdown against $n.md
bin/$n.js -l $n.md
echo

echo Processing $n/Makefile
make -C $n
echo

echo Rearranging files
mv $n/$n.html $n/doc/
mkdir $n/log
mv $n/$n.json $n/log/
echo

echo Creating archives
rm -rf archives
mkdir archives
tar cjf archives/$n.tbz $n
tar czf archives/$n.tgz $n
zip -qr archives/$n.zip $n
echo

echo Replacing current files
rm -rf bin demo doc lib log t
mv $n/* .
rmdir $n
echo
