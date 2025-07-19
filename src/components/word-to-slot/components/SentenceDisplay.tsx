import React, { memo, useEffect } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import {  useDragDrop } from '../context/DragDropContext';
import Font from '../../../utils/Font';

interface Props {
  words: string[];
}

const SentenceDisplay = ({words}: Props) => {
    const { slots, cards } = useDragDrop();
    // ساخت متن جمله از کلمات متصل به اسلات‌ها
    const sentence = Object.keys(slots)
        .sort((a, b) => Number(a) - Number(b)) // مرتب‌سازی بر اساس ایندکس اسلات
        .map(slotIndex => cards[slots[Number(slotIndex)]]?.word)
        .filter(word => word !== undefined)
        .join(' ');

    // بررسی صحت جمله
    useEffect(() => {
        if (Object.keys(slots).length === words.length) {
            const slotWords = Object.keys(slots)
                .sort((a, b) => Number(a) - Number(b))
                .map(slotIndex => cards[slots[Number(slotIndex)]]?.word);
            
            const isCorrect = slotWords.every((word, index) => word === words[index]);
            
            if (isCorrect) {
                console.log('Success: جمله به درستی ساخته شد!');
            } else {
                console.log('Error: جمله نادرست است');
            }
        }
    }, [slots]);

    return (
        <View style={styles.sentenceContainer}>
            <Text style={styles.sentenceText}>{sentence}</Text>
        </View>
    );
};

const styles = StyleSheet.create({
  sentenceContainer: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sentenceText: {
    fontSize: 18,
    fontFamily: Font.black,
    color: '#333',
    textAlign: 'center',
  },
});

export default memo(SentenceDisplay);