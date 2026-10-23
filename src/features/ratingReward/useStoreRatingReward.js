/**
 * مسیر پیشنهادی: src/features/ratingReward/useStoreRatingReward.js
 * (اگر جای دیگری گذاشتی، فقط importهای نسبی بالای فایل را اصلاح کن)
 *
 * این فایل هوک نیست و به هیچ صفحه/کامپوننتی وابسته نیست؛ مثل endOfAStageInStageGame
 * مستقیم از store و colors استفاده می‌کند و از هر جای برنامه می‌شود صدایش زد:
 *
 *     import askForStoreRatingIfNeeded from '.../ratingReward/useStoreRatingReward';
 *     goBack();
 *     askForStoreRatingIfNeeded(stageNumber);
 *
 * کارهایی که داخل همین فایل انجام می‌شود:
 *   - تصمیم‌گیری زمانی (از طریق ratingScheduler: مرحله ≥ ۷ و فاصله‌ها)
 *   - دیالوگ «از حرف حساب راضی بودی؟»
 *   - باز کردن استور (کافه‌بازار / مایکت)
 *   - آلرت «آیا امتیاز دادید؟» + تایمر ۳۰ ثانیه‌ای
 *   - استعلام مجوز از سرور و اعطای سکه
 *
 * قاعده‌ی «دیگر نپرس» (markRated): فقط وقتی ثبت می‌شود که سکه داده شده یا قبلاً داده شده بوده.
 * باز کردن استور، کنسل کردن، بستن برنامه یا خطای شبکه، markRated نمی‌زند و کاربر طبق
 * فاصله‌های ratingScheduler دوباره پرسیده می‌شود.
 */
import React, {memo, useEffect, useState} from 'react';
import {AppState, Dimensions, NativeModules, StyleSheet, Text, View} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import {WaveIndicator} from 'react-native-indicators';
import * as Progress from 'react-native-progress';
import {
    useSharedValue,
    withTiming,
    Easing,
    runOnJS,
    useAnimatedReaction,
    cancelAnimation,
} from 'react-native-reanimated';
import useAppTheme from '../../hooks/theme/useAppTheme';
import {colors} from '../../hooks/theme/colors';
import Icon from '../../utils/Icon';
import Font from '../../utils/Font';
import Globals from '../../utils/Globals';
import LocalImageComponent from '../../components/image-components/LocalImageComponent';
import AlertBottomDrawerHelper from '../../components/alert-bottom-drawer/AlertBottomDrawerHelper';
import {showToast} from '../../components/custom-toast/ToastRef';
import {increaseNumberCoins} from '../../redux/slices/coinSlice';
import {store} from '../../redux/store/Store';
import {TARGET_STORE} from '../../utils/constants/build-config';
import {shouldAskForRating, markPromptShown, markRated} from './ratingScheduler';

const {CafeBazaar, Myket} = NativeModules;

/* ═════════════ ثابت‌ها ═════════════ */
const STORE_TYPE = 'rated_in_store'; // همان TYPE.STORE در FreeCoin (تا جایزه از هر دو جا فقط یک‌بار داده شود)
const VERIFY_SECONDS = 30;
const DEFAULT_DIALOG_DELAY_MS = 600; // مکث کوتاه تا انیمیشن goBack تمام شود و بعد دیالوگ بیاید

const CHECK_PERMISSION_QUERY = `
    query checkPermissionToGiveFreeCoin($type : String!){
        checkPermissionToGiveFreeCoin(type : $type) {
            status,
        }
    }
`;
const APPLY_FREE_COIN_QUERY = `
    mutation applyFreeCoinAllowedFieldsForUser($type : String!){
        applyFreeCoinAllowedFieldsForUser(type : $type) {
            status,
        }
    }
`;

/* ═════════════ وضعیت ماژول ═════════════ */
let pendingReturn = false; // کاربر به استور رفته و باید برگردد
let permissionPromise = Promise.resolve(false); // نتیجه‌ی استعلام مجوز
let appStateListenerAdded = false;
let lastAppState = AppState.currentState;
let checking = false; // جلوگیری از اجرای هم‌زمان دو چک

/* ═════════════ ابزارهای کوچک ═════════════ */
const showErrorToast = (message, duration = 5000) =>
    showToast({
        title: 'مشکلی پیش آمد',
        message,
        type: 'error',
        animationType: 'slide',
        position: 'top',
        duration,
    });

// «دیگر دیالوگ امتیاز را نشان نده». خطای ذخیره‌سازی هرگز نباید جریان سکه را خراب کند.
// فقط در این سه حالت صدا زده می‌شود (هرگز به‌محض باز شدن استور):
//   ۱) سکه با موفقیت داده شد   ۲) پرچم rated_in_store از قبل '1' بود   ۳) سرور گفت قبلاً گرفته (get_previous)
const safeMarkRated = async () => {
    try {
        await markRated();
    } catch (e) {}
};

