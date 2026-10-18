#!/usr/bin/env node
const { runPaymentsCli } = require('../dist/cjs/doctor/run-payments-cli/run-payments-cli.js');

runPaymentsCli(process.argv.slice(2), process.cwd()).then(exitCode => {
    process.exitCode = exitCode;
});
