package com.payments;

import com.facebook.react.bridge.ReactApplicationContext;

abstract class PaymentsSpec extends NativePaymentsSpec {
  PaymentsSpec(ReactApplicationContext context) {
    super(context);
  }
}
