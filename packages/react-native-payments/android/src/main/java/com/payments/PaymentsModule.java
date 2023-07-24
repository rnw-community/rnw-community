package com.payments;

import android.app.Activity;
import android.content.Intent;
import android.util.Log;

import androidx.annotation.NonNull;

import com.facebook.react.bridge.ActivityEventListener;
import com.facebook.react.bridge.BaseActivityEventListener;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.ReadableMap;
import com.google.android.gms.common.api.Status;
import com.google.android.gms.tasks.Task;
import com.google.android.gms.wallet.AutoResolveHelper;
import com.google.android.gms.wallet.PaymentData;
import com.google.android.gms.wallet.PaymentDataRequest;
import com.google.android.gms.wallet.PaymentsClient;
import com.google.android.gms.wallet.Wallet;
import com.google.android.gms.wallet.WalletConstants;

// HINT: To see crashes use: `adb logcat "*:S" AndroidRuntime:E`
// TODO: Remove event emitter and use main promise as this would be more then enough
public class PaymentsModule extends PaymentsSpec {
    public static final String NAME = "Payments";
    private static final String E_ACTIVITY_DOES_NOT_EXIST = "E_ACTIVITY_DOES_NOT_EXIST";
    // TODO: Improve this error
    private static final String E_FAILED_SHOWING_ANDROID_PAY = "E_FAILED_SHOWING_ANDROID_PAY";
    private static final String E_ABORTED = "E_ABORTED";
    private static final String E_FAILED_ABORTING = "E_FAILED_ABORTING";
    private static final String E_CANCELLED_BY_USER = "E_CANCELLED_BY_USER";
    private static final String E_FAILED_PROCESSING = "E_FAILED_PROCESSING";
    private static final String E_FAILED_UNHANDLED = "E_FAILED_UNHANDLED";

    // TODO: Find google docs href for this
    private static final int LOAD_MASKED_WALLET_REQUEST_CODE = 88;

    // https://developers.google.com/android/reference/com/google/android/gms/wallet/PaymentsClient
    private PaymentsClient mPaymentsClient;
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
                            handlePaymentSuccess(paymentData);
                            break;

                        case Activity.RESULT_CANCELED:
                            mPromise.reject(E_CANCELLED_BY_USER, "User closed AndroidPay without completing the payment.");
                            mPromise = null;
                            break;

                        case AutoResolveHelper.RESULT_ERROR:
                            Status status = AutoResolveHelper.getStatusFromIntent(intent);
                            handleError(status.getStatusCode());
                            break;
                    }

                default:
                    Log.d(NAME, "Unhandled AndroidPay resultCode: " + resultCode);
                    mPromise.reject(E_FAILED_UNHANDLED, "Unhandled AndroidPay resultCode: " + resultCode);
                    mPromise = null;
                    break;
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

    // TODO: canMakePayment https://developers.google.com/android/reference/com/google/android/gms/wallet/PaymentsClient#isReadyToPay(com.google.android.gms.wallet.IsReadyToPayRequest)
    // https://developers.google.com/pay/api/android/guides/tutorial#java

    @ReactMethod
    public void show(String paymentMethodData, ReadableMap details, final Promise promise) {
        Activity currentActivity = getCurrentActivity();
        Log.d(NAME, "Showing AndroidPay " + currentActivity.toString());


        if (currentActivity == null) {
            promise.reject(E_ACTIVITY_DOES_NOT_EXIST, "Activity doesn't exist");
            return;
        }

        // HINT: We store promise reference to resolve/reject it later
        mPromise = promise;

        try {
            int environment = details.hasKey("environment") && details.getString("environment").equals("TEST") ? WalletConstants.ENVIRONMENT_TEST : WalletConstants.ENVIRONMENT_PRODUCTION;

            // https://developers.google.com/android/reference/com/google/android/gms/wallet/PaymentDataRequest#fromJson(java.lang.String)
            PaymentDataRequest request = PaymentDataRequest.fromJson(paymentMethodData);

            // https://developers.google.com/android/reference/com/google/android/gms/wallet/Wallet.WalletOptions.Builder#setEnvironment(int)
            Wallet.WalletOptions options = new Wallet.WalletOptions.Builder().setEnvironment(environment).build();
            mPaymentsClient = Wallet.getPaymentsClient(currentActivity, options);

            // https://developers.google.com/android/reference/com/google/android/gms/wallet/PaymentsClient#public-taskpaymentdata-loadpaymentdata-paymentdatarequest-request
            Task<PaymentData> loadPaymentDataTask = mPaymentsClient.loadPaymentData(request);
            // https://developers.google.com/android/reference/com/google/android/gms/wallet/AutoResolveHelper
            AutoResolveHelper.resolveTask(loadPaymentDataTask, currentActivity, LOAD_MASKED_WALLET_REQUEST_CODE);
        } catch (Exception e) {
            mPromise.reject(E_FAILED_SHOWING_ANDROID_PAY, "Failed showing AndroidPay: " + e);
            mPromise = null;
        }
    }

    @ReactMethod
    public void abort(Promise promise) {
        Log.d(NAME, "Aborting AndroidPay for " + getCurrentActivity().toString());

        promise.reject(E_FAILED_ABORTING, "AndroidPay abort is not supported");
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
        final String paymentInfo = paymentData.toJson();
        if (paymentInfo == null) {
            Log.e(NAME, "PaymentDataRequest was not constructed using fromJson(String).");

            mPromise.reject("PaymentDataRequest was not constructed using fromJson(String)");
            mPromise = null;

            return;
        }

        Log.d(NAME, "Successfully received paymentData" + getCurrentActivity().toString() + " " + paymentData);

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
        Log.e("loadPaymentData failed", String.format("Error code: %d", statusCode));

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

        mPromise.reject(E_FAILED_PROCESSING, errorMessage);
        mPromise = null;
    }
}
