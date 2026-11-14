package com.harfhesab.app

import android.graphics.Color
import android.graphics.Rect
import android.os.Build
import android.os.Bundle
import android.util.DisplayMetrics
import android.view.WindowManager
import androidx.core.view.ViewCompat
import androidx.core.view.WindowCompat
import androidx.core.view.WindowInsetsCompat
import androidx.core.view.WindowInsetsControllerCompat
import com.facebook.react.ReactActivity
import com.facebook.react.ReactActivityDelegate
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint.fabricEnabled
import com.facebook.react.defaults.DefaultReactActivityDelegate

class MainActivity : ReactActivity() {

  private var keyboardVisible = false

  override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(savedInstanceState)
    setupFullscreen()
    setupKeyboardListener()
  }

  override fun onResume() {
    super.onResume()
    updateSystemBars()
  }

  override fun onWindowFocusChanged(hasFocus: Boolean) {
    super.onWindowFocusChanged(hasFocus)
    if (hasFocus) updateSystemBars()
  }

  private fun setupFullscreen() {
    WindowCompat.setDecorFitsSystemWindows(window, false)
    window.addFlags(WindowManager.LayoutParams.FLAG_FULLSCREEN)
    window.statusBarColor = Color.TRANSPARENT
    window.navigationBarColor = Color.TRANSPARENT

    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
      window.isNavigationBarContrastEnforced = false
      window.isStatusBarContrastEnforced = false
    }

    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.P) {
      val params = window.attributes
      params.layoutInDisplayCutoutMode =
          WindowManager.LayoutParams.LAYOUT_IN_DISPLAY_CUTOUT_MODE_SHORT_EDGES
      window.attributes = params
    }

    // اگر نوارها برخلاف حالت دلخواه ظاهر شدند، اصلاح کن
    ViewCompat.setOnApplyWindowInsetsListener(window.decorView) { view, insets ->
      val statusVisible = insets.isVisible(WindowInsetsCompat.Type.statusBars())
      val navVisible = insets.isVisible(WindowInsetsCompat.Type.navigationBars())
      if (statusVisible || (!keyboardVisible && navVisible)) {
        view.post { updateSystemBars() }
      }
      ViewCompat.onApplyWindowInsets(view, insets)
    }

    window.decorView.post { updateSystemBars() }
  }

  // تشخیص کیبورد از روی کوچک شدن ناحیه‌ی قابل‌مشاهده (روی همه‌ی نسخه‌ها کار می‌کند)
  @Suppress("DEPRECATION")
  private fun setupKeyboardListener() {
    val root = window.decorView
    root.viewTreeObserver.addOnGlobalLayoutListener {
      val rect = Rect()
      root.getWindowVisibleDisplayFrame(rect)

      val metrics = DisplayMetrics()
      windowManager.defaultDisplay.getRealMetrics(metrics)
      val screenHeight = metrics.heightPixels

      val hiddenHeight = screenHeight - rect.bottom
      val visible = hiddenHeight > screenHeight * 0.15

      if (visible != keyboardVisible) {
        keyboardVisible = visible
        updateSystemBars()
      }
    }
  }

  private fun updateSystemBars() {
    val controller = WindowInsetsControllerCompat(window, window.decorView)
    controller.systemBarsBehavior =
        WindowInsetsControllerCompat.BEHAVIOR_SHOW_TRANSIENT_BARS_BY_SWIPE

    controller.hide(WindowInsetsCompat.Type.statusBars())

    if (keyboardVisible) {
      window.navigationBarColor = Color.parseColor("#001012")
      controller.show(WindowInsetsCompat.Type.navigationBars())
    } else {
      window.navigationBarColor = Color.TRANSPARENT
      controller.hide(WindowInsetsCompat.Type.navigationBars())
    }
  }

  override fun getMainComponentName(): String = "project"

  override fun createReactActivityDelegate(): ReactActivityDelegate =
      DefaultReactActivityDelegate(this, mainComponentName, fabricEnabled)
}