import React, { memo, useEffect, useState } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, Dimensions, Image } from 'react-native';
import { useDragDrop } from '../context/DragDropContext';
import Font from '../../../utils/Font';
import useAppTheme from '../../../hooks/theme/useAppTheme';
import LinearGradient from 'react-native-linear-gradient';
import MultiLineTextGradientSvg from '../../text-components/MultiLineTextGradientSvg';
import { index } from 'realm';
import NumberCoins from '../../coin/NumberCoins';
import Icon from '../../../utils/Icon';
import { goBack, navigate } from '../../../main/navigationService';

const {width} = Dimensions.get('window')
const SentenceDisplay = () => {
    const { slots, cards, completeCurrentPart, completedSentences, currentWords, currentPartIndex } = useDragDrop();
    const colors = useAppTheme();
    const [lastCompletedIndex, setLastCompletedIndex] = useState(-1);
    const [currentSentenceStatusColor, setCurrentSentenceStatusColor] = useState<string[]>(['#86442d', '#4d2719']);

    const currentSentence = Object.keys(slots)
            .sort((a, b) => Number(a) - Number(b))
            .map(slotIndex => cards[slots[Number(slotIndex)]]?.word)
            .filter(word => word !== undefined)
            .join(' ')

    // بررسی صحت جمله فعلی
    useEffect(() => {
        if (Object.keys(slots).length === currentWords.length && lastCompletedIndex < currentPartIndex) {
            const slotWords = Object.keys(slots)
                .sort((a, b) => Number(a) - Number(b))
                .map(slotIndex => cards[slots[Number(slotIndex)]]?.word);
            
            const isCorrect = slotWords.every((word, index) => word === currentWords[index].word);
            
            if (isCorrect) {
                console.log('Success: جمله به درستی ساخته شد!');
                setLastCompletedIndex(currentPartIndex); // به‌روزرسانی ایندکس آخرین جمله کامل‌شده
                completeCurrentPart();
                setCurrentSentenceStatusColor(['#47cd8a', '#103220'])
                setTimeout(()=>{
                  setCurrentSentenceStatusColor(['#86442d', '#4d2719'])
                }, 1500)
            } else {
                console.log('Error: جمله نادرست است');
                setCurrentSentenceStatusColor(['#ff4444', '#CC0000'])
            }
        }
    }, [slots, currentWords, cards, completeCurrentPart, currentPartIndex, lastCompletedIndex]);

    return (
        <View style={styles.sentenceContainer}>
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
                  <TouchableOpacity activeOpacity={0.8}>
                      <View style={{justifyContent:'center', alignItems:'center', height:40, borderWidth:1, borderRadius:8, borderColor:colors.border.a1, backgroundColor:`${colors.primary.a1}40`}}>
                          <Text style={{fontFamily:Font.medium, fontSize:13, color:colors.text.a1, paddingHorizontal:15}}>{"راهنما"}</Text>
                          <View style={{flexDirection:'row', alignItems:'center', gap:5}}>
                            <Image
                                style={{height:13, width:13}}
                                source={require('../../../assets/image/coin.png')}
                            />
                            <Text style={{fontFamily:Font.black, fontSize:11, color:colors.text.a1}}>{"20"}</Text>
                          </View>
                      </View>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={()=>{goBack()}} activeOpacity={0.8}>
                      <View style={{justifyContent:'center', alignItems:'center', height:40, width:40, borderWidth:1, borderRadius:8, borderColor:colors.border.a1, backgroundColor:`${colors.primary.a1}40`}}>
                          <Icon name={"arrow-right"} type='Feather' style={{color:colors.text.a1, fontSize:25}}/>
                      </View>
                  </TouchableOpacity>
                </View>
            </View>
            <View style={{width:"100%", alignItems:'center', flexDirection :'column', gap:10, justifyContent:'center', paddingHorizontal:15}}>
                {
                  completedSentences?.map((item, index)=>(
                    <View key={index.toString()} style={{backgroundColor:"#9900ef", paddingHorizontal:15, paddingVertical:1, borderRadius:5, alignItems:'center', justifyContent:'center'}}>
                        <MultiLineTextGradientSvg
                            text={item}
                            fontFamily={Font.bakh_extra_bold}
                            fontSize={24}
                            dropShadow={true}
                            shadowColor={'#000000'}
                            shadowBlur={10}
                            glowBlur={50}
                            glowColor={'#FFFFFF'}
                            glowShadow={true}
                            colors={['#47d994', '#0ea960']}
                        />
                    </View>
                  ))
                }
            </View>
            {
              currentSentence?.length > 0?
              <LinearGradient colors={currentSentenceStatusColor} style={{ borderRadius: 5 }}>
                <View style={{ paddingHorizontal: 20, paddingVertical:1 }}>
                  <Text style={{fontFamily:Font.bakh_black, fontSize:18, color:"#FFF"}}>{currentSentence}</Text>
                </View>
              </LinearGradient>
              :<View/>
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
    height:65,
    width:width,
    flexDirection:'row',
    alignItems:'center',
    justifyContent:'space-between',
    paddingHorizontal:15,
  },
});

export default memo(SentenceDisplay);