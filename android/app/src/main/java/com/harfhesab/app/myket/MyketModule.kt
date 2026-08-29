package com.harfhesab.app.myket

import android.content.Intent
import android.net.Uri
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod

class MyketModule(reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    override fun getName(): String {
        return "Myket"
    }

    @ReactMethod
    fun openRating(promise: Promise) {
        val activity = currentActivity
        if (activity == null) {
            promise.reject("E_ACTIVITY_DOES_NOT_EXIST", "Activity doesn't exist")
            return
        }

        try {
            val intent = Intent(Intent.ACTION_VIEW)
            // استفاده از URI مخصوص مایکت برای باز کردن مستقیم صفحه ثبت نظر
            intent.data = Uri.parse("myket://comment?id=" + activity.packageName)
            // تعیین پکیج نیم رسمی مایکت برای جلوگیری از باز شدن اپ‌های متفرقه
            intent.setPackage("ir.mservices.market")
            activity.startActivity(intent)
            
            // در اینجا مایکت باز شده است. Promise را با موفقیت برمی‌گردانیم
            promise.resolve(true)
        } catch (e: Exception) {
            // اگر مایکت نصب نباشد یا خطایی رخ دهد
            promise.reject("E_MYKET_NOT_INSTALLED", "Myket is not installed.")
        }
    }
}