// بعد از ۴ ثانیه آلرت بسته شود و خطا نشان داده شود (همان رفتار FreeCoin)
const hideAlertThenToast = message =>
    setTimeout(() => {
        AlertBottomDrawerHelper.hideAlert();
        showErrorToast(message);
    }, 4000);

/* ═════════════ تایمر ۳۰ ثانیه‌ای داخل آلرت ═════════════ */
const VerifyTimer = memo(function VerifyTimer({iconName, iconType, color, endTime}) {
    const theme = useAppTheme();
    const [second, setSecond] = useState(VERIFY_SECONDS);
    const timeLeft = useSharedValue(VERIFY_SECONDS);

    useEffect(() => {
        timeLeft.value = withTiming(0, {duration: VERIFY_SECONDS * 1000, easing: Easing.linear}, finished => {
            if (finished) {
                runOnJS(endTime)();
            }
        });
        return () => {
            cancelAnimation(timeLeft);
        };
    }, []);

    useAnimatedReaction(
        () => Math.ceil(timeLeft.value),
        (currentValue, previousValue) => {
            if (currentValue !== previousValue && currentValue >= 0) {
                runOnJS(setSecond)(currentValue);
            }
        },
    );

    return (
        <View style={styles.timerRoot}>
            <View style={styles.timerCircleBox}>
                <Icon name={iconName} type={iconType} style={{fontSize: 50, color}} />
                <View style={styles.timerWaveLayer}>
                    <WaveIndicator color={color} size={160} count={2} waveMode="fill" />
                </View>
                <View style={styles.timerProgressLayer}>
                    <Progress.Circle
                        progress={(VERIFY_SECONDS - second) / VERIFY_SECONDS}
                        size={100}
                        thickness={4}
                        color={theme.primary.a3}
                        borderWidth={1}
                        borderColor={theme.alert.a1}
                    />
                </View>
            </View>
            <Text style={{fontFamily: Font.black, color: theme.primary.a3, fontSize: 25}}>
                {String(second).padStart(2, '0')}
            </Text>
            <Text style={{fontFamily: Font.bakh_semi_bold, color: `${theme.primary.a3}99`, fontSize: 12}}>
                {'در حال بررسی...'}
            </Text>
        </View>
    );
});

/* ═════════════ آلرت «دریافت سکه» ═════════════ */
function showCoinAlert(text) {
    const {width} = Dimensions.get('window');
    AlertBottomDrawerHelper.showAlert({
        title: 'دریافت سکه',
        message: [
            {
                text,
                style: {
                    width: width - 30,
                    fontFamily: Font.bakh_semi_bold,
                    fontSize: 14,
                    color: colors.text.a2,
                    alignSelf: 'center',
                    textAlign: 'center',
                    lineHeight: 24,
                },
            },
        ],
        buttons: [{onPress: () => {}, text: 'متوجه شدم', loading: false, stayOpen: false, type: 'bold'}],
        options: {
            cancelable: true,
            icon: {
                Icon: () => (
                    <View style={{width, alignItems: 'center'}}>
                        <LocalImageComponent
                            path={require('../../assets/image/coin.png')}
                            width={80}
                            height={80}
                            resizeMode={'stretch'}
                            blank_background={true}
                        />
                    </View>
                ),
            },
        },
    });
}

/* ═════════════ استور ═════════════ */
async function openStore() {
    const nativeStore = TARGET_STORE == 'cafebazaar' ? CafeBazaar : TARGET_STORE == 'myket' ? Myket : null;
    if (!nativeStore) {
        return;
    }
    try {
        const success = await nativeStore.openRating();
        if (success) {
            // فقط یادآوری می‌کنیم که کاربر رفته؛ بعد از برگشتش آلرت تأیید + تایمر نشان داده می‌شود.
            // عمداً اینجا markRated نمی‌زنیم: باز شدن استور یعنی امتیاز داده نشده لزوماً.
            pendingReturn = true;
        }
    } catch (error) {
        if (TARGET_STORE == 'cafebazaar') {
            showErrorToast('خطایی در باز کردن کافه‌ بازار پیش آمد. یا اینکه کافه بازار نصب نیست.', 4000);
        } else if (error?.code === 'E_MYKET_NOT_INSTALLED') {
            showErrorToast('تا زمانی که مایکت نصب نباشد ثبت نظر و امتیاز ممکن نیست.', 4000);
        } else {
            showErrorToast('خطایی در باز کردن مایکت پیش آمد.', 4000);
        }
    }
}

