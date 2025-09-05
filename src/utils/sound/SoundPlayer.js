import Sound from 'react-native-sound';

// تنظیم دسته‌بندی پخش برای اجازه پخش در حالت سکوت (اختیاری اما مفید)
Sound.setCategory('Playback');

/**
 * کلاس SoundPlayer برای مدیریت پخش صدا به صورت حرفه‌ای.
 * این کلاس امکان پخش صدا از باندل اپلیکیشن یا از استوریج محلی (حافظه دستگاه) را فراهم می‌کند.
 * همچنین متدهایی برای کنترل پخش مانند play، pause، stop و تنظیم لوپ (تکرار پشت سر هم) دارد.
 * 
 * @param {string} soundName - نام فایل صدا (مانند 'pop.wav'). اگر fromStorage=true باشد، این باید مسیر کامل فایل باشد (مانند '/sdcard/Downloads/pop.wav').
 * @param {boolean} [fromStorage=false] - اگر true باشد، صدا از استوریج محلی بارگذاری می‌شود (basePath خالی می‌ماند).
 * @param {boolean} [loop=false] - اگر true باشد، صدا به صورت تکراری (لوپ) پخش می‌شود.
 * @param {number} [volume=1.0] - حجم صدا (از 0.0 تا 1.0). مقدار پیش‌فرض 1.0 (حداکثر حجم).
 */
class SoundPlayer {
  constructor(soundName, fromStorage = false, loop = false, volume = 1.0) {
    this.sound = null;
    this.isLoaded = false;
    this.error = null;

    // تعیین basePath بر اساس fromStorage
    const basePath = fromStorage ? '' : Sound.MAIN_BUNDLE;

    // بارگذاری صدا با مدیریت خطا
    this.sound = new Sound(soundName, basePath, (error) => {
      if (error) {
        this.error = error;
        return;
      }
      this.isLoaded = true;
      // تنظیم حجم صدا
      this.sound.setVolume(volume);
      // تنظیم لوپ اگر درخواست شده باشد
      if (loop) {
        this.setLoop(true);
      }
    });
  }

  /**
   * Factory method برای ایجاد instance به صورت async و منتظر ماندن برای لود.
   * @returns {Promise<SoundPlayer>} - promise که instance آماده رو برمی‌گردونه.
   */
  static async create(soundName, fromStorage = false, loop = false, volume = 1.0) {
    const player = new SoundPlayer(soundName, fromStorage, loop, volume);
    return new Promise((resolve, reject) => {
      // اگر بلافاصله error داشته باشه
      if (player.error) {
        reject(player.error);
        return;
      }
      // اگر بلافاصله لود شده باشه (نادر اما ممکن)
      if (player.isLoaded) {
        resolve(player);
        return;
      }
      // منتظر callback لود (با استفاده از interval ساده برای چک)
      const interval = setInterval(() => {
        if (player.error) {
          clearInterval(interval);
          reject(player.error);
        } else if (player.isLoaded) {
          clearInterval(interval);
          resolve(player);
        }
      }, 50); // چک هر 50ms - می‌تونی تنظیم کنی
      // تایم‌اوت برای جلوگیری از لوپ بی‌نهایت (مثلاً 5 ثانیه)
      setTimeout(() => {
        clearInterval(interval);
        reject(new Error('Sound loading timeout'));
      }, 5000);
    });
  }

  /**
   * پخش صدا. اگر صدا بارگذاری نشده باشد، خطا می‌دهد.
   * @param {function} [onEndCallback] - کال‌بک اختیاری برای پایان پخش.
   */
  play(onEndCallback = null) {
    if (!this.isLoaded) {
      return;
    }
    this.sound.play((success) => {
      if (success) {
      } else {
      }
      if (onEndCallback) {
        onEndCallback(success);
      }
    });
  }

  /**
   * مکث پخش صدا.
   */
  pause() {
    if (this.sound) {
      this.sound.pause();
    }
  }

  /**
   * توقف پخش صدا و ریست موقعیت به ابتدا.
   */
  stop() {
    if (this.sound) {
      this.sound.stop(() => {
      });
    }
  }

  /**
   * تنظیم حالت لوپ (تکرار پشت سر هم).
   * @param {boolean} enable - اگر true باشد، لوپ فعال می‌شود (-1 برای تکرار نامحدود)، иначе تک‌باره پخش می‌شود.
   */
  setLoop(enable) {
    if (this.sound) {
      this.sound.setNumberOfLoops(enable ? -1 : 0);
    }
  }

  /**
   * آزادسازی منابع صدا برای جلوگیری از نشت حافظه.
   * بعد از اتمام استفاده، این متد را فراخوانی کنید.
   */
  release() {
    if (this.sound) {
      this.sound.release();
      this.sound = null;
      this.isLoaded = false;
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