import {I18nManager} from 'react-native';

export const IS_RTL = I18nManager.isRTL;

/* ═════════════ ابعاد ═════════════ */
export const GAP = 12;
export const PADDING = 14;
export const WIDE_BREAKPOINT = 600; // Fold باز / تبلت
export const MAX_CONTENT_WIDTH = 720;

export const INSET = 10; // فاصله‌ی قاب تصویر تا لبه‌ی کارت
export const INFO_H = 135; // ارتفاع نوار متن در حالت ستونی (کارت‌های small) — تنها مقدار تغییرکرده: قبلاً ۵۴
export const CARD_R = 26;
export const SLOT_R = 18;

export const CONT_H = 76; // ارتفاع کل دکمه‌ی ادامه (با لبه‌ی سه‌بعدی)
export const CONT_LIP = 5;
export const CONT_R = 24;
export const BLEED = PADDING; // حاشیه‌ی اضافه‌ی کانواس تا سایه بریده نشود

export const GOLD = ['#FFD666', '#F0B93B', '#C98E1F'];


export const CARDS = [
    {
        id: 'word-game',
        featured: true,
        title: 'خان کلمات',
        subtitle: 'روی حروف لمس کن تا کلمه ساخته شود.',
        size: 'large',
        route: 'WordGame',
        colors: ['#9b4193', '#2b0828'],
        placeholder: '#E91E63',
        image:require('../../assets/image/home-word-game.png'),
        active: true,
        tags:['کلمه سازی']
    },
    {
        id: 'levels',
        featured: true,
        title: 'جمله‌چین',
        subtitle: 'کلمات را بچین تا شعر یا جمله یا ضرب‌المثل ساخته شود.',
        size: 'large',
        route: 'StageGame',
        colors: ['#3F8F4A', '#15381F'],
        placeholder: '#E91E63',
        image:require('../../assets/image/home-stage-game.png'),
        active: true,
        tags:['جمله سازی', 'کلمه سازی']
    },
    {
        id: 'story',
        title: 'داستان چین',
        subtitle: 'بسته‌های داستانی را بیت به بیت کامل کن.',
        size: 'small',
        route: 'PackageGameBottomTab',
        colors: ['#B5402C', '#3A0F0A'],
        placeholder: '#7E57C2',
        image:require('../../assets/image/home-package-game.png'),
        active: true,
        tags:['جمله سازی', 'کلمه سازی']
    },
    {
        id: 'lastword',
        title: 'حرف آخر',
        subtitle: 'گلچین‌ روزانه، هر کدام را خواستی بازی کن.',
        size: 'small',
        route: 'HarfAkharBottomTab',
        colors: ['#1FA08F', '#073B35'],
        placeholder: '#FFB300',
        image:require('../../assets/image/home-harf-akhar.png'),
        active: true,
        tags:['جمله سازی', 'کلمه سازی']
    },
    {
        id: 'en-teaching',
        title: 'زبان انگلیسی (آموزش)',
        subtitle: 'زبان انگلیسی را با متد حرف حساب بازی کن و یاد بگیر.',
        size: 'large',
        route: 'Fal',
        badge: "به‌زودی",
        colors: ['#3F8F4A', '#15381F'],
        placeholder: '#26C6DA',
        image:require('../../assets/image/home-english-teach.png'),
        active: false
    },
    {
        id: 'fal',
        title: 'فال حافظ',
        subtitle: 'فال هر روزت را به سبک حرف حساب بازی کن.',
        size: 'large',
        route: 'Fal',
        badge: "به‌زودی",
        colors: ['#3A6FCB', '#0E2350'],
        placeholder: '#26C6DA',
        image:require('../../assets/image/home-hafez-fal.png'),
        active: false
    },
];