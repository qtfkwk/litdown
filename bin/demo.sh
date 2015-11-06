#!/bin/sh
run_test() { autoreconf -vi && ./configure && make check; }
view_log() { cat src/test-suite.log; }
cd $(dirname $0)/../demo
cd 1; run_test; view_log; cd ..
cd 2; run_test; cd ..
cd 3; run_test; view_log; cd ..
cd 4; run_test; cd ..
