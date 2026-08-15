import React from 'react';
import { FlatList, SafeAreaView, StyleSheet } from 'react-native';
import { ExpandableText } from './ExpandableText';

const SAMPLE_TEXT_FA =
  'این یک متن نمونه طولانی برای تست کامپوننت است. کامپوننت باید بتواند به‌طور خودکار تشخیص دهد که آیا متن از دو خط بیشتر است یا نه و در صورت نیاز، دکمه‌ی «بیشتر» را دقیقاً در انتهای خط دوم نمایش دهد.';

const DATA = Array.from({ length: 20 }).map((_, i) => ({
  id: String(i),
  text: SAMPLE_TEXT_FA,
}));

export default function ExpandableTextExample() {
  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={DATA}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.content}
        renderItem={({ item }) => (
          <ExpandableText
            text={item.text}
            // پیش‌فرض rtl است؛ برای پروژه‌ی فارسی/RTL نیازی به پاس‌دادن direction نیست
            numberOfLines={2}
            moreLabel="ادامه"
            lessLabel="بستن"
            moreLabelColor="#E53935"
            textStyle={{ fontSize: 12, lineHeight: 24, color: '#333' }}
            animationDuration={450}
            containerStyle={styles.card}
          />
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  content: { padding: 16 },
  card: { marginTop: 15 },
});
