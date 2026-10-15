package com.payments

import com.google.android.gms.wallet.callback.OnCompleteListener
import com.google.android.gms.wallet.callback.PaymentDataRequestUpdate
import java.lang.ref.WeakReference

internal object PaymentsCallbackBridge {
  @Volatile
  private var coordinatorReference = WeakReference<PaymentsChangeEventCoordinator>(null)

  fun attach(coordinator: PaymentsChangeEventCoordinator) {
    coordinatorReference = WeakReference(coordinator)
  }

  fun detach(coordinator: PaymentsChangeEventCoordinator) {
    if (coordinatorReference.get() === coordinator) {
      coordinatorReference = WeakReference(null)
    }
  }

  fun onPaymentDataChanged(intermediatePaymentData: String?, listener: OnCompleteListener<PaymentDataRequestUpdate>) {
    val coordinator = coordinatorReference.get()

    if (coordinator == null) {
      listener.complete(PaymentDataRequestUpdate.fromJson(PaymentDataRequestUpdateFactory.createUnchanged()))

      return
    }

    coordinator.onPaymentDataChanged(intermediatePaymentData, listener)
  }
}
