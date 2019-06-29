#!/bin/bash

echo
echo NODE_ENV=development
echo ====================
NODE_ENV=development node index.js
echo
echo NODE_ENV=production
echo ====================
NODE_ENV=production node index.js
echo
echo NODE_CONFIG
echo ====================
NODE_ENV=production \
  NODE_CONFIG="{@my/app:{backend:{other:'passed-via-NODE_CONFIG'}}}" \
  DEBUG=configg \
  node index.js
