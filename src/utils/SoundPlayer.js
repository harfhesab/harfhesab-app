// SoundPlayer.js
import Sound from 'react-native-sound';

// تنظیم دسته‌بندی پخش برای اجازه پخش در حالت سکوت (اختیاری اما مفید)
Sound.setCategory('Playback');

/**
 * کلاس SoundPlayer برای مدیریت پخش صدا به صورت حرفه‌ای.
 * این کلاس امکان پخش صدا از باندل اپلیکیشن یا از استوریج محلی (حافظه دستگاه) را فراهم می‌کند.
 * همچنین متدهایی برای کنترل پخش مانند play، pause، stop و تنظیم لوپ (تکرار پشت سر هم) دارد.
 * 
 * @param {string} soundName - نام فایل صدا (مانند 'my_sound.mp3'). اگر fromStorage=true باشد، این باید مسیر کامل فایل باشد (مانند '/sdcard/Downloads/my_sound.mp3').
 * @param {boolean} [fromStorage=false] - اگر true باشد، صدا از استوریج محلی بارگذاری می‌شود (basePath خالی می‌ماند).
 * @param {boolean} [loop=false] - اگر true باشد، صدا به صورت تکراری (لوپ) پخش می‌شود.
 */
class SoundPlayer {
  constructor(soundName, fromStorage = false, loop = false) {
    this.sound = null;
    this.isLoaded = false;
    this.error = null;

    // تعیین basePath بر اساس fromStorage
    const basePath = fromStorage ? '' : Sound.MAIN_BUNDLE;

    // بارگذاری صدا با مدیریت خطا
    this.sound = new Sound(soundName, basePath, (error) => {
      if (error) {
        console.error('Failed to load the sound:', error);
        this.error = error;
        return;
      }
      this.isLoaded = true;
      console.log(`Sound loaded successfully. Duration: ${this.sound.getDuration()} seconds`);

      // تنظیم لوپ اگر درخواست شده باشد
      if (loop) {
        this.setLoop(true);
      }
    });
  }

  /**
   * پخش صدا. اگر صدا بارگذاری نشده باشد، خطا می‌دهد.
   * @param {function} [onEndCallback] - کال‌بک اختیاری برای پایان پخش.
   */
  play(onEndCallback = null) {
    if (!this.isLoaded) {
      console.error('Sound is not loaded yet or failed to load.');
      return;
    }
    this.sound.play((success) => {
      if (success) {
        console.log('Sound played successfully.');
      } else {
        console.error('Playback failed due to audio decoding errors.');
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
      console.log('Sound paused.');
    } else {
      console.error('No sound instance to pause.');
    }
  }

  /**
   * توقف پخش صدا و ریست موقعیت به ابتدا.
   */
  stop() {
    if (this.sound) {
      this.sound.stop(() => {
        console.log('Sound stopped and reset.');
      });
    } else {
      console.error('No sound instance to stop.');
    }
  }

  /**
   * تنظیم حالت لوپ (تکرار پشت سر هم).
   * @param {boolean} enable - اگر true باشد، لوپ فعال می‌شود (-1 برای تکرار نامحدود)، иначе تک‌باره پخش می‌شود.
   */
  setLoop(enable) {
    if (this.sound) {
      this.sound.setNumberOfLoops(enable ? -1 : 0);
      console.log(`Loop ${enable ? 'enabled' : 'disabled'}.`);
    } else {
      console.error('No sound instance to set loop.');
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
      console.log('Sound resources released.');
    }
  }
}

export default SoundPlayer;



// مدل استفاده و فراخوانی
// import SoundPlayer from './SoundPlayer';

// // مثال پخش از باندل اپلیکیشن بدون لوپ
// const player = new SoundPlayer('my_sound.mp3');
// player.play();

// // مثال پخش از استوریج با لوپ
// const storagePlayer = new SoundPlayer('/sdcard/Downloads/my_sound.mp3', true, true);
// storagePlayer.play();

// // کنترل‌ها
// storagePlayer.pause();
// storagePlayer.stop();
// storagePlayer.setLoop(false); // غیرفعال کردن لوپ
// storagePlayer.release(); // آزادسازی بعد از استفاده


// // ایجاد instance اول
// const player1 = new SoundPlayer('sound1.mp3');
// player1.play();

// // ایجاد instance دوم و پخش همزمان
// const player2 = new SoundPlayer('sound2.mp3');
// player2.play();

// // کنترل جداگانه: مثلاً توقف یکی از آن‌ها
// player1.stop();

// // آزادسازی منابع بعد از اتمام
// player1.release();
// player2.release();