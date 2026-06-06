import { convertRtl } from 'react-native-rtl-reshaper';

export function prepareRTLText(input: string): string {
  // ۱. یکپارچه‌سازی: تبدیل «ه» + «ٔ» (دو کاراکتری) به «ۀ» (تک کاراکتری)
  // همچنین حالت اشتباه تایپی «ه» + «ء» را هم هندل می‌کنیم تا خیالتان راحت باشد
  let normalizedInput = input
    .replace(/هٔ/g, 'ۀ')
    .replace(/هء/g, 'ۀ');

  // ۲. شکل‌دهی حروف فارسی/عربی
  const shaped = convertRtl(normalizedInput);
  
  // ۳. برعکس کردن کل رشته برای رندر Skia
  const reversed = shaped.split('').reverse().join('');
  
  // ۴. برگرداندن اعداد و کلمات انگلیسی به حالت چپ‌به‌راست (اصلاحیه قبلی)
  const fixedReversed = reversed.replace(/[a-zA-Z0-9۰-۹٠-٩.,\/]+/g, (match) => {
    return match.split('').reverse().join('');
  });
  
  return fixedReversed;
}