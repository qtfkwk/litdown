#!/bin/sh

# purpose: runs each backend once against litdown.md
#
# usage: $1 [-k]
#
# options
# -k   Keep directories

set -eo pipefail
cd $(dirname $0)/..
if [ "$1" == "-k" ]; then
	mkdir backends
fi
for b in commonmark markdown-it marked; do
	echo $b
	rm -rf $b
	time bin/litdown.js -b $b litdown.md >/dev/null
	if [ "$1" == "-k" ]; then
		mv litdown backends/$b
	else
		rm -rf litdown
	fi
	echo
done
