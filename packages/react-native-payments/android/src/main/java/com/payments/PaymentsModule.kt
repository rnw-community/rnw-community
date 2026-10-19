package com.payments

import android.app.Activity
import android.content.Intent
import android.content.IntentSender
import android.util.Log
import com.facebook.react.bridge.BaseActivityEventListener
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.ReadableArray
import com.facebook.react.bridge.ReadableMap
import com.facebook.react.bridge.WritableMap
import com.facebook.react.modules.core.DeviceEventManagerModule
import com.google.android.gms.common.ConnectionResult
import com.google.android.gms.common.GoogleApiAvailability
import com.google.android.gms.common.api.ApiException
import com.google.android.gms.common.api.ResolvableApiException
import com.google.android.gms.tasks.Task
import com.google.android.gms.wallet.IsReadyToPayRequest
import com.google.android.gms.wallet.PaymentData
import com.google.android.gms.wallet.PaymentDataRequest
import com.google.android.gms.wallet.Wallet
import com.google.android.gms.wallet.WalletConstants
import com.google.android.gms.wallet.contract.TaskResultContracts
import org.json.JSONException
import org.json.JSONObject

// HINT: To see crashes use: `adb logcat "*:S" AndroidRuntime:E`
// HINT: Check this setup: https://developers.google.com/pay/api/android/guides/setup Add it to the docs
class PaymentsModule internal constructor(context: ReactApplicationContext) : PaymentsSpec(context) {
  // TODO: Promise ref, should resolve/reject when the payment is done/cancelled/error
  private var pendingPromise: Promise? = null

  private val changeEventCoordinator = PaymentsChangeEventCoordinator(::emitChangeEvent)
  private val changeEventsTask = PaymentsChangeEventsTask(context)

  // https://reactnative.dev/docs/native-modules-android#getting-activity-result-from-startactivityforresult
  private val activityEventListener = object : BaseActivityEventListener() {
    // https://developers.google.com/pay/api/android/guides/tutorial#java
    override fun onActivityResult(activity: Activity, requestCode: Int, resultCode: Int, data: Intent?) {
      Log.d(NAME, "Received onActivityResult: $requestCode $resultCode")

      if (requestCode != LOAD_MASKED_WALLET_REQUEST_CODE) {
        return
      }

      closeSheet()

      when (resultCode) {
        Activity.RESULT_OK -> {
          val paymentData = PaymentData.getFromIntent(data!!)
          Log.d(NAME, "Received payment: $paymentData")
          handlePaymentSuccess(paymentData!!)
        }

        Activity.RESULT_CANCELED ->
          rejectPromise(E_CANCELLED_BY_USER, "User closed AndroidPay without completing the payment")

        else -> handleError(TaskResultContracts.GetPaymentDataResult().parseResult(resultCode, data).status.statusCode)
      }
    }
  }

  init {
    context.addActivityEventListener(activityEventListener)
    PaymentsCallbackBridge.attach(changeEventCoordinator)
  }

  override fun invalidate() {
    PaymentsCallbackBridge.detach(changeEventCoordinator)
    changeEventCoordinator.invalidate()
    changeEventsTask.finish()
    reactApplicationContext.removeActivityEventListener(activityEventListener)

    super.invalidate()
  }

  override fun getName(): String = NAME

  // Implementation See https://reactnative.dev/docs/native-modules-android

  // https://developers.google.com/android/reference/com/google/android/gms/wallet/PaymentsClient#isReadyToPay(com.google.android.gms.wallet.IsReadyToPayRequest)
  // https://developers.google.com/pay/api/android/guides/tutorial#java
  @ReactMethod
  override fun canMakePayments(paymentMethodData: String, details: ReadableMap, promise: Promise) {
    checkIsReadyToPay(paymentMethodData, details, false, promise)
  }

  // HINT: existingPaymentMethodRequired is an optimistic signal, not a guarantee a card is enrolled.
  // https://developers.google.com/android/reference/com/google/android/gms/wallet/IsReadyToPayRequest.Builder#setExistingPaymentMethodRequired(boolean)
  @ReactMethod
  override fun hasEnrolledInstrument(paymentMethodData: String, details: ReadableMap, promise: Promise) {
    checkIsReadyToPay(paymentMethodData, details, true, promise)
  }

