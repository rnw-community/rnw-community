package com.payments

import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReadableArray
import com.facebook.react.bridge.ReadableMap

abstract class PaymentsSpec internal constructor(context: ReactApplicationContext) : ReactContextBaseJavaModule(context) {
  abstract fun show(requestId: String, paymentMethodData: String, details: ReadableMap, promise: Promise)
  abstract fun canMakePayments(paymentMethodData: String, details: ReadableMap, promise: Promise)
  abstract fun hasEnrolledInstrument(paymentMethodData: String, details: ReadableMap, promise: Promise)
  abstract fun abort(promise: Promise)
  abstract fun complete(paymentComplete: String, promise: Promise)
  abstract fun retry(requestId: String, errorFields: ReadableMap, promise: Promise)
  abstract fun setActiveEvents(requestId: String, eventNames: ReadableArray, promise: Promise)
  abstract fun updatePaymentDetails(update: ReadableMap, displayItems: ReadableArray, shippingOptions: ReadableArray, promise: Promise)
  abstract fun addListener(eventName: String)
  abstract fun removeListeners(count: Double)
}
