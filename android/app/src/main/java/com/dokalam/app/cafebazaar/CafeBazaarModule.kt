package com.dokalam.app.cafebazaar

import android.content.Intent
import android.net.Uri
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod

class CafeBazaarModule(reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    override fun getName(): String {
        return "CafeBazaar"
    }

    @ReactMethod
    fun openRating(promise: Promise) {
        val activity = currentActivity
        if (activity == null) {
            promise.reject("E_ACTIVITY_DOES_NOT_EXIST", "Activity doesn't exist")
            return
        }

        try {
            val intent = Intent(Intent.ACTION_EDIT)
            // استفاده از نام پکیج داینامیک برنامه شما (com.dokalam.app)
            intent.data = Uri.parse("bazaar://details?id=" + activity.packageName)
            intent.setPackage("com.farsitel.bazaar")
            activity.startActivity(intent)
            
            // در اینجا بازار باز شده است. قول (Promise) را با موفقیت برمی‌گردانیم
            promise.resolve(true)
        } catch (e: Exception) {
            // اگر بازار نصب نباشد یا خطایی رخ دهد
            promise.reject("E_BAZAAR_NOT_INSTALLED", "Cafe Bazaar is not installed.")
        }
    }
}