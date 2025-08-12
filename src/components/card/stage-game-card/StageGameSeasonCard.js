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
import { IS_TABLET_CONDITION } from '../../../utils/constants/constants';



const { width, height } = Dimensions.get('window');

export const STAGE_GAME_CARD_MARGIN = 15;
const STAGE_GAME_CARD_WIDTH = IS_TABLET_CONDITION?(width - (STAGE_GAME_CARD_MARGIN * 3)) / 2: width - (STAGE_GAME_CARD_MARGIN * 2);

function StageGameSeasonCard({
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
    <View style={{width:STAGE_GAME_CARD_WIDTH, height:height-200, backgroundColor:"#120426", shadowColor:"#000", elevation:5, borderRadius:15}}>
      <GalaxyTwinkle style={{ width: STAGE_GAME_CARD_WIDTH, height: height-200, borderRadius:15 }}>
        <View style={{width:"100%", flexDirection:'column', justifyContent:'space-between', height:"100%"}}>
          <View style={{width:"100%", alignItems:'center', paddingTop:10}}>
            <ImageComponent
              uri = {image}
              width={STAGE_GAME_CARD_WIDTH - 20}
              height={(STAGE_GAME_CARD_WIDTH - 20)*45/100}
              resizeMode={"cover"}
              borderRadius={15}
            />
          </View>
          <View style={{flex:1, width:"100%", justifyContent:'flex-start'}}>
            <View style={{paddingHorizontal:10, paddingTop:20, paddingBottom:30}}>
                <TextGradientSvg
                  text={title}
                  fontFamily={Font.bakh_black}
                  fontSize={30}
                  borderColor={"#002723"}
                  borderWidth={1}
                  glowBlur={50}
                  glowColor={'#FFFFFF'}
                  glowShadow={true}
                  colors={['#009688', '#40bfb3', '#79d2ca']}
                />
            </View>
            <View style={{alignSelf:'flex-start', backgroundColor:'#0ea96050', paddingVertical:15, paddingStart:10, paddingEnd:20, borderRadius:10, marginHorizontal:10}}>
              <Text style={{ color: colors.text.a1, fontFamily:Font.medium, fontSize:14, lineHeight:30}}>{`${title}`}</Text>
              <Text style={ { color: colors.text.a1, fontFamily:Font.medium, fontSize:14, lineHeight:30  }}>{`فصل ${seasonNumber}`}</Text>
              <Text style={ { color: colors.text.a1, fontFamily:Font.medium, fontSize:14, lineHeight:30  }}>{`${numberStage} مرحله ( ${stageNumberFrom} تا ${stageNumberTo} )`}</Text>
            </View>
          </View>
          <View style={{width:"100%", alignItems:'flex-end', paddingBottom:10, paddingEnd:10}}>
            <CapsuleButton
                onPress={onPress}
                text={"شروع بازی"}
                width={150}
                height={45}
                gradientColors={['#d29179', '#401d11']}
                borderRadius={10}
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

export default memo(StageGameSeasonCard, areEqual);
