import React, { useCallback, useMemo } from 'react';
import { ImageBackground, StyleSheet, View } from 'react-native';
import SandTimer from './sand-timer/SandTimer';
import TimerUIThread from './TimerUIThread';
import { colors } from '../../hooks/theme/colors';
import Font from '../../utils/Font';
import { stopSandTimerLoopSound, useSandTimerLoopSound } from '../../utils/sound/LoopSuonndFunctions';

const FRAME_IMAGE = require("../../assets/image/frame_badge.png");
const NO_OP = () => {};

const calculateTimeRemaining = (remainingSeconds, syncedAtTimestamp) => {
    let remaining = Math.max(0, Math.floor(remainingSeconds));
    const elapsedSinceSync = (Date.now() - syncedAtTimestamp) / 1000;
    remaining = Math.max(0, remaining - elapsedSinceSync);
    
    const days = Math.floor(remaining / 86400);
    const hours = Math.floor((remaining % 86400) / 3600);
    const minutes = Math.floor((remaining % 3600) / 60);
    const seconds = Math.floor(remaining % 60);
    
    return {
        remainingSeconds: remaining,
        days: days > 0 ? days : undefined,
        hours: days > 0 ? hours : (hours > 0 ? hours : undefined),
        minutes,
        seconds
    };
};

const TimerAndSandTimer = ({
  totalSeconds,
  remainingSeconds,
  remainingSyncedAt,
  onFinish = NO_OP,
  paused,
}) => {
  useSandTimerLoopSound()
  // تبدیل Date به timestamp عددی جهت جلوگیری از ساخت آبجکت مجدد
  const syncedAtTimestamp = typeof remainingSyncedAt === 'object' && remainingSyncedAt?.getTime 
    ? remainingSyncedAt.getTime() 
    : remainingSyncedAt;

  const timer = useMemo(
    () => calculateTimeRemaining(remainingSeconds, syncedAtTimestamp),
    [remainingSeconds, syncedAtTimestamp]
  );

  const onFinishOperation = useCallback(()=>{
    stopSandTimerLoopSound()
    onFinish()
  }, [])

  return (
    <View style={styles.container}>
        <View style={styles.badgeWrapper}>
          <ImageBackground
              source={FRAME_IMAGE}
              style={styles.imageBackground}
              imageStyle={styles.imageStyle}
              resizeMode="stretch"
          >
            <TimerUIThread
                style={styles.timerText}
                seconds={timer.seconds}
                minutes={timer.minutes}
                hours={timer.hours}
                days={timer.days}
                separator=":"
                onFinish={onFinishOperation}
                paused={paused}
            />
          </ImageBackground>
        </View>
        <SandTimer
          totalSeconds={totalSeconds}
          remainingSeconds={timer.remainingSeconds}
          width={60}
          height={90}
          paused={paused}
        />
    </View>
  );
};

const arePropsEqual = (prevProps, nextProps) => {
  const prevTimestamp = typeof prevProps.remainingSyncedAt === 'object' && prevProps.remainingSyncedAt?.getTime 
    ? prevProps.remainingSyncedAt.getTime() 
    : prevProps.remainingSyncedAt;

  const nextTimestamp = typeof nextProps.remainingSyncedAt === 'object' && nextProps.remainingSyncedAt?.getTime 
    ? nextProps.remainingSyncedAt.getTime() 
    : nextProps.remainingSyncedAt;

  return (
    prevProps.totalSeconds === nextProps.totalSeconds &&
    prevProps.remainingSeconds === nextProps.remainingSeconds &&
    prevTimestamp === nextTimestamp &&
    prevProps.onFinish === nextProps.onFinish && 
    prevProps.paused === nextProps.paused
  );
};

export default React.memo(TimerAndSandTimer, arePropsEqual);

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  badgeWrapper: {
    direction: 'rtl',
  },
  imageBackground: {
    width: 60,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageStyle: {
    resizeMode: 'stretch',
  },
  timerText: {
    fontSize: 16,
    fontFamily: Font.black,
    color: colors.primary.a5,
  },
});