  private fun checkIsReadyToPay(
    paymentMethodData: String,
    details: ReadableMap,
    existingPaymentMethodRequired: Boolean,
    promise: Promise
  ) {
    val currentActivity = requireCurrentActivity()
    Log.d(NAME, "Checking if AndroidPay is available $currentActivity")

    if (isGooglePlayServicesUnavailable(currentActivity)) {
      promise.reject(E_UNSUPPORTED_ANDROID_PAY, "AndroidPay is not supported: Google Play services is unavailable")
      return
    }

    if (!isValidPaymentRequestJSON(paymentMethodData)) {
      promise.reject(E_FAILED_PARSING_PAYMENT_REQUEST, FAILED_PARSING_PAYMENT_REQUEST_MESSAGE)
      return
    }

    // https://developers.google.com/android/reference/com/google/android/gms/wallet/PaymentDataRequest#fromJson(java.lang.String)
    val request: IsReadyToPayRequest? =
      if (existingPaymentMethodRequired) {
        buildExistingPaymentMethodRequiredRequest(paymentMethodData)
      } else {
        IsReadyToPayRequest.fromJson(paymentMethodData)
      }

    if (request == null) {
      promise.reject(E_UNSUPPORTED_ANDROID_PAY, "AndroidPay is not supported")
      return
    }

    // https://developers.google.com/android/reference/com/google/android/gms/wallet/Wallet.WalletOptions.Builder#setEnvironment(int)
    val options = Wallet.WalletOptions.Builder().setEnvironment(getEnvironment(details)).build()

    // https://developers.google.com/android/reference/com/google/android/gms/wallet/PaymentsClient
    val paymentsClient = Wallet.getPaymentsClient(currentActivity, options)

    paymentsClient.isReadyToPay(request).addOnCompleteListener { task ->
      if (task.isSuccessful) {
        promise.resolve(task.result)
      } else {
        promise.reject(E_UNSUPPORTED_ANDROID_PAY, "AndroidPay is not supported")
      }
    }
  }

  // Wallet.getPaymentsClient(...) itself never fails; it is the chained isReadyToPay()/loadPaymentData()
  // call that reaches into Play services and, on a device where it is missing or invalid, surfaces an
  // unrecoverable system dialog over the whole screen instead of failing the task. Checking availability
  // first keeps that dialog from ever appearing and reports AndroidPay as unsupported instead, exactly
  // like https://developers.google.com/android/guides/api-client recommends for any Play services caller.
  private fun isGooglePlayServicesUnavailable(activity: Activity): Boolean =
    GoogleApiAvailability.getInstance().isGooglePlayServicesAvailable(activity) != ConnectionResult.SUCCESS

  private fun buildExistingPaymentMethodRequiredRequest(paymentMethodData: String): IsReadyToPayRequest? =
    try {
      val requestJson = JSONObject(paymentMethodData)
      requestJson.put("existingPaymentMethodRequired", true)

      IsReadyToPayRequest.fromJson(requestJson.toString())
    } catch (e: JSONException) {
      null
    }

