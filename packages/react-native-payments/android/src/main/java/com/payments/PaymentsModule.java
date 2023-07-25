package com.payments;

import androidx.annotation.NonNull;

import android.app.Activity;
import android.content.Intent;
import android.util.Log;

import org.json.JSONException;
import org.json.JSONObject;

import com.google.android.gms.common.api.Status;
import com.google.android.gms.tasks.Task;
import com.google.android.gms.tasks.OnCompleteListener;
import com.google.android.gms.wallet.*;

import com.facebook.react.bridge.ActivityEventListener;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.bridge.BaseActivityEventListener;

// HINT: To see crashes use: `adb logcat "*:S" AndroidRuntime:E`
// HINT: Check this setup: https://developers.google.com/pay/api/android/guides/setup Add it to the docs
public class PaymentsModule extends PaymentsSpec {
    public static final String NAME = "Payments";

    private static final String E_FAILED_SHOWING_ANDROID_PAY = "E_FAILED_SHOWING_ANDROID_PAY";
    private static final String E_CANCELLED_BY_USER = "E_CANCELLED_BY_USER";
    private static final String E_UNSUPPORTED_ANDROID_PAY = "E_UNSUPPORTED_ANDROID_PAY";
    private static final String E_FAILED_CREATING_PAYMENT_REQUEST = "E_FAILED_CREATING_PAYMENT_REQUEST";
    private static final String E_FAILED_PROCESSING = "E_FAILED_PROCESSING";
    private static final String E_FAILED_UNHANDLED = "E_FAILED_UNHANDLED";
    private static final String E_FAILED_PARSING_PAYMENT_REQUEST = "E_FAILED_PARSING_PAYMENT_REQUEST";
    private static final String E_FAILED_PARSING_PAYMENT_RESPONSE = "E_FAILED_PARSING_PAYMENT_RESPONSE";

    // Arbitrarily-picked constant integer you define to track a request for payment data activity.
    private static final int LOAD_MASKED_WALLET_REQUEST_CODE = 88;

    // TODO: Promise ref, should resolve/reject when the payment is done/cancelled/error
    private Promise mPromise;

    // https://reactnative.dev/docs/native-modules-android#getting-activity-result-from-startactivityforresult
    private final ActivityEventListener mActivityEventListener = new BaseActivityEventListener() {
        @Override
        // https://developers.google.com/pay/api/android/guides/tutorial#java
        public void onActivityResult(Activity activity, int requestCode, int resultCode, Intent intent) {
            Log.d(NAME, "Received onActivityResult: " + requestCode + " " + resultCode);

            // value passed in AutoResolveHelper
            switch (requestCode) {
              case LOAD_MASKED_WALLET_REQUEST_CODE:
                  switch (resultCode) {
                      case Activity.RESULT_OK:
                          PaymentData paymentData = PaymentData.getFromIntent(intent);
                          Log.d(NAME, "Received payment: " + paymentData);
                          handlePaymentSuccess(paymentData);
                          break;

                      case Activity.RESULT_CANCELED:
                          rejectPromise(E_CANCELLED_BY_USER, "User closed AndroidPay without completing the payment");
                          break;

                      case AutoResolveHelper.RESULT_ERROR:
                      default:
                          Status status = AutoResolveHelper.getStatusFromIntent(intent);
                          handleError(status.getStatusCode());
                          break;
                  }
            }
        }
      };

    PaymentsModule(ReactApplicationContext context) {
        super(context);

        context.addActivityEventListener(mActivityEventListener);
    }

    @Override
    @NonNull
    public String getName() {
        return NAME;
    }

    // Implementation See https://reactnative.dev/docs/native-modules-android

    // https://developers.google.com/android/reference/com/google/android/gms/wallet/PaymentsClient#isReadyToPay(com.google.android.gms.wallet.IsReadyToPayRequest)
    // https://developers.google.com/pay/api/android/guides/tutorial#java
    @ReactMethod
    public void canMakePayments(String paymentMethodData, final Promise promise) {
        Activity currentActivity = getCurrentActivity();
        Log.d(NAME, "Checking if AndroidPay is available " + currentActivity.toString());

        // HINT: We store promise reference to resolve/reject it later
        mPromise = promise;

        validatePaymentRequestJSON(paymentMethodData);

        // https://developers.google.com/android/reference/com/google/android/gms/wallet/PaymentDataRequest#fromJson(java.lang.String)
        IsReadyToPayRequest request = IsReadyToPayRequest.fromJson(paymentMethodData);

        if(request == null) {
            rejectPromise(E_UNSUPPORTED_ANDROID_PAY, "AndroidPay is not supported");
            return;
        }

        // https://developers.google.com/android/reference/com/google/android/gms/wallet/Wallet.WalletOptions.Builder#setEnvironment(int)
        Wallet.WalletOptions options = new Wallet.WalletOptions.Builder().setEnvironment(WalletConstants.ENVIRONMENT_TEST).build();

        // https://developers.google.com/android/reference/com/google/android/gms/wallet/PaymentsClient
        PaymentsClient paymentsClient = Wallet.getPaymentsClient(currentActivity, options);

        Task<Boolean> task = paymentsClient.isReadyToPay(request);
        task.addOnCompleteListener(new OnCompleteListener<Boolean>() {
            @Override
            public void onComplete(@NonNull Task<Boolean> task) {
                if (task.isSuccessful()) {
                    promise.resolve(task.getResult());
                } else {
                    rejectPromise(E_UNSUPPORTED_ANDROID_PAY, "AndroidPay is not supported");
                }
            }
        });
    }

