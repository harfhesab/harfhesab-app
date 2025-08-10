import React, { memo, useRef, useState } from "react";
import {
  Dimensions,
  View,
  TouchableOpacity,
  StyleSheet,
  Platform,
  I18nManager
} from "react-native";
import Carousel from "react-native-reanimated-carousel";
import type { ICarouselInstance } from "react-native-reanimated-carousel";
import ImageComponent from "../image-components/ImageComponent";

type ImageSwiperProps = {
  items?: { path: string }[];
  rtl?: boolean;
  width?: number;
  height?: number;
};

const screenWidth = Dimensions.get("window").width;
const defaultSwiperWidth = screenWidth > 600 ? 450 : screenWidth;

const MediaSwiper: React.FC<ImageSwiperProps> = ({
  items = [],
  rtl = I18nManager.isRTL,
  width = defaultSwiperWidth,
  height = 220,
}) => {
  const carouselRef = useRef<ICarouselInstance | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  if (!Array.isArray(items) || items.length === 0) return null;
  // if (items.length === 1) {
  //   return (
  //     <View style={{ width, height }}>
  //       <ImageComponent
  //         uri={items[0].path}
  //         width={width}
  //         height={height}
  //         resizeMode="cover"
  //         borderRadius={15}
  //       />
  //     </View>
  //   );
  // }

  return (
    <View style={[styles.container, { width, height }]}>
      <Carousel
        ref={carouselRef}
        width={width}
        height={height}
        data={items}
        loop
        autoPlay={items.length > 1?true:false}
        autoPlayInterval={3000}
        scrollAnimationDuration={600}
        mode="parallax"
        // **مهم**: پارامترهای parallax داخل modeConfig
        modeConfig={{
          parallaxScrollingScale: 0.88,       // مجاور‌ها کوچکتر شوند
          parallaxScrollingOffset: 0,        // افست آیتم‌های مجاور
          parallaxAdjacentItemScale: 0.82,    // مقیاس آیتم‌های کنار (اختیاری)
        }}
        renderItem={({ item }) => (
          <View style={{ width, height }}>
            <ImageComponent
              uri={item.path}
              width={width}
              height={height}
              resizeMode="cover"
              borderRadius={14}
            />
          </View>
        )}
        // اینجا از onProgressChange استفاده کن تا active index بی‌درنگ آپدیت شود
        onProgressChange={(_, absoluteProgress) => {
          const rounded = Math.round(absoluteProgress);
          const normalized = items.length ? rounded % items.length : rounded;
          setActiveIndex(normalized);
        }}
      />

      {/* Dots overlay — پایین و وسط */}
      <View pointerEvents="box-none" style={styles.dotsContainer}>
        <View style={styles.dotsRow}>
          {items.map((_, i) => {
            const isActive = i === activeIndex;
            return (
              <TouchableOpacity
                key={i}
                activeOpacity={0.9}
                onPress={() => {
                  setActiveIndex(i);
                  // تلاش برای حرکت: از ref و scrollTo استفاده می‌کنیم
                  try {
                    carouselRef.current?.scrollTo({
                      index: i,
                      animated: true,
                    });
                  } catch (e) {
                    // برخی نسخه‌ها ممکن است signature متفاوت داشته باشند
                    // در آن صورت می‌توانی از next()/prev() یا scrollTo({count}) استفاده کنی
                  }
                }}
                style={[
                  styles.dot,
                  isActive ? styles.activeDot : styles.inactiveDot,
                  isActive ? { transform: [{ scale: 1.15 }] } : undefined,
                ]}
              />
            );
          })}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignSelf: "center",
    position: "relative",
    overflow: Platform.OS === "android" ? "hidden" : undefined,
  },
  dotsContainer: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  dotsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginHorizontal: 4,
  },
  activeDot: {
    backgroundColor: "#fff",
    elevation: 2,
  },
  inactiveDot: {
    backgroundColor: "rgba(255,255,255,0.45)",
  },
});

const areEqual = (prevProps:any, nextProps:any) => {
  if (prevProps.items !== nextProps.items) return false;
  return true;
};
export default memo(MediaSwiper, areEqual);
