package com.payments;

import androidx.annotation.NonNull;

import android.app.Activity;
import android.content.Intent;
import android.util.Log;

import com.google.android.gms.common.api.Status;
import com.google.android.gms.tasks.Task;
import com.google.android.gms.wallet.*;

import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.ReadableMap;

// TODO: Remove event emitter and use main promise as this would be more then enough
public class PaymentsModule extends PaymentsSpec {
    public static final String NAME = "ReactNativePayments";

    // TODO: Find google docs href for this
    private static final int LOAD_MASKED_WALLET_REQUEST_CODE = 88;
    // TODO: Find google docs href for this
    private static final int LOAD_PAYMENT_DATA_REQUEST_CODE = 123;

    // https://developers.google.com/android/reference/com/google/android/gms/wallet/PaymentsClient
    private PaymentsClient mPaymentsClient;
    // TODO: Promise ref, should resolve/reject when the payment is done/cancelled/error
    private Promise mPromise;

    PaymentsModule(ReactApplicationContext context) {
        super(context);
    }

    @Override
    @NonNull
    public String getName() {
        return NAME;
    }

    // https://developers.google.com/pay/api/android/guides/tutorial#java
    public void onActivityResult(int requestCode, int resultCode, Intent data) {
        // value passed in AutoResolveHelper
        switch (requestCode) {
            case LOAD_PAYMENT_DATA_REQUEST_CODE:
                switch (resultCode) {
                    case Activity.RESULT_OK:
                        PaymentData paymentData = PaymentData.getFromIntent(data);
                        handlePaymentSuccess(paymentData);
                    break;

                    case Activity.RESULT_CANCELED:
                        mPromise.reject("Payment cancelled");
                    break;

                    case AutoResolveHelper.RESULT_ERROR:
                        Status status = AutoResolveHelper.getStatusFromIntent(data);
                        handleError(status.getStatusCode());
                    break;
                }
        }
    }

    // Implementation See https://reactnative.dev/docs/native-modules-android

    // TODO: canMakePayment https://developers.google.com/android/reference/com/google/android/gms/wallet/PaymentsClient#isReadyToPay(com.google.android.gms.wallet.IsReadyToPayRequest)
    // https://developers.google.com/pay/api/android/guides/tutorial#java

    @ReactMethod
    public void show(String paymentMethodData, ReadableMap details, Promise promise) {
        Log.d(NAME, "show" + getCurrentActivity().toString());

        mPromise = promise;

        try {
            int environment = details.hasKey("environment") && details.getString("environment").equals("TEST")
                ? WalletConstants.ENVIRONMENT_TEST
                : WalletConstants.ENVIRONMENT_PRODUCTION;

            // https://developers.google.com/android/reference/com/google/android/gms/wallet/PaymentDataRequest#fromJson(java.lang.String)
            PaymentDataRequest request = PaymentDataRequest.fromJson(paymentMethodData);

            // https://developers.google.com/android/reference/com/google/android/gms/wallet/Wallet.WalletOptions.Builder#setEnvironment(int)
            Wallet.WalletOptions options = new Wallet.WalletOptions.Builder().setEnvironment(environment).build();
            mPaymentsClient = Wallet.getPaymentsClient(getCurrentActivity(), options);

            Task loadPaymentDataTask = mPaymentsClient.loadPaymentData(request);
            AutoResolveHelper.resolveTask(loadPaymentDataTask, getCurrentActivity(), LOAD_MASKED_WALLET_REQUEST_CODE);
        } catch(Exception e) {
            mPromise.reject("Failed showing AndroidPay", e);
        }
    }

    @ReactMethod
    public void abort(Promise promise) {
        Log.d(NAME, "abort" + getCurrentActivity().toString());

        // Is there a way to abort?
        promise.reject("Aborted");
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

            return;
        }

        Log.d(NAME, "Successfully received paymentData" + getCurrentActivity().toString() + " " + paymentData);

        mPromise.resolve(paymentInfo);
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

        mPromise.reject("Failed processing AndroidPay");
    }
}
