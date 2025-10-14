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

const {width} = Dimensions.get("window");
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
    <View style={{width:width}}>
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
        <View style={{flexDirection:'row', width:'100%', alignItems:'center', gap:5, justifyContent:'flex-start', paddingHorizontal:10, marginTop:5}}>
            {
              Array.from({length:numberParts}).map((_, index)=>(
                <TouchableOpacity onPress={()=>onChangePlayingIndex(index)} key={index.toString()} activeOpacity={0.6} style={{ backgroundColor:index == playingPartIndex?"#40bf42":"transparent", borderRadius:22, width:45, height:45, alignItems:'center', justifyContent:'center'}}>
                  <ImageBackground
                      source={(completedSentences.length == numberParts || currentPartIndex > index || currentPartIndex == index)?require("../../../assets/image/circle_blue.png"):require("../../../assets/image/circle_red.png")}
                      style={{ width: 40, height: 40, justifyContent: "center", alignItems: "center" }}
                      imageStyle={{ resizeMode: "stretch" }}
                      resizeMode="stretch"
                  >
                      <LocalImageComponent
                          path={(completedSentences.length == numberParts || currentPartIndex > index)?require("../../../assets/image/tick.png"):currentPartIndex == index?require("../../../assets/image/play.png"):require("../../../assets/image/lock_gray.png")}
                          width={(completedSentences.length == numberParts || currentPartIndex > index)?20:currentPartIndex == index?16.5:15.5}
                          height={(completedSentences.length == numberParts || currentPartIndex > index)?22:currentPartIndex == index?22:22}
                          resizeMode={'cover'}
                          blank_background
                      />
                  </ImageBackground>
                </TouchableOpacity>
              ))
            }
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
    height:65,
    width:width,
    flexDirection:'row',
    alignItems:'center',
    justifyContent:'space-between',
    paddingHorizontal:10,
  },
});

export default React.memo(TopHeader);