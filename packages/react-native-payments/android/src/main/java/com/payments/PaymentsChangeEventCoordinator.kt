package com.payments

import android.os.Handler
import android.os.Looper
import android.util.Log
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReadableArray
import com.facebook.react.bridge.ReadableMap
import com.facebook.react.bridge.ReadableType
import com.facebook.react.bridge.WritableMap
import com.google.android.gms.wallet.callback.OnCompleteListener
import com.google.android.gms.wallet.callback.PaymentDataRequestUpdate
import org.json.JSONException
import org.json.JSONObject

internal class PaymentsChangeEventCoordinator(private val emitEvent: (String, WritableMap) -> Boolean) {
  private val lock = Any()
  private val deadlineHandler = Handler(Looper.getMainLooper())
  private val activeEventNames = mutableSetOf<String>()
  private val pendingEvents = mutableMapOf<String, PendingChangeEvent>()
  private var activeRequestId: String? = null
  private var shownRequest: JSONObject? = null
  private var lastEventId = 0
  private var listenerCount = 0

  fun addListener() = synchronized(lock) { listenerCount += 1 }

  fun removeListeners(count: Int) = synchronized(lock) {
    listenerCount = maxOf(0, listenerCount - count)

    if (listenerCount == 0) {
      flushPendingEvents()
    }
  }

  fun onShow(requestId: String, paymentDataRequest: String): Boolean = synchronized(lock) {
    flushPendingEvents()

    if (activeRequestId != requestId) {
      activeEventNames.clear()
      activeRequestId = requestId
    }

    val request = parseJson(paymentDataRequest)
    shownRequest = request

    (request?.optJSONArray("callbackIntents")?.length() ?: 0) > 0
  }

  fun onSheetClosed() = synchronized(lock) {
    flushPendingEvents()
    shownRequest = null
  }

  fun setActiveEvents(requestId: String, eventNames: ReadableArray) = synchronized(lock) {
    if (eventNames.size() == 0) {
      if (activeRequestId == requestId) {
        activeEventNames.clear()
        activeRequestId = null
        flushPendingEvents()
      }

      return@synchronized
    }

    if (shownRequest != null && activeRequestId != requestId) {
      Log.w(NAME, "Ignoring change events of $requestId, the payment sheet of $activeRequestId is presented")

      return@synchronized
    }

    if (activeRequestId != requestId) {
      flushPendingEvents()
      activeRequestId = requestId
    }

    activeEventNames.clear()
    (0 until eventNames.size()).mapNotNullTo(activeEventNames) { eventNames.getString(it) }
    pendingEvents.keys.filterNot { activeEventNames.contains(it) }.forEach { resolveUnchanged(it) }
  }

  fun onPaymentDataChanged(intermediatePaymentData: String?, listener: OnCompleteListener<PaymentDataRequestUpdate>) =
    synchronized(lock) {
      val paymentData = intermediatePaymentData?.let { parseJson(it) }
      val eventName = paymentData?.let { getEventName(it) }
      val requestId = activeRequestId

      if (paymentData == null || eventName == null || requestId == null || !isEventActive(eventName)) {
        listener.complete(PaymentDataRequestUpdate.fromJson(PaymentDataRequestUpdateFactory.createUnchanged()))

        return@synchronized
      }

      resolveUnchanged(eventName)

      lastEventId += 1
      val eventId = lastEventId
      val selectedShippingOptionId = getSelectedShippingOptionId(paymentData)
      pendingEvents[eventName] = PendingChangeEvent(eventId, listener, selectedShippingOptionId)
      deadlineHandler.postDelayed({ expirePendingEvent(eventName, eventId) }, CHANGE_EVENT_DEADLINE_MS)

      if (!emitEvent(eventName, createEventBody(requestId, eventId, paymentData, selectedShippingOptionId))) {
        resolveUnchanged(eventName)
      }
    }

  fun updatePaymentDetails(
    update: ReadableMap,
    displayItems: ReadableArray,
    shippingOptions: ReadableArray,
    promise: Promise
  ) = synchronized(lock) {
    val requestId = update.getStringOrNull("requestId")
    val eventName = update.getStringOrNull("eventName")
    val pendingEvent = eventName?.let { pendingEvents[it] }
    val request = shownRequest

    if (requestId == null || requestId != activeRequestId || pendingEvent == null || request == null) {
      promise.reject(E_NO_COMPLETION, "No payment sheet change event is waiting for a response")

      return@synchronized
    }

    if (update.getEventIdOrNull() != pendingEvent.eventId) {
      Log.w(NAME, "Dropping an answer that does not carry the eventId of the pending '$eventName' event")
      promise.reject(E_NO_COMPLETION, "The answered change event is not the pending one")

      return@synchronized
    }

    pendingEvents.remove(eventName)
    pendingEvent.listener.complete(
      PaymentDataRequestUpdate.fromJson(
        PaymentDataRequestUpdateFactory.create(request, eventName, pendingEvent, update, displayItems, shippingOptions)
      )
    )

    promise.resolve(null)
  }

