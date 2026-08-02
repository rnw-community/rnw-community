package com.payments;

import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReadableArray;
import com.facebook.react.bridge.ReadableMap;

abstract class PaymentsSpec extends ReactContextBaseJavaModule {
  PaymentsSpec(ReactApplicationContext context) {
    super(context);
  }

  public abstract void show(String requestId, String paymentMethodData, ReadableMap details, Promise promise);
  public abstract void canMakePayments(String paymentMethodData, Promise promise);
  public abstract void abort(Promise promise);
  public abstract void complete(String paymentComplete, Promise promise);
  public abstract void setActiveEvents(String requestId, ReadableArray eventNames, Promise promise);
  public abstract void updatePaymentDetails(ReadableMap update, ReadableArray displayItems, ReadableArray shippingOptions, Promise promise);
  public abstract void addListener(String eventName);
  public abstract void removeListeners(double count);
}
