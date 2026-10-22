package com.rnwcommunity.screenchrome

import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

class ScreenChromeModule : Module() {
  override fun definition() = ModuleDefinition {
    Name("ScreenChrome")

    View(ScreenChromeProgressiveBlurView::class) {
      Prop("position") { view: ScreenChromeProgressiveBlurView, position: String ->
        view.position = position
      }
      Prop("radius") { view: ScreenChromeProgressiveBlurView, radius: Float ->
        view.radius = radius
      }
      Prop("plateau") { view: ScreenChromeProgressiveBlurView, plateau: Float ->
        view.plateau = plateau
      }
      OnViewDidUpdateProps { view: ScreenChromeProgressiveBlurView ->
        view.applyProps()
      }
    }
  }
}
