package com.harfhesab.app

import com.facebook.react.ReactPackage
import ir.cafebazaar.poolakey.rn.ReactNativePoolakeyPackage 

class MarketPackage {
    fun get(): ReactPackage {
        return ReactNativePoolakeyPackage()
    }
}