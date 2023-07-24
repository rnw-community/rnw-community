package com.payments;

import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReadableMap;

abstract class PaymentsSpec extends ReactContextBaseJavaModule {
  PaymentsSpec(ReactApplicationContext context) {
    super(context);
  }

  public abstract void show(String paymentMethodData, ReadableMap details, Promise promise);
  public abstract void canMakePayments(String paymentMethodData, Promise promise);
  public abstract void abort(Promise promise);
}
