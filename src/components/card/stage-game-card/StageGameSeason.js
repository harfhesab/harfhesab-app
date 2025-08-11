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
import ImageComponent from '../../image-components/ImageComponent';
import TextSkia from '../../text-components/TextSkia';
import TextGradientSvg from '../../text-components/TextGradientSvg';
import ButtonGradient from '../../buttons/ButtonGradient';
import MovementGradientLayer from '../../backgroun-layer/MovementGradientLayer';
import GalaxyTwinkle from '../../backgroun-layer/GalaxyTwinkle';
import CapsuleButton from '../../buttons/CapsuleButton';



const { width: screenWidth, height } = Dimensions.get('window');

const CARD_MARGIN = 15;
const isTablet = screenWidth >= 600;

const cardWidth = isTablet?(screenWidth - (CARD_MARGIN * 3)) / 2: screenWidth - (CARD_MARGIN * 2);

function StageGameSeason({
  title,
  description,
  image,
  seasonNumber,
  stageNumberFrom,
  stageNumberTo,
  numberStage,
  isActive,
  onPress
}) {
  const colors = useAppTheme();

  return (
    <View>
        <GalaxyTwinkle style={{ width: cardWidth, height: height-200, borderRadius:15 }}>
          <View style={{width:"100%", flexDirection:'column', justifyContent:'space-between', height:"100%"}}>
            <ImageComponent
              uri = {image}
              width={cardWidth}
              height={200}
              resizeMode={"cover"}
              borderRadius={15}
            />
            <View >
              <View style={{paddingHorizontal:10}}>
                  <TextGradientSvg
                    text={title}
                    fontFamily={Font.bakh_black}
                    fontSize={30}
                    dropShadow={true}
                    shadowColor={'#FFFFFF50'}
                    colors={['#009688', '#40bfb3', '#79d2ca']}
                  />
              </View>
              <View style={{paddingHorizontal:15}}>
                <Text numberOfLines={2} style={ { color: colors.text.a1, fontFamily:Font.medium, fontSize:14  }}>{description}</Text>
                <Text style={ { color: colors.text.a1, fontFamily:Font.medium, fontSize:14  }}>{`فصل ${seasonNumber}`}</Text>
                <Text style={ { color: colors.text.a1, fontFamily:Font.medium, fontSize:14  }}>{`مرحله ${stageNumberFrom} تا ${stageNumberTo}`}</Text>
              </View>
            </View>
            <View style={{width:"100%", alignItems:'flex-end', paddingBottom:10, paddingEnd:10}}>
              
              <CapsuleButton
                  onPress={onPress}
                  text={"شروع بازی"}
                  width={150}
                  height={45}
                  gradientColors={['#d29179', '#401d11']}
              />
            </View>
          </View>
        </GalaxyTwinkle>
    </View>
  );
}

const styles = StyleSheet.create({
});

const areEqual = (prevProps, nextProps) => {
  if (prevProps.title !== nextProps.title) return false;
  return true;
};

export default memo(StageGameSeason, areEqual);
