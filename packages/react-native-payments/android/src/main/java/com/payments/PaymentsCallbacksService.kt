package com.payments

import com.google.android.gms.wallet.callback.BasePaymentDataCallbacks
import com.google.android.gms.wallet.callback.BasePaymentDataCallbacksService

class PaymentsCallbacksService : BasePaymentDataCallbacksService() {
  override fun createPaymentDataCallbacks(): BasePaymentDataCallbacks = PaymentsDataCallbacks()
}
