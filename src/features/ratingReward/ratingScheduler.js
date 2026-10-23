import AsyncStorage from '@react-native-async-storage/async-storage';

// کلید قبلی عمداً حفظ شده تا کاربرانی که قبلاً امتیاز داده‌اند (rated=true) دوباره اذیت نشوند
const KEY = 'rating_state_v1';

// برای تست می‌توانی موقتاً کوچک‌ترش کنی، مثلاً 10 * 1000
const DAY = 24 * 60 * 60 * 1000;

const CONFIG = {
  minStage: 9,                  // اولین نمایش: کاربر باید حداقل این مرحله را تمام کرده باشد
  intervalsDays: [4, 8, 16, 32], // فاصله‌ی بعد از نمایش اول، دوم، سوم و چهارم
  repeatIntervalDays: 30,       // از نمایش پنجم به بعد: هر ۳۰ روز، بدون سقف تعداد
};

const defaultState = {
  promptCount: 0,
  lastPromptAt: null,
  rated: false,
};

async function load() {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    return raw ? { ...defaultState, ...JSON.parse(raw) } : { ...defaultState };
  } catch {
    return { ...defaultState };
  }
}

async function save(state) {
  try {
    await AsyncStorage.setItem(KEY, JSON.stringify(state));
  } catch {}
}

/** فاصله‌ی لازم (به روز) تا پرسش بعدی، بر اساس تعداد دفعاتی که تا الان پرسیده شده */
function getWaitDays(promptCount) {
  // promptCount=1 → 4، 2 → 8، 3 → 16، 4 → 32، 5 و بیشتر → 30
  return CONFIG.intervalsDays[promptCount - 1] ?? CONFIG.repeatIntervalDays;
}

/**
 * آیا الان وقت پرسیدن است؟
 * @param {number} completedStage شماره‌ی مرحله‌ای که کاربر همین الان تمام کرده
 */
export async function shouldAskForRating(completedStage) {
  const stage = Number(completedStage);
  if (!Number.isFinite(stage) || stage < CONFIG.minStage) return false;

  const state = await load();
  if (state.rated) return false;

  // اولین پرسش
  if (state.lastPromptAt === null) return true;

  // پرسش‌های بعدی
  const waitDays = getWaitDays(state.promptCount);
  return Date.now() - state.lastPromptAt >= waitDays * DAY;
}

/** وقتی دیالوگ نشان داده شد صدا بزن */
export async function markPromptShown() {
  const state = await load();
  state.promptCount += 1;
  state.lastPromptAt = Date.now();
  await save(state);
}

/** کاربر امتیاز داد → دیگر نمی‌پرسیم */
export async function markRated() {
  const state = await load();
  state.rated = true;
  await save(state);
}