package com.payments

import com.facebook.react.bridge.ReadableArray
import com.facebook.react.bridge.ReadableMap
import com.facebook.react.bridge.ReadableType
import org.json.JSONArray
import org.json.JSONObject

internal object PaymentDataRequestUpdateFactory {
  const val SHIPPING_ADDRESS_CHANGE_EVENT = "shippingaddresschange"
  const val SHIPPING_OPTION_CHANGE_EVENT = "shippingoptionchange"

  private const val SHIPPING_ADDRESS_INTENT = "SHIPPING_ADDRESS"
  private const val SHIPPING_OPTION_INTENT = "SHIPPING_OPTION"
  private const val SHIPPING_ADDRESS_FIELD_ERROR_TYPE = "shippingAddressField"

  fun createUnchanged(): String = JSONObject().toString()

  fun create(
    shownRequest: JSONObject,
    eventName: String,
    pendingEvent: PendingChangeEvent,
    update: ReadableMap,
    displayItems: ReadableArray,
    shippingOptions: ReadableArray
  ): String {
    val requestUpdate = JSONObject()

    createTransactionInfo(shownRequest, update, displayItems)?.let { requestUpdate.put("newTransactionInfo", it) }

    if (eventName == SHIPPING_ADDRESS_CHANGE_EVENT && hasShippingOptionIntent(shownRequest) && shippingOptions.size() > 0) {
      requestUpdate.put(
        "newShippingOptionParameters",
        createShippingOptionParameters(shippingOptions, pendingEvent.selectedShippingOptionId)
      )
    }

    createError(eventName, update)?.let { requestUpdate.put("error", it) }

    return requestUpdate.toString()
  }

  private fun hasShippingOptionIntent(shownRequest: JSONObject): Boolean {
    val callbackIntents = shownRequest.optJSONArray("callbackIntents") ?: return false

    return (0 until callbackIntents.length()).any { callbackIntents.optString(it) == SHIPPING_OPTION_INTENT }
  }

  private fun createTransactionInfo(shownRequest: JSONObject, update: ReadableMap, displayItems: ReadableArray): JSONObject? {
    val shownTransactionInfo = shownRequest.optJSONObject("transactionInfo") ?: return null
    val total = update.getMapOrNull("total") ?: return null
    val totalPrice = total.getMapOrNull("amount")?.getStringOrNull("value") ?: return null

    val transactionInfo = JSONObject(shownTransactionInfo.toString())
    transactionInfo.put("totalPrice", totalPrice)
    total.getStringOrNull("label")?.let { transactionInfo.put("totalPriceLabel", it) }
    transactionInfo.remove("displayItems")

    if (displayItems.size() > 0) {
      transactionInfo.put("displayItems", createDisplayItems(displayItems))
    }

    return transactionInfo
  }

  private fun createDisplayItems(displayItems: ReadableArray): JSONArray {
    val items = JSONArray()

    for (index in 0 until displayItems.size()) {
      val item = displayItems.getMap(index) ?: continue
      val price = item.getMapOrNull("amount")?.getStringOrNull("value") ?: continue
      val isPending = item.hasKey("pending") && item.getType("pending") == ReadableType.Boolean && item.getBoolean("pending")

      items.put(
        JSONObject()
          .put("label", item.getStringOrNull("label") ?: "")
          .put("price", price)
          .put("status", if (isPending) "PENDING" else "FINAL")
          .put("type", "LINE_ITEM")
      )
    }

    return items
  }

  private fun createShippingOptionParameters(shippingOptions: ReadableArray, sheetSelectedOptionId: String?): JSONObject {
    val options = JSONArray()
    val optionIds = mutableListOf<String>()
    var selectedOptionId: String? = null

    for (index in 0 until shippingOptions.size()) {
      val option = shippingOptions.getMap(index) ?: continue
      val id = option.getStringOrNull("id") ?: continue
      val label = option.getStringOrNull("label") ?: continue

      val selectionOption = JSONObject().put("id", id).put("label", label)
      option.getStringOrNull("detail")?.takeIf { it.isNotEmpty() }?.let { selectionOption.put("description", it) }
      options.put(selectionOption)
      optionIds.add(id)

      if (option.hasKey("selected") && option.getType("selected") == ReadableType.Boolean && option.getBoolean("selected")) {
        selectedOptionId = id
      }
    }

    val defaultSelectedOptionId =
      selectedOptionId ?: sheetSelectedOptionId?.takeIf { optionIds.contains(it) } ?: optionIds.firstOrNull()

    val parameters = JSONObject().put("shippingOptions", options)
    defaultSelectedOptionId?.let { parameters.put("defaultSelectedOptionId", it) }

    return parameters
  }

  private fun createError(eventName: String, update: ReadableMap): JSONObject? {
    if (!update.hasKey("error")) {
      return null
    }

    val intent = if (eventName == SHIPPING_OPTION_CHANGE_EVENT) SHIPPING_OPTION_INTENT else SHIPPING_ADDRESS_INTENT

    return when (update.getType("error")) {
      ReadableType.String -> createStringError(intent, update.getString("error"))
      ReadableType.Map -> createFieldError(intent, update.getMap("error"))
      else -> null
    }
  }

  private fun createStringError(intent: String, message: String?): JSONObject? {
    if (message.isNullOrEmpty()) {
      return null
    }

    val reason = if (intent == SHIPPING_OPTION_INTENT) "SHIPPING_OPTION_INVALID" else "SHIPPING_ADDRESS_UNSERVICEABLE"

    return JSONObject().put("reason", reason).put("intent", intent).put("message", message)
  }

  private fun createFieldError(intent: String, error: ReadableMap?): JSONObject? {
    val fieldError = error ?: return null
    val message = fieldError.getStringOrNull("message")

    if (message.isNullOrEmpty()) {
      return null
    }

    val isShippingAddressFieldError =
      intent == SHIPPING_ADDRESS_INTENT && fieldError.getStringOrNull("type") == SHIPPING_ADDRESS_FIELD_ERROR_TYPE
    val reason = if (isShippingAddressFieldError) "SHIPPING_ADDRESS_INVALID" else "OTHER_ERROR"

    return JSONObject().put("reason", reason).put("intent", intent).put("message", message)
  }

  private fun ReadableMap.getMapOrNull(key: String): ReadableMap? =
    if (hasKey(key) && getType(key) == ReadableType.Map) getMap(key) else null

  private fun ReadableMap.getStringOrNull(key: String): String? =
    if (hasKey(key) && getType(key) == ReadableType.String) getString(key) else null
}
