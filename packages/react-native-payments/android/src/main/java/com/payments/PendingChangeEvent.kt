package com.payments

import com.google.android.gms.wallet.callback.OnCompleteListener
import com.google.android.gms.wallet.callback.PaymentDataRequestUpdate

internal class PendingChangeEvent(
  val eventId: Int,
  val listener: OnCompleteListener<PaymentDataRequestUpdate>,
  val selectedShippingOptionId: String?
)
