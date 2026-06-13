import React, { memo, useState  } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { useDragDrop } from '../context/OnboardingContext';
import Font from '../../../utils/Font';
import LinearGradient from 'react-native-linear-gradient';


const SentenceDisplay = () => {
    const { currentWords } = useDragDrop();
    const [currentSentenceStatusColor] = useState<string[]>(['#86442d', '#4d2719']);

    const currentSentence =currentWords
            .filter(item => item.assigned === true)
            .map(item => item.word)
            .join(" ");

    return (
        <View style={styles.sentenceContainer}>
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
    alignItems: 'center',
  },
  sentenceText: {
    fontSize: 18,
    fontFamily: Font.black,
    textAlign: 'center',
  },
});

export default memo(SentenceDisplay);