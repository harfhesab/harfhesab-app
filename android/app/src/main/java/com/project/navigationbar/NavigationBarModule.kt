package com.project.navigationbar

import android.graphics.Color
import android.os.Build
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod

class NavigationBarModule(reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    override fun getName(): String {
        return "NavigationBar"
    }

    @ReactMethod
    fun setColor(colorHex: String) {
        val activity = currentActivity ?: return
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
            activity.runOnUiThread {
                activity.window.navigationBarColor = Color.parseColor(colorHex)
            }
        }
    }
}