package com.payments

import android.util.Log
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.UiThreadUtil
import com.facebook.react.jstasks.HeadlessJsTaskConfig
import com.facebook.react.jstasks.HeadlessJsTaskContext

internal class PaymentsChangeEventsTask(private val reactContext: ReactApplicationContext) {
  private var taskId: Int? = null

  fun start() = UiThreadUtil.runOnUiThread {
    if (taskId != null || !reactContext.hasActiveReactInstance()) {
      return@runOnUiThread
    }

    try {
      taskId = HeadlessJsTaskContext.getInstance(reactContext)
        .startTask(HeadlessJsTaskConfig(TASK_KEY, Arguments.createMap(), 0, true))
    } catch (e: RuntimeException) {
      Log.w(NAME, "Failed keeping JS timers running behind the Google Pay sheet", e)
    }
  }

  fun finish() = UiThreadUtil.runOnUiThread {
    val runningTaskId = taskId ?: return@runOnUiThread
    taskId = null

    HeadlessJsTaskContext.getInstance(reactContext).finishTask(runningTaskId)
  }

  companion object {
    private const val NAME = "Payments"
    private const val TASK_KEY = "RNPaymentsChangeEvents"
  }
}
