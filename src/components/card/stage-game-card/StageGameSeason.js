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


const { width: screenWidth } = Dimensions.get('window');

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
  isActive
}) {
  const colors = useAppTheme();

  return (
    <View>
        <MovementGradientLayer width={cardWidth} height={450}>
          <View style={{width:"100%", flexDirection:'column', justifyContent:'space-between', height:450}}>
            <ImageComponent
              uri = {image}
              width={cardWidth}
              height={200}
              resizeMode={"cover"}
              borderRadius={15}
            />
            <View style={styles.content}>
              <TextGradientSvg
                  text={title}
                  fontFamily={Font.bakh_black}
                  fontSize={30}
                  borderColor='#FFFFFF'
                  borderWidth={1}
              />
              <Text style={ { color: colors.primary.a1 }}>
                {description}
              </Text>
              <Text style={ { color: colors.text.a1, fontSize:20, fontFamily:Font.medium }}>
                فصل {seasonNumber} | مرحله {stageNumberFrom} تا {stageNumberTo}
              </Text>
            </View>
            <View style={{width:"100%", alignItems:'center', paddingBottom:15}}>
              <ButtonGradient
                  height={65}
                  width={cardWidth - 30}
                  text={"شروع بازی"}
                  onPress={()=>{}}
                  loading={false}
                  textSize={18}
                  borderRadius={10}
              />
            </View>
          </View>
        </MovementGradientLayer>
    </View>
  );
}

const styles = StyleSheet.create({
  
});

const areEqual = (prevProps, nextProps) => {
  return prevProps.title === nextProps.title;
};

export default memo(StageGameSeason, areEqual);
