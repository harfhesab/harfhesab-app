import React from 'react';
import {Dimensions, StyleSheet} from 'react-native';
import { TouchableOpacity, View } from 'react-native';
import Icon from '../../../utils/Icon';
import useAppTheme from '../../../hooks/theme/useAppTheme';
import NumberCoins from '../../coin/NumberCoins';
import Font from '../../../utils/Font';
import { goBack, navigate } from '../../../main/navigationService';
import { useDragDrop } from '../context/DragDropContext';
import Toast from 'react-native-toast-message';
import NumberCoinsHelp from '../../coin/NumberCoinsHelp';
import { RootState } from '../../../redux/store/RootReducer';
import { useSelector } from 'react-redux';

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
                <TouchableOpacity onPress={()=>navigate("ConnectingLettersStageGame")} activeOpacity={0.8}>
                    <View style={{justifyContent:'center', alignItems:'center', height:40, width:40, borderWidth:1, borderRadius:8, borderColor:colors.border.a1, backgroundColor:`${colors.primary.a1}40`}}>
                        <Icon name={"settings-outline"} type='Ionicons' style={{color:colors.text.a1, fontSize:25}}/>
                    </View>
                </TouchableOpacity>
                <View style={{direction:'rtl'}}>
                    <NumberCoins />
                </View>
            </View>
            <View style={{flexDirection:'row', alignItems:'center', gap:7}}>
            <NumberCoinsHelp
              numberCoinsHelp={type == "stage-game"?coins_for_get_help_word_to_slot_stage_game:type == "package-game"&&coins_for_get_help_word_to_slot_package_game}
              onPress={applyForHelp}
            />
            <TouchableOpacity onPress={()=>{goBack()}} activeOpacity={0.8}>
                <View style={{justifyContent:'center', alignItems:'center', height:40, width:40, borderWidth:1, borderRadius:8, borderColor:colors.border.a1, backgroundColor:`${colors.primary.a1}40`}}>
                    <Icon name={"arrow-right"} type='Feather' style={{color:colors.text.a1, fontSize:25}}/>
                </View>
            </TouchableOpacity>
            </View>
        </View>
        <View style={{flexDirection:'row', width:'100%', alignItems:'center', gap:10, justifyContent:'flex-start', paddingHorizontal:15, marginTop:5}}>
            {
              Array.from({length:numberParts}).map((_, index)=>(
                <TouchableOpacity onPress={()=>onChangePlayingIndex(index)} key={index.toString()} activeOpacity={0.6}>
                  <View style={{width:35, height:35, alignItems:'center', justifyContent:'center', borderRadius:8, backgroundColor:`#0088cc35`, borderColor:index == playingPartIndex?colors.primary.a1:colors.border.a1, borderWidth:1}}>
                    {
                      (completedSentences.length == numberParts || currentPartIndex > index)?
                      (<Icon name={"lock-open"} type={"FontAwesome5"} style={{fontSize:20, color:'#0088cc'}}/>)
                      :
                      currentPartIndex == index?
                      (<Icon name={"unlock-alt"} type={"FontAwesome5"} style={{fontSize:20, color:colors.primary.a1}}/>)
                      :
                      (<Icon name={"lock"} type={"FontAwesome5"} style={{fontSize:20, color:"#607d8b"}}/>)
                    }
                    </View>
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
    paddingHorizontal:15,
  },
});

export default React.memo(TopHeader);