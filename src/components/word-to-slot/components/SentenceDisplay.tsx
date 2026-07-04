import React, { memo, useEffect, useState, useRef  } from 'react';
import { View, StyleSheet, Text, ScrollView } from 'react-native';
import { useDragDrop } from '../context/DragDropContext';
import Font from '../../../utils/Font';
import useAppTheme from '../../../hooks/theme/useAppTheme';
import LinearGradient from 'react-native-linear-gradient';
import MultiLineTextGradientSvg from '../../text-components/MultiLineTextGradientSvg';
import TopHeader from './TopHeader';
import { typingSentenceErrorSound, typingSentenceSucccessSound } from '../../../utils/sound/SoundFunctions';
import DynamicProSkiaText from '../../text-components/DynamicProSkiaText';


const SentenceDisplay = () => {
    const { slots, cards, completeCurrentPart, completedSentences, currentWords } = useDragDrop();
    const colors = useAppTheme();
    const [check, setCheck] = useState(true);
    const [currentSentenceStatusColor, setCurrentSentenceStatusColor] = useState<string[]>(['#86442d', '#4d2719']);
    const scrollRef = useRef<ScrollView | null>(null);

    const currentSentence = Object.keys(slots)
            .sort((a, b) => Number(a) - Number(b))
            .map(slotIndex => cards[slots[Number(slotIndex)]]?.word)
            .filter(word => word !== undefined)
            .join(' ')

    // بررسی صحت جمله فعلی
    useEffect(() => {
        if (Object.keys(slots).length === currentWords.length && check == true) {
            const slotWords = Object.keys(slots)
                .sort((a, b) => Number(a) - Number(b))
                .map(slotIndex => cards[slots[Number(slotIndex)]]?.word);
            
            const isCorrect = slotWords.every((word, index) => word === currentWords[index].word);
            
            if (isCorrect) {
                setCurrentSentenceStatusColor([colors.primary.a1, '#236a24'])
                typingSentenceSucccessSound()
                setTimeout(()=>{
                    setCheck(false);
                    completeCurrentPart();
                }, 1000)
            } else {
                setCurrentSentenceStatusColor(['#ff4444', '#CC0000'])
                typingSentenceErrorSound()
            }
        } else {
          setCurrentSentenceStatusColor(['#86442d', '#4d2719'])
          setCheck(true);
        }
    }, [slots]);

    return (
        <View style={styles.sentenceContainer}>
            <TopHeader/>
            <View style={{ flex: 1, paddingVertical: 5 }}>
              <ScrollView  
                ref={scrollRef}
                onContentSizeChange={() => {
                  scrollRef.current?.scrollToEnd({ animated: true });
                }}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{
                  flexGrow: 1,
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
                >
                <View style={{width:"100%", alignItems:'center', flexDirection :'column', gap:10, justifyContent:'center', paddingHorizontal:15}}>
                    {
                      completedSentences?.map((item, index)=>(
                        <View key={index.toString()} style={{backgroundColor:`${colors.primary.a1}90`, paddingHorizontal:15, paddingVertical:1, borderRadius:10, alignItems:'center', justifyContent:'center'}}>
                          
                            <DynamicProSkiaText 
                              text={item}
                              textColor={colors.primary.a3} 
                              borderColor={colors.primary.a7} 
                              borderWidth={1.5}
                              fontSize={20}
                            />
                        </View>
                      ))
                    }
                </View>
              </ScrollView>
            </View>
            <View style={{minHeight:30}}>
              {
                currentSentence?.length > 0?
                <LinearGradient colors={currentSentenceStatusColor} style={{ borderRadius: 5 }}>
                  <View style={{ paddingHorizontal: 15 }}>
                    <Text style={{fontFamily:Font.bakh_black, fontSize:18, color:"#FFF"}}>{currentSentence}</Text>
                  </View>
                </LinearGradient>
                :<View/>
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
});

export default memo(SentenceDisplay);