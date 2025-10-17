import React from 'react';
import {Dimensions, ImageBackground, StyleSheet} from 'react-native';
import { TouchableOpacity, View } from 'react-native';
import Icon from '../../../utils/Icon';
import useAppTheme from '../../../hooks/theme/useAppTheme';
import NumberCoins from '../../coin/NumberCoins';
import Font from '../../../utils/Font';
import { useDragDrop } from '../context/DragDropContext';
import Toast from 'react-native-toast-message';
import NumberCoinsHelp from '../../coin/NumberCoinsHelp';
import { RootState } from '../../../redux/store/RootReducer';
import { useSelector } from 'react-redux';
import Back from '../../icon/Back';
import Setting from '../../icon/Setting';
import LocalImageComponent from '../../image-components/LocalImageComponent';
import { STATUS_BAR_HEIGHT } from '../../../utils/constants/constants';
import { Text } from '@react-navigation/elements';

const {width} = Dimensions.get("screen");
const TopHeader = () => {
  const colors = useAppTheme();
  const {coins_for_get_help_word_to_slot_stage_game, coins_for_get_help_word_to_slot_package_game} = useSelector((state: RootState) => state.constants);
  const { changePlayingIndex, completedSentences, currentPartIndex, playingPartIndex, numberParts, type, applyForHelp } = useDragDrop();

  const onChangePlayingIndex = (index:number)=>{
    if(index == playingPartIndex) return
    if(index <= currentPartIndex){
      changePlayingIndex(index)
    } else {
      Toast.show({
        type: "error",
        text1 : "جملات باید به ترتیب کامل شوند!",
        topOffset : 10
      })
    }
  }
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
            <NumberCoinsHelp
              numberCoinsHelp={type == "stage-game"?coins_for_get_help_word_to_slot_stage_game:type == "package-game"&&coins_for_get_help_word_to_slot_package_game}
              onPress={applyForHelp}
            />
            <Back/>
            </View>
        </View>
        {
          numberParts>1&&
          <View style={{flexDirection:'row', width:'100%', alignItems:'center', gap:8, justifyContent:'flex-start', paddingHorizontal:10, marginTop:5}}>
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