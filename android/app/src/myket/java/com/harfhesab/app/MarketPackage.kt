package com.harfhesab.app

import com.facebook.react.ReactPackage
import ir.myketBillingReactNative.BillingReactNativePackage 

class MarketPackage {
    fun get(): ReactPackage {
        return BillingReactNativePackage()
    }
}