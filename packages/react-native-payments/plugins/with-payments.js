const { withPlugins } = require('@expo/config-plugins');
const { withApplePay } = require('./withApplePay');
const { withGooglePay } = require('./withGooglePay');

const withPayments = (config) => {
  return withPlugins(config, [
    withApplePay,
    withGooglePay
  ]);
};

module.exports = withPayments;