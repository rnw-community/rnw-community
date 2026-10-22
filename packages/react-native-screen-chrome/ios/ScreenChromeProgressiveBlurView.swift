// Variable blur adapted from @sbaiahmed1/react-native-blur VariableBlurView.swift, MIT, Copyright (c) 2025 Ahmed Sbai.
// See THIRD_PARTY_NOTICES.md.
import ExpoModulesCore
import UIKit

final class ScreenChromeProgressiveBlurView: ExpoView {
  var position = "top"
  var radius = 20.0
  var plateau = 0.0

  private let effectView = VariableBlurEffectView(effect: UIBlurEffect(style: .light))
  private var foregroundObserver: NSObjectProtocol?

  required init(appContext: AppContext? = nil) {
    super.init(appContext: appContext)
    isUserInteractionEnabled = false
    effectView.onWindow = { [weak self] in
      self?.applyBlur()
    }
    effectView.frame = bounds
    effectView.autoresizingMask = [.flexibleWidth, .flexibleHeight]
    addSubview(effectView)
    foregroundObserver = NotificationCenter.default.addObserver(
      forName: UIApplication.willEnterForegroundNotification,
      object: nil,
      queue: .main
    ) { [weak self] _ in
      self?.applyBlur()
    }
  }

  deinit {
    if let foregroundObserver {
      NotificationCenter.default.removeObserver(foregroundObserver)
    }
  }

  func applyBlur() {
    effectView.effect = UIBlurEffect(style: .light)

    guard
      let filterClass = NSClassFromString(String("retliFAC".reversed())) as? NSObject.Type,
      let filter = filterClass.perform(
        NSSelectorFromString(String(":epyThtiWretlif".reversed())),
        with: "variableBlur"
      )?.takeUnretainedValue() as? NSObject,
      let maskImage = makeMaskImage()
    else { return }

    filter.setValue(radius, forKey: "inputRadius")
    filter.setValue(maskImage, forKey: "inputMaskImage")
    filter.setValue(true, forKey: "inputNormalizeEdges")
    effectView.subviews.first?.layer.filters = [filter]

    for overlay in effectView.subviews.dropFirst() {
      overlay.alpha = 0
    }

    if let scale = effectView.window?.traitCollection.displayScale,
       let backdropLayer = effectView.subviews.first?.layer,
       backdropLayer.value(forKey: "scale") as? CGFloat != scale {
      backdropLayer.setValue(scale, forKey: "scale")
    }
  }

  private func makeMaskImage() -> CGImage? {
    let offset = max(0, min(1, plateau))
    let fade = 1 - offset
    let steps = 12
    var locations: [CGFloat] = []
    var alphas: [CGFloat] = []

    if position == "bottom" {
      locations.append(0)
      alphas.append(1)
      for step in 0...steps {
        let progress = CGFloat(step) / CGFloat(steps)
        locations.append(offset + fade * progress)
        alphas.append(pow(1 - progress, 3))
      }
    } else {
      for step in 0...steps {
        let progress = CGFloat(step) / CGFloat(steps)
        locations.append(fade * progress)
        alphas.append(pow(progress, 3))
      }
      locations.append(1)
      alphas.append(1)
    }

    let components: [CGFloat] = alphas.flatMap { [0, 0, 0, $0] }
    let size = 100

    guard
      let context = CGContext(
        data: nil,
        width: size,
        height: size,
        bitsPerComponent: 8,
        bytesPerRow: 0,
        space: CGColorSpaceCreateDeviceRGB(),
        bitmapInfo: CGImageAlphaInfo.premultipliedLast.rawValue
      ),
      let gradient = CGGradient(
        colorSpace: CGColorSpaceCreateDeviceRGB(),
        colorComponents: components,
        locations: locations,
        count: locations.count
      )
    else { return nil }

    context.drawLinearGradient(
      gradient,
      start: .zero,
      end: CGPoint(x: 0, y: size),
      options: [.drawsBeforeStartLocation, .drawsAfterEndLocation]
    )

    return context.makeImage()
  }
}

private final class VariableBlurEffectView: UIVisualEffectView {
  var onWindow: (() -> Void)?

  override func didMoveToWindow() {
    super.didMoveToWindow()

    if window != nil {
      onWindow?()
    }
  }
}
