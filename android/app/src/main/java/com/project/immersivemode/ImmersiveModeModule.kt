package com.project.immersivemode

import android.os.Build
import android.view.View
import androidx.core.view.WindowCompat
import androidx.core.view.WindowInsetsCompat
import androidx.core.view.WindowInsetsControllerCompat
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod

class ImmersiveModeModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {

    override fun getName() = "ImmersiveMode"

    /**
     * متد جامع برای ورود به حالت Immersive با پشتیبانی از نسخه‌های مختلف اندروید.
     */
    @ReactMethod
    fun enterImmersiveMode() {
        val activity = currentActivity ?: return
        val window = activity.window ?: return

        activity.runOnUiThread {
            // برای اندروید ۱۱ (API 30) و بالاتر از API جدید استفاده می‌کنیم
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
                WindowCompat.setDecorFitsSystemWindows(window, false)
                val controller = WindowInsetsControllerCompat(window, window.decorView)
                if (controller != null) {
                    controller.hide(WindowInsetsCompat.Type.systemBars())
                    controller.systemBarsBehavior = WindowInsetsControllerCompat.BEHAVIOR_SHOW_TRANSIENT_BARS_BY_SWIPE
                }
            } else {
                // برای نسخه‌های قدیمی‌تر از روش منسوخ شده ولی کارآمد استفاده می‌کنیم
                @Suppress("DEPRECATION")
                window.decorView.systemUiVisibility = (
                    View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY
                    or View.SYSTEM_UI_FLAG_LAYOUT_STABLE
                    or View.SYSTEM_UI_FLAG_LAYOUT_HIDE_NAVIGATION
                    or View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN
                    or View.SYSTEM_UI_FLAG_HIDE_NAVIGATION
                    or View.SYSTEM_UI_FLAG_FULLSCREEN
                )
            }
        }
    }

    /**
     * متد جامع برای خروج از حالت Immersive با پشتیبانی از نسخه‌های مختلف اندروید.
     */
    @ReactMethod
    fun exitImmersiveMode() {
        val activity = currentActivity ?: return
        val window = activity.window ?: return

        activity.runOnUiThread {
            // برای اندروید ۱۱ (API 30) و بالاتر
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
                WindowCompat.setDecorFitsSystemWindows(window, true)
                val controller = WindowInsetsControllerCompat(window, window.decorView)
                if (controller != null) {
                    controller.show(WindowInsetsCompat.Type.systemBars())
                }
            } else {
                // برای نسخه‌های قدیمی‌تر
                @Suppress("DEPRECATION")
                window.decorView.systemUiVisibility = (View.SYSTEM_UI_FLAG_LAYOUT_STABLE)
            }
        }
    }
}

