import React, { memo } from 'react';
import {
  View,
  Text,
  TouchableNativeFeedback,
  Dimensions,
  StyleSheet,
} from 'react-native';
import Icon from '../../../utils/Icon';
import Font from '../../../utils/Font';
import FastImage from '@d11/react-native-fast-image';
import Globals from '../../../utils/Globals';
import useAppTheme from '../../../hooks/theme/useAppTheme';

const { width: screenWidth } = Dimensions.get('window');

const CARD_MARGIN = 15;
const isTablet = screenWidth >= 700;

const cardWidth = isTablet
  ? (screenWidth - CARD_MARGIN * 3) / 2
  : screenWidth - CARD_MARGIN * 2;

function StageGameSeason({
  title,
  description,
  image,
  seasonNumber,
  stageNumberFrom,
  stageNumberTo,
  numberStage,
  isActive
}) {
  const colors = useAppTheme();

  return (
    <View style={[styles.container, { width: cardWidth }]}>
      <TouchableNativeFeedback onPress={() => {}}>
        <View style={[styles.card, { backgroundColor: colors.card }]}>
          <FastImage
            source={{ uri: image }}
            style={styles.image}
            resizeMode="cover"
          />
          <View style={styles.content}>
            <Text style={[styles.title, { color: colors.text }]}>
              {title}
            </Text>
            <Text style={[styles.description, { color: colors.textSecondary }]}>
              {description}
            </Text>
            <Text style={[styles.meta, { color: colors.primary }]}>
              فصل {seasonNumber} | مرحله {stageNumberFrom} تا {stageNumberTo}
            </Text>
          </View>
        </View>
      </TouchableNativeFeedback>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    margin: CARD_MARGIN,
  },
  card: {
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 3,
  },
  image: {
    width: '100%',
    height: 150,
  },
  content: {
    padding: 12,
  },
  title: {
    fontSize: 16,
    fontFamily: Font.bold,
  },
  description: {
    fontSize: 14,
    marginTop: 4,
    fontFamily: Font.medium,
  },
  meta: {
    marginTop: 8,
    fontSize: 12,
    fontFamily: Font.medium,
  },
});

const areEqual = (prevProps, nextProps) => {
  return prevProps.title === nextProps.title;
};

export default memo(StageGameSeason, areEqual);
