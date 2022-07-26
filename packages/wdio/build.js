const concat = require('concat');
const rimraf = require('rimraf');

void rimraf.sync('./dist/*.tsbuildinfo');

void concat(['./src/wdio.d.ts', './dist/index.d.ts'], './dist/index.d.ts')
    .then(result => console.log(result))
    .catch(err => console.error(`Failed generating wdio types`));
