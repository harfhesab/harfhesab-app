import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'reward_ads_limit';

const MAX_ADS = 3;
const WINDOW_TIME = 3 * 60 * 60 * 1000; // 3 ساعت

export const getRewardAdsStatus = async () => {
    try {
        const data = await AsyncStorage.getItem(STORAGE_KEY);

        if (!data) {
            return {
                allowed: true,
                count: 0,
                remaining: MAX_ADS,
                resetAt: null,
                hours: 0,
                minutes: 0,
                seconds: 0,
            };
        }

        let { startTime, count } = JSON.parse(data);

        const now = Date.now();
        const resetAt = startTime + WINDOW_TIME;

        // اگر پنجره 3 ساعته تمام شده باشد
        if (now >= resetAt) {
            await AsyncStorage.removeItem(STORAGE_KEY);

            return {
                allowed: true,
                count: 0,
                remaining: MAX_ADS,
                resetAt: null,
                hours: 0,
                minutes: 0,
                seconds: 0,
            };
        }

        // --- محاسبه زمان باقی‌مانده دقیقاً مشابه منطق تایمر شما ---
        const val1 = resetAt - now;
        
        const b2 = Math.trunc(val1 / 3600000);
        const hour = Math.max(0, b2);
        
        const val3 = val1 - (hour * 3600000);
        const b3 = Math.trunc(val3 / 60000);
        const minute = Math.max(0, b3);
        
        const val4 = val3 - (minute * 60000);
        const b4 = Math.trunc(val4 / 1000);
        const second = Math.max(0, b4);
        // --------------------------------------------------------

        return {
            allowed: count < MAX_ADS,
            count,
            remaining: Math.max(0, MAX_ADS - count),
            resetAt: resetAt,
            hours: hour,
            minutes: minute,
            seconds: second,
        };
    } catch (error) {
        console.log(error);

        return {
            allowed: true,
            count: 0,
            remaining: MAX_ADS,
            resetAt: null,
            hours: 0,
            minutes: 0,
            seconds: 0,
        };
    }
};

export const registerRewardAdWatch = async () => {
    try {
        const now = Date.now();
        const data = await AsyncStorage.getItem(STORAGE_KEY);

        // اولین تبلیغ
        if (!data) {
            await AsyncStorage.setItem(
                STORAGE_KEY,
                JSON.stringify({
                    startTime: now,
                    count: 1,
                }),
            );

            // اجرای ناهمگام تابع وضعیت و بازگرداندن نتیجه
            return await getRewardAdsStatus();
        }

        let { startTime, count } = JSON.parse(data);

        // پنجره قبلی منقضی شده
        if (now >= startTime + WINDOW_TIME) {
            await AsyncStorage.setItem(
                STORAGE_KEY,
                JSON.stringify({
                    startTime: now,
                    count: 1,
                }),
            );

            // اجرای ناهمگام تابع وضعیت و بازگرداندن نتیجه
            return await getRewardAdsStatus();
        }

        // هنوز داخل پنجره هستیم
        count += 1;

        await AsyncStorage.setItem(
            STORAGE_KEY,
            JSON.stringify({
                startTime,
                count,
            }),
        );

        // اجرای ناهمگام تابع وضعیت و بازگرداندن نتیجه در حالت عادی
        return await getRewardAdsStatus();

    } catch (error) {
        console.log(error);
        // در صورت بروز خطا هم وضعیت فعلی را برمی‌گردانیم تا برنامه کرش نکند
        return await getRewardAdsStatus();
    }
};