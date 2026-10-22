// Progressive blur adapted from @sbaiahmed1/react-native-blur ReactNativeProgressiveBlurView.kt, MIT,
// Copyright (c) 2025 Ahmed Sbai. See THIRD_PARTY_NOTICES.md.
package com.rnwcommunity.screenchrome

import android.annotation.SuppressLint
import android.content.Context
import android.graphics.Canvas
import android.graphics.Color
import android.graphics.LinearGradient
import android.graphics.Paint
import android.graphics.PorterDuff
import android.graphics.PorterDuffXfermode
import android.graphics.Shader
import android.view.ViewGroup
import com.qmdeve.blurview.widget.BlurView
import expo.modules.kotlin.AppContext
import expo.modules.kotlin.views.ExpoView
import kotlin.math.roundToInt

@SuppressLint("ViewConstructor")
class ScreenChromeProgressiveBlurView(context: Context, appContext: AppContext) : ExpoView(context, appContext) {
  var position = "top"
  var radius = 20f
  var plateau = 0f
  var colorScheme = "light"

  private val blurView = BlurView(context, null).apply {
    setDownsampleFactor(DOWNSAMPLE_FACTOR)
    blurRounds = BLUR_ROUNDS
  }
  private val maskPaint = Paint(Paint.ANTI_ALIAS_FLAG).apply {
    xfermode = PorterDuffXfermode(PorterDuff.Mode.DST_IN)
  }

  init {
    setWillNotDraw(false)
    addView(blurView, LayoutParams(LayoutParams.MATCH_PARENT, LayoutParams.MATCH_PARENT))
  }

  fun applyProps() {
    blurView.setBlurRadius(radius)
    blurView.overlayColor = if (colorScheme == "dark") DARK_OVERLAY else LIGHT_OVERLAY
    updateMask()
  }

  override fun onAttachedToWindow() {
    super.onAttachedToWindow()
    blurView.post { captureScreenAncestor() }
  }

  override fun onDetachedFromWindow() {
    super.onDetachedFromWindow()
    val listener = blurView.preDrawListener
    blurView.mDecorView?.takeIf { listener != null }?.viewTreeObserver?.removeOnPreDrawListener(listener)
    blurView.mDecorView = null
    blurView.mDifferentRoot = false
  }

  override fun onLayout(changed: Boolean, left: Int, top: Int, right: Int, bottom: Int) {
    blurView.measure(MeasureSpec.makeMeasureSpec(right - left, MeasureSpec.EXACTLY), MeasureSpec.makeMeasureSpec(bottom - top, MeasureSpec.EXACTLY))
    blurView.layout(0, 0, right - left, bottom - top)
  }

  override fun onSizeChanged(width: Int, height: Int, oldWidth: Int, oldHeight: Int) {
    super.onSizeChanged(width, height, oldWidth, oldHeight)
    updateMask()
  }

  override fun dispatchDraw(canvas: Canvas) {
    if (!canvas.isHardwareAccelerated || width <= 0 || height <= 0) {
      return
    }

    val saveCount = canvas.saveLayer(0f, 0f, width.toFloat(), height.toFloat(), null)
    drawChild(canvas, blurView, drawingTime)
    canvas.drawRect(0f, 0f, width.toFloat(), height.toFloat(), maskPaint)
    canvas.restoreToCount(saveCount)
  }

  private fun updateMask() {
    if (width <= 0 || height <= 0) {
      return
    }

    val clearEdge = if (position == "bottom") 0f else height.toFloat()
    val fullStrength = if (position == "bottom") height * (1 - plateau) else height * plateau
    maskPaint.shader = if (plateau >= 1f) {
      null
    } else {
      LinearGradient(0f, clearEdge, 0f, fullStrength, RAMP_COLORS, RAMP_POSITIONS, Shader.TileMode.CLAMP)
    }
    invalidate()
  }

  private fun captureScreenAncestor() {
    val root = findAncestor(SCREEN_CLASS) ?: findAncestor(REACT_ROOT_CLASS) ?: return
    val listener = blurView.preDrawListener ?: return
    val previousRoot = blurView.mDecorView ?: return

    previousRoot.viewTreeObserver.removeOnPreDrawListener(listener)
    blurView.mDecorView = root
    root.viewTreeObserver.addOnPreDrawListener(listener)
    blurView.mDifferentRoot = root.rootView != blurView.rootView
    runCatching {
      blurView.javaClass.superclass.getDeclaredField("mForceRedraw").apply { isAccessible = true }.setBoolean(blurView, true)
    }
  }

  private fun findAncestor(className: String): ViewGroup? {
    var ancestor = parent
    while (ancestor != null) {
      if (ancestor.javaClass.name == className) {
        return ancestor as? ViewGroup
      }
      ancestor = ancestor.parent
    }
    return null
  }

  private companion object {
    const val DOWNSAMPLE_FACTOR = 8f
    const val BLUR_ROUNDS = 5
    const val SCREEN_CLASS = "com.swmansion.rnscreens.Screen"
    const val REACT_ROOT_CLASS = "com.facebook.react.ReactRootView"
    val LIGHT_OVERLAY = Color.argb(42, 255, 255, 255)
    val DARK_OVERLAY = Color.argb(120, 26, 22, 22)
    val RAMP_POSITIONS = floatArrayOf(0f, 0.15f, 0.3f, 0.45f, 0.6f, 0.75f, 1f)
    val RAMP_COLORS = floatArrayOf(0f, 0.08f, 0.3f, 0.52f, 0.75f, 0.9f, 1f)
      .map { alpha -> Color.argb((alpha * 255f).roundToInt(), 255, 255, 255) }
      .toIntArray()
  }
}