  fun invalidate() = synchronized(lock) {
    flushPendingEvents()
    deadlineHandler.removeCallbacksAndMessages(null)
    shownRequest = null
    activeRequestId = null
    activeEventNames.clear()
  }

  private fun isEventActive(eventName: String): Boolean = listenerCount > 0 && activeEventNames.contains(eventName)

  private fun getEventName(paymentData: JSONObject): String? {
    val hasShippingAddress = paymentData.has("shippingAddress")
    val hasShippingOption = paymentData.has("shippingOptionData")

    return when (paymentData.optString("callbackTrigger")) {
      "SHIPPING_ADDRESS" -> PaymentDataRequestUpdateFactory.SHIPPING_ADDRESS_CHANGE_EVENT
      "SHIPPING_OPTION" -> PaymentDataRequestUpdateFactory.SHIPPING_OPTION_CHANGE_EVENT
      "INITIALIZE" -> when {
        hasShippingAddress && isEventActive(PaymentDataRequestUpdateFactory.SHIPPING_ADDRESS_CHANGE_EVENT) ->
          PaymentDataRequestUpdateFactory.SHIPPING_ADDRESS_CHANGE_EVENT
        hasShippingOption -> PaymentDataRequestUpdateFactory.SHIPPING_OPTION_CHANGE_EVENT
        else -> null
      }
      else -> null
    }
  }

  private fun getSelectedShippingOptionId(paymentData: JSONObject): String? =
    paymentData.optJSONObject("shippingOptionData")?.optString("id")?.takeIf { it.isNotEmpty() }

  private fun createEventBody(
    requestId: String,
    eventId: Int,
    paymentData: JSONObject,
    selectedShippingOptionId: String?
  ): WritableMap {
    val body = Arguments.createMap()
    body.putString("requestId", requestId)
    body.putInt("eventId", eventId)

    paymentData.optJSONObject("shippingAddress")?.let { body.putMap("shippingAddress", createShippingAddress(it)) }
    selectedShippingOptionId?.let { body.putString("shippingOption", it) }

    return body
  }

  private fun createShippingAddress(address: JSONObject): WritableMap {
    val shippingAddress = Arguments.createMap()
    shippingAddress.putString("address1", "")
    shippingAddress.putString("address2", "")
    shippingAddress.putString("address3", "")
    shippingAddress.putString("administrativeArea", address.optString("administrativeArea"))
    shippingAddress.putString("countryCode", address.optString("countryCode"))
    shippingAddress.putString("locality", address.optString("locality"))
    shippingAddress.putString("postalCode", address.optString("postalCode"))
    shippingAddress.putString("sortingCode", "")

    return shippingAddress
  }

  private fun expirePendingEvent(eventName: String, eventId: Int) = synchronized(lock) {
    if (pendingEvents[eventName]?.eventId == eventId) {
      Log.w(NAME, "The '$eventName' event $eventId was not answered in time, keeping the sheet unchanged")
      resolveUnchanged(eventName)
    }
  }

  private fun resolveUnchanged(eventName: String) {
    pendingEvents.remove(eventName)?.listener?.complete(
      PaymentDataRequestUpdate.fromJson(PaymentDataRequestUpdateFactory.createUnchanged())
    )
  }

  private fun flushPendingEvents() {
    pendingEvents.keys.toList().forEach { resolveUnchanged(it) }
  }

  private fun parseJson(json: String): JSONObject? =
    try {
      JSONObject(json)
    } catch (e: JSONException) {
      Log.w(NAME, "Failed parsing a Google Pay payload", e)
      null
    }

  private fun ReadableMap.getStringOrNull(key: String): String? =
    if (hasKey(key) && getType(key) == ReadableType.String) getString(key) else null

  private fun ReadableMap.getEventIdOrNull(): Int? =
    if (hasKey("eventId") && getType("eventId") == ReadableType.Number) getDouble("eventId").toInt() else null

  companion object {
    private const val NAME = "Payments"
    private const val E_NO_COMPLETION = "no_completion"
    private const val CHANGE_EVENT_DEADLINE_MS = 25_000L
  }
}
