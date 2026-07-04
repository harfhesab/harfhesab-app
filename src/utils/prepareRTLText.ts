import { convertRtl } from 'react-native-rtl-reshaper';

export function prepareRTLText(input: string): string {
  // ۱. یکپارچه‌سازی
  let normalizedInput = input
    .replace(/هٔ/g, 'ۀ')
    .replace(/هء/g, 'ۀ');

  // ۲. شکل‌دهی حروف فارسی/عربی
  const shaped = convertRtl(normalizedInput);
  
  // ۳. گروه بندی حروف و اعراب، و سپس برعکس کردن
  const chars: string[] = [];
  for (let i = 0; i < shaped.length; i++) {
    const char = shaped[i];
    
    // رنج یونیکد برای اعراب و حرکات عربی/فارسی (فتحه، ضمه، کسره، تنوین، تشدید و ...)
    // \u0610-\u061A , \u064B-\u065F , \u0670
    if (/[\u0610-\u061A\u064B-\u065F\u0670]/.test(char)) {
      // اگر کاراکتر اعراب است، آن را به حرف قبلی می‌چسبانیم تا با هم یک گروه شوند
      if (chars.length > 0) {
        chars[chars.length - 1] += char;
      } else {
        chars.push(char); // حالت استثنا برای زمانی که اعراب اولین کاراکتر باشد
      }
    } else {
      // اگر حرف عادی است، به عنوان یک آیتم جدید اضافه‌اش می‌کنیم
      chars.push(char);
    }
  }
  
  // حالا بسته‌ها را برعکس می‌کنیم. با این کار، اعراب به حرفِ خودش چسبیده می‌ماند
  const reversed = chars.reverse().join('');
  
  // ۴. برگرداندن اعداد و کلمات انگلیسی به حالت چپ‌به‌راست
  const fixedReversed = reversed.replace(/[a-zA-Z0-9۰-۹٠-٩.,\/]+/g, (match) => {
    return match.split('').reverse().join('');
  });
  
  return fixedReversed;
}