package com.dokalam.app.immersivemode

import android.os.Build
import android.view.View
import android.view.WindowManager  // برای LayoutParams
import android.graphics.Color
import androidx.core.view.WindowCompat
import androidx.core.view.WindowInsetsCompat
import androidx.core.view.WindowInsetsControllerCompat
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod

class ImmersiveModeModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {

    companion object {
        private var immersiveActive = false
    }

    override fun getName() = "ImmersiveMode"

    @ReactMethod
    fun enterImmersiveMode() {
        val activity = currentActivity ?: return
        val window = activity.window ?: return

        immersiveActive = true

        activity.runOnUiThread {
            // تنظیم رنگ‌های transparent برای bars (API 21+)
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
                window.statusBarColor = Color.TRANSPARENT
                window.navigationBarColor = Color.TRANSPARENT
            }

            // تنظیم حالت cutout برای گسترش content به notch/punch-hole (API 28+)
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.P) {
                val params = window.attributes
                params.layoutInDisplayCutoutMode = WindowManager.LayoutParams.LAYOUT_IN_DISPLAY_CUTOUT_MODE_SHORT_EDGES
                window.attributes = params
            }

            // برای Android 11 (API 30) و بالاتر
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
                WindowCompat.setDecorFitsSystemWindows(window, false)
                val controller = WindowInsetsControllerCompat(window, window.decorView)
                controller.hide(WindowInsetsCompat.Type.systemBars())
                controller.systemBarsBehavior = WindowInsetsControllerCompat.BEHAVIOR_SHOW_TRANSIENT_BARS_BY_SWIPE
            } else {
                // برای نسخه‌های قدیمی‌تر
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

    @ReactMethod
    fun exitImmersiveMode() {
        val activity = currentActivity ?: return
        val window = activity.window ?: return

        immersiveActive = false

        activity.runOnUiThread {
            // بازگردانی رنگ‌ها به پیش‌فرض (می‌توانید رنگ دلخواه بگذارید)
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
                window.statusBarColor = Color.BLACK  // یا Color.parseColor("#your_default_color")
                window.navigationBarColor = Color.BLACK  // یا Color.parseColor("#your_default_color")
            }

            // بازگردانی حالت cutout به پیش‌فرض (API 28+)
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.P) {
                val params = window.attributes
                params.layoutInDisplayCutoutMode = WindowManager.LayoutParams.LAYOUT_IN_DISPLAY_CUTOUT_MODE_DEFAULT
                window.attributes = params
            }

            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
                WindowCompat.setDecorFitsSystemWindows(window, true)
                val controller = WindowInsetsControllerCompat(window, window.decorView)
                controller.show(WindowInsetsCompat.Type.systemBars())
                window.decorView.requestApplyInsets()
            } else {
                @Suppress("DEPRECATION")
                window.decorView.systemUiVisibility = View.SYSTEM_UI_FLAG_LAYOUT_STABLE
            }
        }
    }

    @ReactMethod(isBlockingSynchronousMethod = true)
    fun isImmersiveModeActive(): Boolean {
        return immersiveActive
    }
}