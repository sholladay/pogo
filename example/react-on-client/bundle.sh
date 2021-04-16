#!/usr/bin/env bash

mkdir -p build

deno bundle ./client/app.jsx ./build/app.js