  @ReactMethod
  override fun show(requestId: String, paymentMethodData: String, details: ReadableMap, promise: Promise) {
    val currentActivity = requireCurrentActivity()
    Log.d(NAME, "Showing AndroidPay for request $requestId $currentActivity$details")

    // HINT: We store promise reference to resolve/reject it later
    pendingPromise = promise

    if (isGooglePlayServicesUnavailable(currentActivity)) {
      rejectPromise(E_FAILED_SHOWING_ANDROID_PAY, "Failed showing AndroidPay: Google Play services is unavailable")
      return
    }

    if (!isValidPaymentRequestJSON(paymentMethodData)) {
      rejectPromise(E_FAILED_PARSING_PAYMENT_REQUEST, FAILED_PARSING_PAYMENT_REQUEST_MESSAGE)
      return
    }

    try {
      // https://developers.google.com/android/reference/com/google/android/gms/wallet/PaymentDataRequest#fromJson(java.lang.String)
      val request: PaymentDataRequest? = PaymentDataRequest.fromJson(paymentMethodData)

      if (request == null) {
        rejectPromise(E_FAILED_CREATING_PAYMENT_REQUEST, "Failed creating PaymentDataRequest")
        return
      }

      Log.d(NAME, "Created PaymentDataRequest $request")

      if (changeEventCoordinator.onShow(requestId, paymentMethodData)) {
        changeEventsTask.start()
      }

      // https://developers.google.com/android/reference/com/google/android/gms/wallet/Wallet.WalletOptions.Builder#setEnvironment(int)
      val options = Wallet.WalletOptions.Builder().setEnvironment(getEnvironment(details)).build()

      // https://developers.google.com/android/reference/com/google/android/gms/wallet/PaymentsClient
      val paymentsClient = Wallet.getPaymentsClient(currentActivity, options)

      // https://developers.google.com/android/reference/com/google/android/gms/wallet/PaymentsClient#public-taskpaymentdata-loadpaymentdata-paymentdatarequest-request
      val loadPaymentDataTask = paymentsClient.loadPaymentData(request)

      loadPaymentDataTask.addOnCompleteListener { completedTask ->
        handleLoadPaymentDataTask(completedTask, currentActivity)
      }
    } catch (e: Exception) {
      closeSheet()
      rejectPromise(E_FAILED_SHOWING_ANDROID_PAY, "Failed showing AndroidPay$e")
    }
  }

  @ReactMethod
  override fun abort(promise: Promise) {
    Log.d(NAME, "Aborting AndroidPay for ${requireCurrentActivity()}")

    closeSheet()

    promise.resolve("AndroidPay abort is not supported")
  }

  @ReactMethod
  override fun complete(paymentComplete: String, promise: Promise) {
    Log.d(NAME, "Completing status $paymentComplete AndroidPay for ${requireCurrentActivity()}")

    promise.resolve("AndroidPay complete is not supported")
  }

  // https://www.w3.org/TR/payment-request/#dom-paymentresponse-retry
  @ReactMethod
  override fun retry(requestId: String, errorFields: ReadableMap, promise: Promise) {
    Log.d(NAME, "In-sheet retry is not supported by AndroidPay, ignoring $requestId")

    promise.resolve("AndroidPay retry is not supported")
  }

  @ReactMethod
  override fun setActiveEvents(requestId: String, eventNames: ReadableArray, promise: Promise) {
    changeEventCoordinator.setActiveEvents(requestId, eventNames)

    promise.resolve(null)
  }

  @ReactMethod
  override fun updatePaymentDetails(
    update: ReadableMap,
    displayItems: ReadableArray,
    shippingOptions: ReadableArray,
    promise: Promise
  ) {
    changeEventCoordinator.updatePaymentDetails(update, displayItems, shippingOptions, promise)
  }

  @ReactMethod
  override fun addListener(eventName: String) {
    changeEventCoordinator.addListener()
  }

  @ReactMethod
  override fun removeListeners(count: Double) {
    changeEventCoordinator.removeListeners(count.toInt())
  }

  private fun emitChangeEvent(eventName: String, body: WritableMap): Boolean {
    if (!reactApplicationContext.hasActiveReactInstance()) {
      Log.w(NAME, "Dropping the '$eventName' change event, the React instance is not active")

      return false
    }

    reactApplicationContext
      .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
      .emit(eventName, body)

    return true
  }

  private fun closeSheet() {
    changeEventCoordinator.onSheetClosed()
    changeEventsTask.finish()
  }

  private fun handleLoadPaymentDataTask(task: Task<PaymentData>, activity: Activity) {
    if (task.isSuccessful) {
      closeSheet()
      handlePaymentSuccess(task.result)

      return
    }

    when (val exception = task.exception) {
      is ResolvableApiException -> startPaymentSheet(exception, activity)
      is ApiException -> {
        closeSheet()
        handleError(exception.statusCode)
      }
      else -> {
        closeSheet()
        rejectPromise(E_FAILED_SHOWING_ANDROID_PAY, "Failed showing AndroidPay$exception")
      }
    }
  }

