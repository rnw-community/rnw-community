package com.payments

import com.facebook.react.TurboReactPackage
import com.facebook.react.bridge.NativeModule
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.module.model.ReactModuleInfo
import com.facebook.react.module.model.ReactModuleInfoProvider

class PaymentsPackage : TurboReactPackage() {
  override fun getModule(name: String, reactContext: ReactApplicationContext): NativeModule? =
    if (name == PaymentsModule.NAME) PaymentsModule(reactContext) else null

  override fun getReactModuleInfoProvider(): ReactModuleInfoProvider = ReactModuleInfoProvider {
    mapOf(
      PaymentsModule.NAME to ReactModuleInfo(
        PaymentsModule.NAME,
        PaymentsModule.NAME,
        false, // canOverrideExistingModule
        false, // needsEagerInit
        true, // hasConstants
        false, // isCxxModule
        BuildConfig.IS_NEW_ARCHITECTURE_ENABLED // isTurboModule
      )
    )
  }
}
