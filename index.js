#!/usr/bin/env node
const fs   = require('fs');
const path = require('path');

const config = JSON.parse(fs.readFileSync(path.join(__dirname, 'config.json'), 'utf-8'));

if (config.use === 'metaobjects') {
  require('./metaobjects.js');
} else {
  console.error(`Usage "${config.use}" non pris en charge.`);
  process.exit(1);
}
