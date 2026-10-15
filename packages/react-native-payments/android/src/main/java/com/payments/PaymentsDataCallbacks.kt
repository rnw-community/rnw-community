package com.payments

import com.google.android.gms.wallet.PaymentData
import com.google.android.gms.wallet.callback.BasePaymentDataCallbacks
import com.google.android.gms.wallet.callback.IntermediatePaymentData
import com.google.android.gms.wallet.callback.OnCompleteListener
import com.google.android.gms.wallet.callback.PaymentAuthorizationResult
import com.google.android.gms.wallet.callback.PaymentDataRequestUpdate
import org.json.JSONObject

internal class PaymentsDataCallbacks : BasePaymentDataCallbacks() {
  override fun onPaymentDataChanged(
    request: IntermediatePaymentData?,
    onCompleteListener: OnCompleteListener<PaymentDataRequestUpdate>
  ) {
    PaymentsCallbackBridge.onPaymentDataChanged(request?.toJson(), onCompleteListener)
  }

  override fun onPaymentAuthorized(
    request: PaymentData?,
    onCompleteListener: OnCompleteListener<PaymentAuthorizationResult>
  ) {
    onCompleteListener.complete(
      PaymentAuthorizationResult.fromJson(JSONObject().put("transactionState", "SUCCESS").toString())
    )
  }
}
