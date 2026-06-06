package com.dokalam.app

import android.app.Application
import com.facebook.react.PackageList
import com.facebook.react.ReactApplication
import com.facebook.react.ReactHost
import com.facebook.react.ReactNativeHost
import com.facebook.react.ReactPackage
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint.load
import com.facebook.react.defaults.DefaultReactHost.getDefaultReactHost
import com.facebook.react.defaults.DefaultReactNativeHost
import com.facebook.react.soloader.OpenSourceMergedSoMapping
import com.facebook.soloader.SoLoader
import com.facebook.react.modules.i18nmanager.I18nUtil
import android.content.Context
import android.content.res.Configuration
import com.dokalam.app.navigationbar.NavigationBarPackage
import com.dokalam.app.immersivemode.ImmersiveModePackage
import com.dokalam.app.MarketPackage
import com.dokalam.app.cafebazaar.CafeBazaarPackage
import com.dokalam.app.myket.MyketPackage

class MainApplication : Application(), ReactApplication {

  override val reactNativeHost: ReactNativeHost =
      object : DefaultReactNativeHost(this) {
        override fun getPackages(): List<ReactPackage> =
            PackageList(this).packages.apply {
              // Packages that cannot be autolinked yet can be added manually here, for example:
              // add(MyReactNativePackage())
              add(NavigationBarPackage()) 
              add(ImmersiveModePackage()) 
              add(MarketPackage().get())
              add(CafeBazaarPackage())
              add(MyketPackage())
            }

        override fun getJSMainModuleName(): String = "index"

        override fun getUseDeveloperSupport(): Boolean = BuildConfig.DEBUG

        override val isNewArchEnabled: Boolean = BuildConfig.IS_NEW_ARCHITECTURE_ENABLED
        override val isHermesEnabled: Boolean = BuildConfig.IS_HERMES_ENABLED
      }

  override val reactHost: ReactHost
    get() = getDefaultReactHost(applicationContext, reactNativeHost)

  override fun onCreate() {
    super.onCreate()
    SoLoader.init(this, OpenSourceMergedSoMapping)
    if (BuildConfig.IS_NEW_ARCHITECTURE_ENABLED) {
      // If you opted-in for the New Architecture, we load the native entry point for this app.
      load()
    }
    // val sharedI18nUtilInstance = I18nUtil.getInstance()
    // sharedI18nUtilInstance.forceRTL(this, false)
    // sharedI18nUtilInstance.allowRTL(this, false)
    val sharedI18nUtilInstance = I18nUtil.getInstance()
    sharedI18nUtilInstance.forceRTL(this, true)
    sharedI18nUtilInstance.allowRTL(this, true)
  }

  override fun attachBaseContext(base: Context?) {
    super.attachBaseContext(base?.let { updateBaseContext(it) })
  }

  private fun updateBaseContext(context: Context): Context {
      val configuration = context.resources.configuration
      if (configuration.fontScale != 1.0f) { // Prevent font scaling
          configuration.fontScale = 1.0f
          return context.createConfigurationContext(configuration)
      }
      return context
  }
}
