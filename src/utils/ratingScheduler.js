import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY = 'rating_state_v1';

// برای تست می‌توانی موقتاً کوچک‌ترش کنی، مثلاً 10 * 1000
const DAY = 24 * 60 * 60 * 1000;

const CONFIG = {
  minDaysSinceFirstOpen: 1, // حداقل روز از اولین ورود
  minLaunches: 2,           // حداقل دفعات باز شدن برنامه
  baseIntervalDays: 4,      // فاصله‌ی اول بعد از «بعداً» (بعدی‌ها: 8، 16، 32، ...)
  maxIntervalDays: 60,      // سقف فاصله (قابل تغییر)
  maxPrompts: 7,            // سقف کل دفعات پرسش در عمر برنامه
};

const defaultState = {
  firstOpenAt: null,
  launchCount: 0,
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

// جلوگیری از شمارش چندباره در یک اجرای برنامه (مثلاً اگر Home دوباره mount شد)
let launchRegistered = false;

/** در هر اجرای برنامه فقط یک بار شمرده می‌شود */
export async function registerLaunch() {
  if (launchRegistered) return;
  launchRegistered = true;

  const state = await load();
  if (!state.firstOpenAt) state.firstOpenAt = Date.now();
  state.launchCount += 1;
  await save(state);
}

/** فاصله‌ی لازم تا پرسش بعدی، بر اساس تعداد دفعاتی که پرسیده شده */
function getWaitDays(promptCount) {
  // promptCount=1 → 4، 2 → 8، 3 → 16، ...
  const days = CONFIG.baseIntervalDays * Math.pow(2, promptCount - 1);
  return Math.min(days, CONFIG.maxIntervalDays);
}

/** آیا الان وقت پرسیدن است؟ */
export async function shouldAskForRating() {
  const state = await load();
  const now = Date.now();

  if (state.rated) return false;
  if (state.promptCount >= CONFIG.maxPrompts) return false;
  if (!state.firstOpenAt) return false;

  // شرط شروع
  if (now - state.firstOpenAt < CONFIG.minDaysSinceFirstOpen * DAY) return false;
  if (state.launchCount < CONFIG.minLaunches) return false;

  // اولین پرسش
  if (state.lastPromptAt === null) return true;

  // پرسش‌های بعدی: فاصله دو برابر می‌شود
  const waitDays = getWaitDays(state.promptCount);
  return now - state.lastPromptAt >= waitDays * DAY;
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