    @ReactMethod
    public void show(String paymentMethodData, ReadableMap details, final Promise promise) {
        Activity currentActivity = getCurrentActivity();
        Log.d(NAME, "Showing AndroidPay " + currentActivity.toString() + details.toString());

        // HINT: We store promise reference to resolve/reject it later
        mPromise = promise;

        validatePaymentRequestJSON(paymentMethodData);

        try {
            // https://developers.google.com/android/reference/com/google/android/gms/wallet/PaymentDataRequest#fromJson(java.lang.String)
            PaymentDataRequest request = PaymentDataRequest.fromJson(paymentMethodData);

            if(request == null) {
                rejectPromise(E_FAILED_CREATING_PAYMENT_REQUEST, "Failed creating PaymentDataRequest");
                return;
            }

            Log.d(NAME, "Created PaymentDataRequest " + request.toString());

            // https://developers.google.com/android/reference/com/google/android/gms/wallet/Wallet.WalletOptions.Builder#setEnvironment(int)
            Wallet.WalletOptions options = new Wallet.WalletOptions.Builder().setEnvironment(getEnvironment(details)).build();

            // https://developers.google.com/android/reference/com/google/android/gms/wallet/PaymentsClient
            PaymentsClient paymentsClient = Wallet.getPaymentsClient(currentActivity, options);

            // https://developers.google.com/android/reference/com/google/android/gms/wallet/PaymentsClient#public-taskpaymentdata-loadpaymentdata-paymentdatarequest-request
            Task<PaymentData> loadPaymentDataTask = paymentsClient.loadPaymentData(request);

            // https://developers.google.com/android/reference/com/google/android/gms/wallet/AutoResolveHelper
            AutoResolveHelper.resolveTask(loadPaymentDataTask, currentActivity, LOAD_MASKED_WALLET_REQUEST_CODE);
        } catch(Exception e) {
            rejectPromise(E_FAILED_SHOWING_ANDROID_PAY, "Failed showing AndroidPay" + e);
        }
    }

    @ReactMethod
    public void abort(Promise promise) {
        Log.d(NAME, "Aborting AndroidPay for " + getCurrentActivity().toString());

        promise.resolve("AndroidPay abort is not supported");
    }

    @ReactMethod
    public void complete(String status, Promise promise) {
        Log.d(NAME, "Completing status " + status + " AndroidPay for " + getCurrentActivity().toString());

        promise.resolve("AndroidPay complete is not supported");
    }

    /**
     * PaymentData response object contains the payment information, as well as any additional
     * requested information, such as billing and shipping address.
     *
     * @param paymentData A response object returned by Google after a payer approves payment.
     * @see <a href="https://developers.google.com/pay/api/android/reference/
     * object#PaymentData">PaymentData</a>
     */
    private void handlePaymentSuccess(PaymentData paymentData) {
        // https://developers.google.com/pay/api/android/guides/tutorial#checkoutactivity.java-java
        // https://developers.google.com/android/reference/com/google/android/gms/wallet/PaymentData
        // https://developers.google.com/pay/api/android/reference/request-objects#PaymentData
        final String paymentInfo = paymentData.toJson();
        if (paymentInfo == null) {
            rejectPromise(E_FAILED_PARSING_PAYMENT_RESPONSE, "Failed parsing payment response");
            return;
        }

        Log.d(NAME, "Successfully received paymentData: " + getCurrentActivity().toString() + " " + paymentInfo);

        mPromise.resolve(paymentInfo);
        mPromise = null;
    }

    /**
     * At this stage, the user has already seen a popup informing them an error occurred. Normally,
     * only logging is required.
     *
     * @param statusCode will hold the value of any constant from CommonStatusCode or one of the
     *                   WalletConstants.ERROR_CODE_* constants.
     * @see <a href="https://developers.google.com/android/reference/com/google/android/gms/wallet/
     * WalletConstants#constant-summary">Wallet Constants Library</a>
     */
    private void handleError(int statusCode) {
        String errorMessage;

        switch (statusCode) {
            case WalletConstants.ERROR_CODE_BUYER_ACCOUNT_ERROR:
                errorMessage = "Buyer account error occurred.";
                break;
            case WalletConstants.ERROR_CODE_MERCHANT_ACCOUNT_ERROR:
                errorMessage = "Merchant account error occurred.";
                break;
            case WalletConstants.ERROR_CODE_DEVELOPER_ERROR:
                errorMessage = "Developer error occurred. Please check your Google Pay API configuration.";
                break;
            // Add more cases for specific error codes, if needed
            default:
                errorMessage = "An unexpected error has occurred during payment.";
                break;
        }

        rejectPromise(E_FAILED_PROCESSING, errorMessage);
    }

    private void validatePaymentRequestJSON(String paymentRequestJSON){
        try {
            JSONObject jsonObject = new JSONObject(paymentRequestJSON);
            Log.d(NAME, "Successfully validated paymentRequest JSON string " + jsonObject.toString());
        } catch (JSONException e) {
            rejectPromise(E_FAILED_PARSING_PAYMENT_REQUEST, "Failed parsing PaymentRequest JSON string");
        }
    }

    private int getEnvironment(ReadableMap details) {
        if (details.hasKey("environment") && details.getString("environment").equals("PRODUCTION")) {
            return WalletConstants.ENVIRONMENT_PRODUCTION;
        }

        return WalletConstants.ENVIRONMENT_TEST;
    }

    private void rejectPromise(String code, String message) {
        Log.e(NAME, message);

        if (mPromise != null) {
            mPromise.reject(code, message);
            mPromise = null;
        }
    }
}
