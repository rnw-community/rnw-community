import ExpoModulesCore

public class ScreenChromeModule: Module {
  public func definition() -> ModuleDefinition {
    Name("ScreenChrome")

    View(ScreenChromeProgressiveBlurView.self) {
      Prop("position") { (view, position: String) in
        view.position = position
      }
      Prop("radius") { (view, radius: Double) in
        view.radius = radius
      }
      Prop("plateau") { (view, plateau: Double) in
        view.plateau = plateau
      }
      OnViewDidUpdateProps { view in
        view.applyBlur()
      }
    }
  }
}
