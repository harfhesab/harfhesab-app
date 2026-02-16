package com.dokalam.app.immersivemode

import android.view.View
import com.facebook.react.ReactPackage
import com.facebook.react.bridge.NativeModule
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.uimanager.ReactShadowNode
import com.facebook.react.uimanager.ViewManager
import java.util.Collections

class ImmersiveModePackage : ReactPackage {

    override fun createNativeModules(reactContext: ReactApplicationContext): List<NativeModule> {
        // ماژول ساخته شده را به لیست ماژول‌های نیتیو اضافه می‌کنیم
        return listOf(ImmersiveModeModule(reactContext))
    }

    override fun createViewManagers(reactContext: ReactApplicationContext): List<ViewManager<View, ReactShadowNode<*>>> {
        // چون ماژول ما یک کامپوننت UI نیست، این لیست خالی برمی‌گردد
        return Collections.emptyList()
    }
}
