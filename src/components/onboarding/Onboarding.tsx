// components/Onboarding/Onboarding.tsx
import React, { useRef, useState, useMemo } from 'react';
import { View, StyleSheet, FlatList, ViewToken, I18nManager } from 'react-native';
import Animated, { useAnimatedScrollHandler, useSharedValue } from 'react-native-reanimated';
import { SlideItem, OnboardingProps } from './types';
import { Slide } from './Slide';
import { Paginator } from './Paginator';
import { NextButton } from './NextButton';

export const Onboarding: React.FC<OnboardingProps> = ({
  data,
  onFinish,
  isRTL,
  containerStyle,
  titleStyle,
  descriptionStyle,
  nextButtonColor = '#493d8a',
  doneButtonColor = '#2e8b57',
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollX = useSharedValue(0);
  const slidesRef = useRef<FlatList>(null);

  // منطق طلایی محاسبه جهت:
  // اگر کامپوننت جهتی برخلاف جهت اصلی سیستم عامل/اپلیکیشن درخواست کند،
  // ما باید کامپوننت ها را به صورت دستی معکوس (Reverse) کنیم.
  const isSystemRTL = I18nManager.isRTL;
  const isComponentRTL = isRTL ?? isSystemRTL; // اولویت با پراپس، در غیر اینصورت ذات پروژه
  const needsReversal = isComponentRTL == isSystemRTL;

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollX.value = event.contentOffset.x;
    },
  });

  const viewableItemsChanged = useRef(({ viewableItems }: { viewableItems: ViewToken[] }) => {
    if (viewableItems.length > 0 && viewableItems[0].index !== null) {
      setCurrentIndex(viewableItems[0].index);
    }
  }).current;

  const viewConfig = useRef({ viewAreaCoveragePercentThreshold: 50 }).current;

  const scrollTo = () => {
    if (currentIndex < data.length - 1) {
      slidesRef.current?.scrollToIndex({ index: currentIndex + 1, animated: true });
    } else {
      onFinish();
    }
  };

  const isLastSlide = currentIndex === data.length - 1;
  const percentage = ((currentIndex + 1) / data.length) * 100;

  return (
    <View style={[styles.container, containerStyle]}>
      <Animated.FlatList
        data={data}
        renderItem={({ item }) => (
          <Slide 
            item={item} 
            isRTL={isComponentRTL} 
            titleStyle={titleStyle} 
            descriptionStyle={descriptionStyle} 
          />
        )}
        keyExtractor={(item) => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        pagingEnabled
        bounces={false}
        inverted={needsReversal} 
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        onViewableItemsChanged={viewableItemsChanged}
        viewabilityConfig={viewConfig}
        ref={slidesRef}
      />

      <View 
        style={[
          styles.bottomSection, 
          // اگر سیستم LTR است و ما RTL خواستیم (یا برعکس)، جای دکمه و نقطه‌ها عوض می‌شود
          { flexDirection: needsReversal ? 'row-reverse' : 'row' }
        ]}
      >
        {/* کانتینر نقطه‌ها هم باید در صورت نیاز معکوس شود تا نقطه اول در جای درست قرار بگیرد */}
        <View style={{ flexDirection: needsReversal ? 'row-reverse' : 'row' }}>
          <Paginator data={data} scrollX={scrollX} />
        </View>

        <NextButton 
          percentage={percentage} 
          scrollTo={scrollTo} 
          isRTL={isComponentRTL}
          color={isLastSlide ? doneButtonColor : nextButtonColor}
          isLastSlide={isLastSlide}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  bottomSection: {
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 30,
    paddingBottom: 40,
    paddingTop: 20,
  },
});