  private fun startPaymentSheet(exception: ResolvableApiException, activity: Activity) {
    try {
      exception.startResolutionForResult(activity, LOAD_MASKED_WALLET_REQUEST_CODE)
    } catch (e: IntentSender.SendIntentException) {
      closeSheet()
      rejectPromise(E_FAILED_SHOWING_ANDROID_PAY, "Failed showing AndroidPay$e")
    }
  }

  private fun requireCurrentActivity(): Activity = reactApplicationContext.currentActivity!!

  // https://developers.google.com/pay/api/android/guides/tutorial#checkoutactivity.java-java
  // https://developers.google.com/android/reference/com/google/android/gms/wallet/PaymentData
  // https://developers.google.com/pay/api/android/reference/request-objects#PaymentData
  private fun handlePaymentSuccess(paymentData: PaymentData) {
    val paymentInfo: String? = paymentData.toJson()
    if (paymentInfo == null) {
      rejectPromise(E_FAILED_PARSING_PAYMENT_RESPONSE, "Failed parsing payment response")
      return
    }

    Log.d(NAME, "Successfully received paymentData: ${requireCurrentActivity()} $paymentInfo")

    pendingPromise!!.resolve(paymentInfo)
    pendingPromise = null
  }

  // At this stage, the user has already seen a popup informing them an error occurred, so only logging is required.
  // https://developers.google.com/android/reference/com/google/android/gms/wallet/WalletConstants#constant-summary
  private fun handleError(statusCode: Int) {
    val errorMessage =
      when (statusCode) {
        WalletConstants.ERROR_CODE_BUYER_ACCOUNT_ERROR -> "Buyer account error occurred."
        WalletConstants.ERROR_CODE_MERCHANT_ACCOUNT_ERROR -> "Merchant account error occurred."
        WalletConstants.ERROR_CODE_DEVELOPER_ERROR ->
          "Developer error occurred. Please check your Google Pay API configuration."
        else -> "An unexpected error has occurred during payment."
      }

    rejectPromise(E_FAILED_PROCESSING, errorMessage)
  }

  private fun isValidPaymentRequestJSON(paymentRequestJSON: String): Boolean =
    try {
      JSONObject(paymentRequestJSON)
      true
    } catch (e: JSONException) {
      Log.e(NAME, "$FAILED_PARSING_PAYMENT_REQUEST_MESSAGE $e")
      false
    }

  private fun getEnvironment(details: ReadableMap): Int =
    if (details.hasKey("environment") && details.getString("environment")!! == "PRODUCTION") {
      WalletConstants.ENVIRONMENT_PRODUCTION
    } else {
      WalletConstants.ENVIRONMENT_TEST
    }

  private fun rejectPromise(code: String, message: String) {
    Log.e(NAME, message)

    pendingPromise?.reject(code, message)
    pendingPromise = null
  }

  companion object {
    const val NAME = "Payments"

    private const val E_FAILED_SHOWING_ANDROID_PAY = "E_FAILED_SHOWING_ANDROID_PAY"
    private const val E_CANCELLED_BY_USER = "E_CANCELLED_BY_USER"
    private const val E_UNSUPPORTED_ANDROID_PAY = "E_UNSUPPORTED_ANDROID_PAY"
    private const val E_FAILED_CREATING_PAYMENT_REQUEST = "E_FAILED_CREATING_PAYMENT_REQUEST"
    private const val E_FAILED_PROCESSING = "E_FAILED_PROCESSING"
    private const val E_FAILED_PARSING_PAYMENT_REQUEST = "E_FAILED_PARSING_PAYMENT_REQUEST"
    private const val E_FAILED_PARSING_PAYMENT_RESPONSE = "E_FAILED_PARSING_PAYMENT_RESPONSE"
    private const val FAILED_PARSING_PAYMENT_REQUEST_MESSAGE = "Failed parsing PaymentRequest JSON string"

    // Arbitrarily-picked constant integer you define to track a request for payment data activity.
    private const val LOAD_MASKED_WALLET_REQUEST_CODE = 88
  }
}
