const { withPlugins } = require('@expo/config-plugins');
const { withApplePay } = require('./with-apple-pay');
const { withGooglePay } = require('./with-google-pay');

const withPayments = (config) => {
  return withPlugins(config, [
    withApplePay,
    withGooglePay
  ]);
};

module.exports = withPayments;