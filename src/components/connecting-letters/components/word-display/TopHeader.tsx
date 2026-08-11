import React from 'react';
import {Dimensions, ImageBackground, StyleSheet, Text, TouchableOpacity} from 'react-native';
import { useLetters } from '../../context/LettersContext';
import { View } from 'react-native';
import NumberCoins from '../../../coin/NumberCoins';
import Font from '../../../../utils/Font';
import NumberCoinsHelp from '../../../coin/NumberCoinsHelp';
import { useSelector } from 'react-redux';
import { RootState } from '../../../../redux/store/RootReducer';
import Setting from '../../../icon/Setting';
import Back from '../../../icon/Back';
import { STATUS_BAR_HEIGHT } from '../../../../utils/constants/constants';
import HiddenWords from './HiddenWords';
import TimerAndSandTimer from '../../../timer/TimerAndSandTimer';

const {width} = Dimensions.get("screen");
const TopHeader = () => {
  const {coins_for_get_help_letter_connecting_stage_game, coins_for_get_help_letter_connecting_package_game} = useSelector((state: RootState) => state.constants);
  const { type, applyForHelp, timeLimitData } = useLetters();

  return (
    <View style={{width:width, marginTop:STATUS_BAR_HEIGHT}}>
      <View style={styles.header}>
          <View style={{flexDirection:'row', alignItems:'center', gap:7}}>
              <Setting/>
              <View style={{direction:'rtl'}}>
                  <NumberCoins />
              </View>
          </View>
          <View style={{flexDirection:'row', alignItems:'center', gap:7}}>
            {
              type !== "kalam-akhar"&&
              <NumberCoinsHelp
                  numberCoinsHelp={type == "stage-game"?coins_for_get_help_letter_connecting_stage_game:type == "package-game"&&coins_for_get_help_letter_connecting_package_game}
                  onPress={applyForHelp}
              />
            }
          <Back/>
          </View>
      </View>
      {
        (type == "kalam-akhar" && timeLimitData?.time_limit)&&
        <View style={{position:'absolute', width:"100%", alignItems:'flex-end', end:57, paddingTop:7.5}}>
          <TimerAndSandTimer
            totalSeconds={timeLimitData?.time_limit}
            remainingSeconds={timeLimitData?.remaining_time_seconds}
            remainingSyncedAt={timeLimitData?.remaining_synced_at}
          />
        </View>
      }
      <View style={{alignItems:'center', justifyContent:'center', position:'absolute', bottom:-57, start:10}}>
          <HiddenWords/>
      </View>
    </View>
  );
};
const styles = StyleSheet.create({
  sentenceContainer: {
    flex:1,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom:10
  },
  sentenceText: {
    fontSize: 18,
    fontFamily: Font.black,
    textAlign: 'center',
  },
  header: {
    height:55,
    width:width,
    flexDirection:'row',
    alignItems:'center',
    justifyContent:'space-between',
    paddingHorizontal:10,
  },
});

export default React.memo(TopHeader);