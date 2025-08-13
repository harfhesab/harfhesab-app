import React, { memo, useEffect, useState } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { useDragDrop } from '../context/DragDropContext';
import Font from '../../../utils/Font';
import useAppTheme from '../../../hooks/theme/useAppTheme';
import LinearGradient from 'react-native-linear-gradient';
import MultiLineTextGradientSvg from '../../text-components/MultiLineTextGradientSvg';
import { index } from 'realm';

const SentenceDisplay = () => {
    const { slots, cards, completeCurrentPart, completedSentences, currentWords, currentPartIndex } = useDragDrop();
    const colors = useAppTheme();
    const [lastCompletedIndex, setLastCompletedIndex] = useState(-1);
    const [currentSentenceStatusColor, setCurrentSentenceStatusColor] = useState<string[]>(['#4d2719', '#86442d']);
    const [currentSentence, setCurrentSentence] = useState("")

    // بررسی صحت جمله فعلی
    useEffect(() => {
        setCurrentSentence(
          Object.keys(slots)
            .sort((a, b) => Number(a) - Number(b))
            .map(slotIndex => cards[slots[Number(slotIndex)]]?.word)
            .filter(word => word !== undefined)
            .join(' ')
        )
        if (Object.keys(slots).length === currentWords.length && lastCompletedIndex < currentPartIndex) {
            const slotWords = Object.keys(slots)
                .sort((a, b) => Number(a) - Number(b))
                .map(slotIndex => cards[slots[Number(slotIndex)]]?.word);
            
            const isCorrect = slotWords.every((word, index) => word === currentWords[index].word);
            
            if (isCorrect) {
                console.log('Success: جمله به درستی ساخته شد!');
                setLastCompletedIndex(currentPartIndex); // به‌روزرسانی ایندکس آخرین جمله کامل‌شده
                completeCurrentPart();
                setCurrentSentenceStatusColor(['#388e3c', '#4caf50', '#81c784'])
                setCurrentSentence("")
            } else {
                console.log('Error: جمله نادرست است');
                setCurrentSentenceStatusColor(['#b71c1c', '#d32f2f', '#f44336'])
            }
        }
    }, [slots, currentWords, cards, completeCurrentPart, currentPartIndex, lastCompletedIndex]);

    return (
        <View style={styles.sentenceContainer}>
            <View style={{width:"100%", alignItems:'center', flexDirection :'column', gap:10, justifyContent:'center', paddingHorizontal:15}}>
                {
                  completedSentences?.map((item, index)=>(
                    <View key={index.toString()} style={{backgroundColor:"#388e3c50", paddingHorizontal:15, paddingVertical:1, borderRadius:5, alignItems:'center', justifyContent:'center'}}>
                        <MultiLineTextGradientSvg
                            text={item}
                            fontFamily={Font.bakh_extra_bold}
                            fontSize={20}
                            borderColor={"#795548"}
                            borderWidth={1}
                            glowBlur={20}
                            glowColor={'#FFFFFF'}
                            glowShadow={true}
                            colors={['#ffc107', '#ff9800', '#ff5722']}
                        />
                    </View>
                  ))
                }
            </View>
            {
              currentSentence?.length > 0&&
              <LinearGradient colors={currentSentenceStatusColor} style={{ borderRadius: 5 }}>
                <View style={{ paddingHorizontal: 20, paddingVertical:1 }}>
                  <Text style={{fontFamily:Font.bakh_black, fontSize:18, color:"#FFF"}}>{currentSentence}</Text>
                </View>
              </LinearGradient>
            }
        </View>
    );
};

const styles = StyleSheet.create({
  sentenceContainer: {
    flex:1,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical:10
  },
  sentenceText: {
    fontSize: 18,
    fontFamily: Font.black,
    textAlign: 'center',
  },
});

export default memo(SentenceDisplay);