/* ═════════════ سرور ═════════════ */
// true برمی‌گرداند اگر کاربر مجاز به دریافت سکه است
async function checkPermission() {
    try {
        const stored = await AsyncStorage.getItem(STORE_TYPE);
        if (stored === '1') {
            await safeMarkRated(); // قبلاً سکه گرفته؛ دیگر دیالوگ جایزه‌دار نشان داده نشود
            hideAlertThenToast('از این آیتم، شما قبلا سکه دریافت کرده‌اید.');
            return false;
        }
        const response = await axios({
            url: '/',
            method: 'post',
            data: {query: CHECK_PERMISSION_QUERY, variables: {type: STORE_TYPE}},
        });
        const result = response.data?.data?.checkPermissionToGiveFreeCoin;
        if (result?.status == 200) {
            return true;
        }
        const err = response?.data?.errors?.[0]?.data?.[0];
        hideAlertThenToast(err?.message ?? 'در حال حاضر امکان دریافت سکه از این آیتم وجود ندارد.');
        if (err?.get_previous == true) {
            await AsyncStorage.setItem(STORE_TYPE, '1');
            await safeMarkRated(); // سرور می‌گوید قبلاً گرفته
        }
        return false;
    } catch (error) {
        return false;
    }
}

async function applyReward() {
    try {
        const response = await axios({
            url: '/',
            method: 'post',
            data: {query: APPLY_FREE_COIN_QUERY, variables: {type: STORE_TYPE}},
        });
        const result = response.data?.data?.applyFreeCoinAllowedFieldsForUser;
        if (result?.status == 200) {
            await AsyncStorage.setItem(STORE_TYPE, '1');
            await safeMarkRated(); // سکه داده شد؛ دیگر نپرس
            AlertBottomDrawerHelper.hideAlert();
            const amount = store.getState().constants.free_coin_first_rating_in_store ?? 0;
            // سرور سکه را داده؛ این dispatch فقط موجودی نمایش‌داده‌شده‌ی اپ (Redux) را به‌روز می‌کند
            store.dispatch(increaseNumberCoins({number: amount}));
            setTimeout(() => {
                showCoinAlert(`تعداد ${amount} سکه با موفقیت به حساب کاربری شما اضافه شد.`);
            }, 700);
        } else {
            AlertBottomDrawerHelper.hideAlert();
        }
    } catch (error) {
        AlertBottomDrawerHelper.hideAlert();
    }
}

/* ═════════════ آلرت «آیا امتیاز دادید؟» با تایمر ═════════════ */
function showVerificationAlert() {
    const {width} = Dimensions.get('window');

    // استعلام هم‌زمان با نمایش آلرت شروع می‌شود؛ تایمر در پایان منتظر نتیجه‌اش می‌ماند
    permissionPromise = checkPermission();

    const game = Globals.game_name_fa;
    const hintStyle = {
        maxWidth: width - 30,
        fontFamily: Font.bakh_semi_bold,
        fontSize: 12,
        color: colors.text.a6,
        alignSelf: 'flex-start',
        textAlign: 'justify',
        lineHeight: 25,
    };

    AlertBottomDrawerHelper.showAlert({
        title: `${game} در فروشگاه`,
        message: [
            {
                text: `آیا به ${game} امتیاز دادید؟`,
                style: {
                    maxWidth: width - 65,
                    fontFamily: Font.bakh_bold,
                    fontSize: 16,
                    color: colors.alert.a1,
                    alignSelf: 'flex-start',
                    textAlign: 'justify',
                    lineHeight: 30,
                },
            },
            {text: '* اگر امتیاز ثبت نکردید، برای دریافت سکه دوباره تلاش کنید.', style: hintStyle},
            {text: '* اگر امتیاز ثبت کردید، برای دریافت سکه لطفا کمی منتظر بمانید.', style: hintStyle},
        ],
        buttons: [
            {onPress: () => openStore(), text: 'تلاش دوباره', loading: false, stayOpen: false, type: 'bold'},
            {onPress: () => {}, text: 'لغو ثبت امتیاز', loading: false, stayOpen: false, type: 'border'},
        ],
        options: {
            cancelable: false,
            icon: {
                Icon: () => (
                    <VerifyTimer
                        iconName={'star-half-alt'}
                        iconType={'FontAwesome5'}
                        color={colors.primary.a5}
                        endTime={async () => {
                            const allowed = await permissionPromise;
                            if (allowed === true) {
                                applyReward();
                            } else {
                                AlertBottomDrawerHelper.hideAlert();
                            }
                        }}
                    />
                ),
            },
        },
    });
}

