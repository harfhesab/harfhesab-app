import React from 'react';
import {Dimensions, ImageBackground, StyleSheet} from 'react-native';
import { TouchableOpacity, View } from 'react-native';
import NumberCoins from '../../coin/NumberCoins';
import Font from '../../../utils/Font';
import { useDragDrop } from '../context/DragDropContext';
import NumberCoinsHelp from '../../coin/NumberCoinsHelp';
import { RootState } from '../../../redux/store/RootReducer';
import { useSelector } from 'react-redux';
import Back from '../../icon/Back';
import Setting from '../../icon/Setting';
import LocalImageComponent from '../../image-components/LocalImageComponent';
import { STATUS_BAR_HEIGHT } from '../../../utils/constants/constants';
import { Text } from '@react-navigation/elements';
import { showToast } from '../../custom-toast/ToastRef';
import MeaningSentence from '../../coin/MeaningSentence';
import TimerAndSandTimer from '../../timer/TimerAndSandTimer';

const {width} = Dimensions.get("screen");
const TopHeader = () => {
  const {coins_for_get_help_word_to_slot_stage_game, coins_for_get_help_word_to_slot_package_game} = useSelector((state: RootState) => state.constants);
  const { changePlayingIndex, currentPartIndex, playingPartIndex, numberParts, type, applyForHelp, sentenceHint, numberOfCards, existUnknownWord, timeLimitData } = useDragDrop();

  const onChangePlayingIndex = (index:number)=>{
    if(index == playingPartIndex) return
    if(index <= currentPartIndex){
      changePlayingIndex(index)
    } else {
      showToast({
          title: "عدم دسترسی",
          message: "جملات باید به ترتیب کامل شوند!",
          type: "error",
          animationType: "slide",
          position: "top",
      });
    }
  }
  return (
    <View style={{width:width, marginTop:STATUS_BAR_HEIGHT, flexDirection:'row', alignItems:'flex-start', justifyContent:'space-between', paddingHorizontal:10}}>
        <View style={{flexDirection:'column', alignItems:'flex-start', gap:10}}>
          <View style={{flexDirection:'row', alignItems:'center', gap:7}}>
              <Setting/>
              <View style={{direction:'rtl'}}>
                  <NumberCoins />
              </View>
          </View>
          {
            numberParts>1&&
            <View style={{flexDirection:'row', alignItems:'center', gap:8, justifyContent:'flex-start'}}>
                {
                  Array.from({length:numberParts}).map((_, index)=>(
                    <TouchableOpacity onPress={()=>onChangePlayingIndex(index)} key={index.toString()} activeOpacity={0.6} style={{alignItems:'center', justifyContent:'center'}}>
                      <ImageBackground
                          source={index <= currentPartIndex?require("../../../assets/image/card_1.png"):require("../../../assets/image/card_2.png")}
                          style={{ width: 40, height: 52, justifyContent: "center", alignItems: "center", opacity:index == playingPartIndex?1:0.6 }}
                          imageStyle={{ resizeMode: "stretch" }}
                          resizeMode="stretch"
                      >
                          {
                            (index <= currentPartIndex && index !== playingPartIndex) ?
                            <Text style={{fontFamily:Font.black, fontSize:22, color:"#ffeb3b"}}>{index + 1}</Text>
                            :
                            <LocalImageComponent
                                path={index == playingPartIndex? require("../../../assets/image/play_red_background.png"):require("../../../assets/image/lock_yellow_backgrond.png")}
                                width={index == playingPartIndex?18:22}
                                height={index == playingPartIndex?20:27}
                                resizeMode={'cover'}
                                blank_background
                            />
                          }
                      </ImageBackground>
                    </TouchableOpacity>
                  ))
                }
            </View>
          }
        </View>
        <View style={{flexDirection:'row', alignItems:'flex-start', gap:7}}>
          <View style={{flexDirection:'column', alignItems:'flex-end'}}>
            {
              type !== "kalam-akhar"?
              <NumberCoinsHelp
                numberCoinsHelp={type == "stage-game"?coins_for_get_help_word_to_slot_stage_game:type == "package-game"&&coins_for_get_help_word_to_slot_package_game}
                onPress={applyForHelp}
              />
              :(type == "kalam-akhar" && timeLimitData?.time_limit)&&
              <TimerAndSandTimer
                totalSeconds={timeLimitData?.time_limit}
                remainingSeconds={timeLimitData?.remaining_time_seconds}
                remainingSyncedAt={timeLimitData?.remaining_synced_at}
              />
            }
          </View>
          <View style={{flexDirection:'column', alignItems:'flex-end', gap:10}}>
            <Back/>
            {
              sentenceHint&&
              <MeaningSentence
                numberCoinsHelp={currentPartIndex == playingPartIndex?numberOfCards*2:0}
                onPress={()=>{
                  if(existUnknownWord == true){
                      showToast({
                          title: "وجود کلمه نامعلوم",
                          message: "برای دیدن معنی جمله، نباید هیچ کلمه نامعلومی در کارت‌ها موجود باشد.",
                          type: "error",
                          animationType: "slide",
                          position: "top",
                          duration:6000
                      });
                  } else {
                    showToast({
                        title: "معنی جمله",
                        message: `${sentenceHint}`,
                        type: "success",
                        animationType: "slide",
                        position: "top",
                        duration: 10000,
                        topOffset: 80
                    });
                    if(currentPartIndex == playingPartIndex){
                      return true
                    } else {
                      return false
                    }
                  }
                }}
              />
            }
          </View>
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
});

export default React.memo(TopHeader);