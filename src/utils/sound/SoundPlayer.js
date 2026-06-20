import { AppState } from 'react-native';
import Sound from 'react-native-sound';

// تنظیم دسته‌بندی پخش برای اجازه پخش در حالت سکوت (اختیاری اما مفید)
Sound.setCategory('Playback');

/**
 * کلاس SoundPlayer برای مدیریت پخش صدا به صورت حرفه‌ای.
 * این کلاس امکان پخش صدا از باندل اپلیکیشن یا از استوریج محلی را فراهم می‌کند.
 * مدیریت خودکار پخش/توقف در حالت بک‌گراند و فورگراند اپلیکیشن اضافه شده است.
 */
class SoundPlayer {
  constructor(soundName, fromStorage = false, loop = false, volume = 1.0) {
    this.sound = null;
    this.isLoaded = false;
    this.error = null;

    // --- متغیرهای جدید برای مدیریت بک‌گراند/فورگراند ---
    this.isPlaying = false;        // وضعیت فعلی پخش
    this._systemPaused = false;    // آیا سیستم‌عامل (بک‌گراند شدن) آهنگ را متوقف کرده؟
    this.onEndCallback = null;     // ذخیره کال‌بک کاربر برای زمانی که آهنگ بعد از رزومه شدن تمام می‌شود

    // تعیین basePath بر اساس fromStorage
    const basePath = fromStorage ? '' : Sound.MAIN_BUNDLE;

    // بارگذاری صدا با مدیریت خطا
    this.sound = new Sound(soundName, basePath, (error) => {
      if (error) {
        this.error = error;
        return;
      }
      this.isLoaded = true;
      this.sound.setVolume(volume);
      if (loop) {
        this.setLoop(true);
      }
    });

    // سابسکرایب به تغییرات وضعیت اپلیکیشن (Background / Foreground)
    this.appStateSubscription = AppState.addEventListener('change', this._handleAppStateChange);
  }

  /**
   * متد خصوصی برای هندل کردن وضعیت بک‌گراند و فورگراند
   */
  _handleAppStateChange = (nextAppState) => {
    if (nextAppState.match(/inactive|background/)) {
      // اگر اپلیکیشن به بک‌گراند رفت و آهنگ در حال پخش بود:
      if (this.isPlaying && this.sound) {
        this._systemPaused = true; // فلگ می‌زنیم که سیستم متوقفش کرده
        this.sound.pause();
      }
    } else if (nextAppState === 'active') {
      // اگر اپلیکیشن به فورگراند برگشت و سیستم آهنگ را متوقف کرده بود:
      if (this._systemPaused && this.sound) {
        this._systemPaused = false;
        
        // ادامه پخش آهنگ
        this.sound.play((success) => {
          if (this._systemPaused) return; // جلوگیری از تداخل در رفت و آمدهای سریع
          this.isPlaying = false;
          // فراخوانی کال‌بکی که کاربر از قبل پاس داده بود
          if (this.onEndCallback) {
            this.onEndCallback(success);
          }
        });
      }
    }
  };

  /**
   * Factory method برای ایجاد instance به صورت async
   */
  static async create(soundName, fromStorage = false, loop = false, volume = 1.0) {
    const player = new SoundPlayer(soundName, fromStorage, loop, volume);
    return new Promise((resolve, reject) => {
      if (player.error) {
        reject(player.error);
        return;
      }
      if (player.isLoaded) {
        resolve(player);
        return;
      }
      const interval = setInterval(() => {
        if (player.error) {
          clearInterval(interval);
          reject(player.error);
        } else if (player.isLoaded) {
          clearInterval(interval);
          resolve(player);
        }
      }, 50);
      setTimeout(() => {
        clearInterval(interval);
        reject(new Error('Sound loading timeout'));
      }, 5000);
    });
  }

  /**
   * پخش صدا.
   * @param {function} [onEndCallback] - کال‌بک اختیاری برای پایان پخش.
   */
  play(onEndCallback = null) {
    if (!this.isLoaded) {
      return;
    }
    
    this.isPlaying = true;
    this._systemPaused = false;
    this.onEndCallback = onEndCallback; // کال‌بک را در کلاس ذخیره می‌کنیم

    this.sound.play((success) => {
      // اگر توقف به دلیل بک‌گراند رفتن بوده، این رویدادِ پایانِ موفقیت‌آمیز نیست، پس نادیده‌اش می‌گیریم
      if (this._systemPaused) return;

      this.isPlaying = false;
      if (this.onEndCallback) {
        this.onEndCallback(success);
      }
    });
  }

  /**
   * مکث پخش صدا به صورت دستی.
   */
  pause() {
    if (this.sound) {
      this.isPlaying = false;
      this._systemPaused = false; // چون دستی پاوز شده، پس وقتی برگشتیم به اپ نباید خودکار پخش بشه
      this.sound.pause();
    }
  }

  /**
   * توقف پخش صدا و ریست موقعیت به ابتدا.
   */
  stop() {
    if (this.sound) {
      this.isPlaying = false;
      this._systemPaused = false;
      this.sound.stop(() => {});
    }
  }

  /**
   * تنظیم حالت لوپ (تکرار پشت سر هم).
   */
  setLoop(enable) {
    if (this.sound) {
      this.sound.setNumberOfLoops(enable ? -1 : 0);
    }
  }

  /**
   * آزادسازی منابع صدا برای جلوگیری از نشت حافظه.
   */
  release() {
    // حذف EventListener تا حافظه را پر نکند (Memory Leak)
    if (this.appStateSubscription) {
      this.appStateSubscription.remove();
    }

    if (this.sound) {
      this.sound.release();
      this.sound = null;
      this.isLoaded = false;
      this.isPlaying = false;
      this._systemPaused = false;
    }
  }
}

export default SoundPlayer;

// مدل استفاده و فراخوانی
// const onClick = async () => {
//   if (!lock) {
//     onPress()
//     try {
//       const player = await SoundPlayer.create('pop.wav', false, false, 0.02);
//       player.play((success) => {
//         if (success) {
//           player.release();
//         }
//       });
//     } catch (e) {
//       null
//     }
//   }
// };



// const [player, setPlayer] = useState(null);
// // پیش‌لود صدا در mount کامپوننت
// useEffect(() => {
//   const preloadSound = async () => {
//     try {
//       const loadedPlayer = await SoundPlayer.create('pop.wav', false, false, 1.0); // پارامترها رو تنظیم کن
//       setPlayer(loadedPlayer);
//     } catch (error) {
//       null
//     }
//   };
//   preloadSound();
//   // cleanup در unmount برای release منابع
//   return () => {
//     if (player) {
//       player.release();
//     }
//   };
// }, []);

// const onClick = () => {
//   if (player) {
//     player.play((success) => {
//       if (success) {
//         // اگر نیاز به reset برای پخش بعدی داری (برای افکت کوتاه)
//         player.stop(); // stop و reset به ابتدا
//       }
//     });
//   } else {
//     
//   }
// };