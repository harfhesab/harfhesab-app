import React, { memo } from 'react';
import { StyleSheet, View } from 'react-native';
import { useSelector } from 'react-redux';
import { useLettersStatic } from '../../context/LettersContext';
import HiddenWords from './HiddenWords';
import NumberCoins from '../../../coin/NumberCoins';
import NumberCoinsHelp from '../../../coin/NumberCoinsHelp';
import Setting from '../../../icon/Setting';
import Back from '../../../icon/Back';
import TimerAndSandTimer from '../../../timer/TimerAndSandTimer';
import type { RootState } from '../../../../redux/store/RootReducer';
import { useStatusBarHeight } from '../../../../hooks/useStatusBarHeight';

const HEADER_HEIGHT = 55;

function TopHeader() {
  const statusBarHeight = useStatusBarHeight();
  const { type, applyForHelp, timeLimitData, gameTimeIsOver } = useLettersStatic();
  const helpCost = useSelector((state: RootState) => {
    if (type === 'stage-game') {
      return state.constants.coins_for_get_help_letter_connecting_stage_game;
    }
    if (type === 'package-game') {
      return state.constants.coins_for_get_help_letter_connecting_package_game;
    }
    if (type === 'word-game') {
      return state.constants.coins_for_get_help_word_game;
    }
    return false;
  });
  const timeLimit = type === 'harf-akhar' ? timeLimitData?.time_limit : undefined;

  return (
    <View style={[styles.container, { marginTop: statusBarHeight }]}>
      <View style={styles.header}>
        <View style={styles.group}>
          <Setting />
          <View style={styles.rtl}>
            <NumberCoins />
          </View>
        </View>
        <View style={styles.group}>
          {type !== 'harf-akhar' && <NumberCoinsHelp numberCoinsHelp={helpCost} onPress={applyForHelp} />}
          <Back />
        </View>
      </View>
      {!!timeLimit && (
        <View style={styles.timer}>
          <TimerAndSandTimer
            totalSeconds={timeLimit}
            remainingSeconds={timeLimitData?.remaining_time_seconds}
            remainingSyncedAt={timeLimitData?.remaining_synced_at}
            onFinish={gameTimeIsOver}
            paused={false}
          />
        </View>
      )}
      {/* درست زیر هدر قرار دارد؛ WordSlots خانه‌هایش را از این ناحیه دور نگه می‌دارد. */}
      <View style={styles.hiddenWords}>
        <HiddenWords />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    zIndex: 1,
  },
  header: {
    height: HEADER_HEIGHT,
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
  },
  group: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  rtl: {
    direction: 'rtl',
  },
  timer: {
    position: 'absolute',
    width: '100%',
    alignItems: 'flex-end',
    end: 57,
    paddingTop: 7.5,
  },
  hiddenWords: {
    position: 'absolute',
    bottom: -57,
    start: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default memo(TopHeader);
