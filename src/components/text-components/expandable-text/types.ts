import type { StyleProp, TextStyle, ViewStyle } from 'react-native';

export type ExpandableTextDirection = 'rtl' | 'ltr';

export interface ExpandableTextProps {
  /** متن اصلی که باید نمایش داده شود */
  text: string;

  /** تعداد خطوط قابل نمایش در حالت بسته (پیش‌فرض: 2) */
  numberOfLines?: number;

  /** عنوان دکمه‌ی «بازکردن» متن (پیش‌فرض: «بیشتر») */
  moreLabel?: string;
  /** عنوان دکمه‌ی «بستن» متن (پیش‌فرض: «کمتر») */
  lessLabel?: string;

  /** رنگ دکمه‌ی «بیشتر» (پیش‌فرض: آبی استاندارد) */
  moreLabelColor?: string;
  /** رنگ دکمه‌ی «کمتر» (پیش‌فرض: همان moreLabelColor) */
  lessLabelColor?: string;
  /** استایل اضافه برای دکمه‌های بیشتر/کمتر؛ روی رنگ‌های بالا اعمال می‌شود */
  toggleTextStyle?: StyleProp<TextStyle>;

  /**
   * تمام استایل متن اصلی از همین‌جا تنظیم می‌شود: رنگ، فونت، سایز،
   * ارتفاع خط (lineHeight)، fontWeight و هر چیز دیگری که TextStyle قبول می‌کند.
   */
  textStyle?: StyleProp<TextStyle>;

  /** استایل دلخواه برای کانتینر بیرونی (می‌تواند padding/margin داشته باشد) */
  containerStyle?: StyleProp<ViewStyle>;

  /**
   * جهت متن. پیش‌فرض 'rtl' (مناسب فارسی)؛ برای متون انگلیسی/لاتین
   * روی 'ltr' بگذارید. این مقدار به‌طور خودکار با رفتار RTL خودِ اندروید
   * (وقتی I18nManager.isRTL فعال است) سازگار می‌شود.
   */
  direction?: ExpandableTextDirection;

  /** مدت زمان انیمیشن باز/بسته شدن به میلی‌ثانیه (پیش‌فرض: 320) */
  animationDuration?: number;

  /** متنی که بین محتوای بریده‌شده و دکمه‌ی «بیشتر» قرار می‌گیرد (پیش‌فرض: '… ') */
  ellipsis?: string;

  /** فاصله‌ی اطمینان اضافه (پیکسل) هنگام محاسبه‌ی جای اولیه برای دکمه‌ی «بیشتر» */
  truncationSafetyMargin?: number;

  /** حالت کنترل‌شده: اگر ست شود، state داخلی کامپوننت نادیده گرفته می‌شود */
  expanded?: boolean;
  /** مقدار اولیه‌ی باز/بسته بودن، فقط در حالت غیرکنترل‌شده */
  defaultExpanded?: boolean;
  /** کال‌بک هنگام تغییر وضعیت باز/بسته شدن */
  onToggle?: (expanded: boolean) => void;

  /** غیرفعال‌کردن کامل قابلیت بیشتر/کمتر (متن همیشه به‌صورت کامل نمایش داده می‌شود) */
  disabled?: boolean;
}

/*
 * نکته: دکمه‌ی بیشتر/کمتر به‌صورت یک <Text> تودرتو (nested) داخل متن اصلی
 * رندر می‌شود تا دقیقاً همان‌جایی که باید (انتهای خط) قرار بگیرد. به همین
 * دلیل RN اجازه‌ی hitSlop روی این نوع Text را نمی‌دهد. اگر به ناحیه‌ی
 * لمسی بزرگ‌تر نیاز دارید، از padding کوچک در toggleTextStyle استفاده کنید.
 */

export interface TextLineMeasurement {
  text: string;
  width: number;
  height: number;
}