/* ═════════════ دیالوگ «از حرف حساب راضی بودی؟» ═════════════ */
function showRatingDialog() {
    const {width} = Dimensions.get('window');
    const reward = store.getState().constants.free_coin_first_rating_in_store;

    AlertBottomDrawerHelper.showAlert({
        title: 'ثبت امتیاز',
        message: [
            {
                text: 'از «حرف حساب» راضی بودی؟',
                style: {maxWidth: width - 65, fontFamily: Font.bakh_bold, fontSize: 18, color: colors.primary.a3, alignSelf: 'flex-start', textAlign: 'justify', lineHeight: 30},
            },
            {
                text: 'اگه بازی رو دوست داشتی، با ثبت امتیاز کمک کن بیشتر دیده بشه.',
                style: {maxWidth: width - 30, fontFamily: Font.bakh_semi_bold, fontSize: 14, color: colors.text.a2, alignSelf: 'flex-start', textAlign: 'justify', lineHeight: 30},
            },
            {
                text: `با ثبت امتیاز ${reward} سکه جایزه بگیر!`,
                style: {maxWidth: width - 30, fontFamily: Font.bakh_semi_bold, fontSize: 14, color: colors.primary.a1, alignSelf: 'flex-start', textAlign: 'justify', lineHeight: 30, marginTop: 30},
            },
        ],
        buttons: [
            {
                onPress: async () => {
                    openStore();
                },
                text: 'امتیاز می‌دم',
                loading: false,
                type: 'bold',
            },
            {
                onPress: () => {},
                text: 'الان نه',
                loading: false,
                type: 'border',
                borderColor: 'transparent',
                borderWidth: 0,
            },
        ],
        options: {
            cancelable: false,
            icon: {
                Icon: () => (
                    <View style={{width: '100%', flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'center', gap: 5}}>
                        <LocalImageComponent
                            path={require('../../assets/image/star.png')}
                            width={47.5}
                            height={50}
                            resizeMode="stretch"
                            blank_background
                            style={{marginBottom: 6}}
                        />
                        <LocalImageComponent
                            path={require('../../assets/image/star.png')}
                            width={76}
                            height={80}
                            resizeMode="stretch"
                            blank_background
                        />
                        <LocalImageComponent
                            path={require('../../assets/image/star.png')}
                            width={47.5}
                            height={50}
                            resizeMode="stretch"
                            blank_background
                            style={{marginBottom: 6}}
                        />
                    </View>
                ),
            },
        },
    });
}

/* ═════════════ تشخیص برگشت کاربر از استور ═════════════ */
function ensureAppStateListener() {
    if (appStateListenerAdded) {
        return;
    }
    appStateListenerAdded = true;
    AppState.addEventListener('change', nextAppState => {
        if (lastAppState.match(/inactive|background/) && nextAppState === 'active') {
            if (pendingReturn) {
                pendingReturn = false;
                showVerificationAlert();
            }
        }
        lastAppState = nextAppState;
    });
}

/* ═════════════ API بیرونی ═════════════ */

/**
 * بعد از تمام شدن یک مرحله صدا بزن (از هر فایلی؛ هوک و کامپوننت لازم نیست).
 * اگر مرحله ≥ حداقل باشد، امتیاز نداده باشد و فاصله‌ی زمانی رعایت شده باشد، دیالوگ را نشان می‌دهد.
 *
 * @param {number} completedStage شماره‌ی مرحله‌ای که کاربر همین الان تمام کرده
 * @param {{delay?: number}} options delay: مکث (میلی‌ثانیه) قبل از نمایش دیالوگ؛ پیش‌فرض ۶۰۰
 * @returns {Promise<boolean>} true اگر دیالوگ برنامه‌ریزی شد
 */
export async function askForStoreRatingIfNeeded(completedStage, {delay = DEFAULT_DIALOG_DELAY_MS} = {}) {
    if (checking) {
        return false;
    }
    checking = true;
    try {
        if (!(await shouldAskForRating(completedStage))) {
            return false;
        }
        // کاربری که قبلاً از این آیتم سکه گرفته (مثلاً از صفحه‌ی سکه رایگان): دیالوگ جایزه‌دار نشان نده
        // (این چک بعد از شرط مرحله است تا برای مرحله‌های کمتر از ۷ اصلاً حافظه خوانده نشود)
        let alreadyRewarded = false;
        try {
            alreadyRewarded = (await AsyncStorage.getItem(STORE_TYPE)) === '1';
        } catch (e) {}
        if (alreadyRewarded) {
            await safeMarkRated();
            return false;
        }
        ensureAppStateListener();
        await markPromptShown();
        setTimeout(showRatingDialog, delay);
        return true;
    } catch (e) {
        return false;
    } finally {
        checking = false;
    }
}

export default askForStoreRatingIfNeeded;

const styles = StyleSheet.create({
    timerRoot: {width: '100%', alignItems: 'center'},
    timerCircleBox: {width: 120, height: 120, alignItems: 'center', justifyContent: 'center'},
    timerWaveLayer: {
        position: 'absolute',
        width: '100%',
        height: '100%',
        alignItems: 'center',
        justifyContent: 'center',
    },
    timerProgressLayer: {position: 'absolute'},
});