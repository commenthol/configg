#!/bin/bash

echo
echo index-database.js
echo ====================
echo NODE_ENV=development
echo ====================
NODE_ENV=development node index-database.js
echo
echo NODE_ENV=production
echo ====================
NODE_ENV=production node index-database.js
echo
echo NODE_CONFIG
echo ====================
NODE_ENV=production \
  NODE_CONFIG="{@my/app:{backend:{other:'passed-via-NODE_CONFIG'}},my-database:{credentials:{pass:'secret-passed-via-NODE_CONFIG'}}}" \
  DEBUG=configg \
  node index-database.js
