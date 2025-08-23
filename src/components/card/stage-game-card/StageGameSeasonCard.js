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
import MultiLineTextGradientSvg from '../../text-components/MultiLineTextGradientSvg';
import ButtonGradient from '../../buttons/ButtonGradient';
import MovementGradientLayer from '../../backgroun-layer/MovementGradientLayer';
import GalaxyTwinkle from '../../backgroun-layer/GalaxyTwinkle';
import CapsuleButton from '../../buttons/CapsuleButton';
import { IS_TABLET_CONDITION } from '../../../utils/constants/constants';
import LockedSeasonAnimation from '../../LockedSeasonAnimation';



const { width, height } = Dimensions.get('window');

export const STAGE_GAME_SEASON_CARD_MARGIN = 15;
export const STAGE_GAME_SEASON_CARD_HEIGHT = height-185;
const STAGE_GAME_CARD_WIDTH = IS_TABLET_CONDITION?(width - (STAGE_GAME_SEASON_CARD_MARGIN * 3)) / 2: width - (STAGE_GAME_SEASON_CARD_MARGIN * 2);

function StageGameSeasonCard({
  lock,
  currentScroll,
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
  
  const Wrapper = currentScroll == true ? GalaxyTwinkle : View;

  return (
    <View style={{width:STAGE_GAME_CARD_WIDTH, height:STAGE_GAME_SEASON_CARD_HEIGHT, backgroundColor:"#120426", shadowColor:"#000", elevation:5, borderRadius:15, borderWidth:2, borderColor:colors.border.a1}}>
      <Wrapper style={{ width: STAGE_GAME_CARD_WIDTH-4, height: STAGE_GAME_SEASON_CARD_HEIGHT-4, borderRadius:15 }}>
        <View style={{width:STAGE_GAME_CARD_WIDTH-4, height:STAGE_GAME_SEASON_CARD_HEIGHT-4, flexDirection:'column', justifyContent:'space-between'}}>
          <View style={{width:"100%", alignItems:'center', paddingTop:10}}>
            <ImageComponent
              uri = {image}
              width={STAGE_GAME_CARD_WIDTH - 20}
              height={(STAGE_GAME_CARD_WIDTH - 20)*0.7}
              resizeMode={"cover"}
              borderRadius={13}
              style={{borderWidth:1, borderColor:colors.border.a1}}
            />
          </View>
          <View style={{flex:1, width:"100%", justifyContent:'flex-start'}}>
            <View style={{paddingHorizontal:10, paddingTop:20, paddingBottom:30, minHeight:120}}>
                <MultiLineTextGradientSvg
                  text={title}
                  fontFamily={Font.bakh_black}
                  fontSize={35}
                  borderColor={"#795548"}
                  borderWidth={1}
                  glowBlur={100}
                  glowColor={'#FFFFFF'}
                  glowShadow={true}
                  colors={['#ffc107', '#ff9800', '#ff5722']}
                />
            </View>
            <View style={{alignSelf:'flex-start', backgroundColor:`${colors.primary.a1}50`, paddingVertical:15, paddingStart:10, paddingEnd:20, borderRadius:10, marginHorizontal:10}}>
              <Text style={{ color: colors.text.a1, fontFamily:Font.medium, fontSize:14, lineHeight:30}}>{`${title}`}</Text>
              <Text style={ { color: colors.text.a1, fontFamily:Font.medium, fontSize:14, lineHeight:30  }}>{`فصل ${seasonNumber}`}</Text>
              <Text style={ { color: colors.text.a1, fontFamily:Font.medium, fontSize:14, lineHeight:30  }}>{`${numberStage} مرحله ( ${stageNumberFrom} تا ${stageNumberTo} )`}</Text>
            </View>
          </View>
          <View style={{width:"100%", alignItems:'flex-end', paddingBottom:10, paddingEnd:10}}>
            
            <ButtonGradient
                text={"شروع بازی"}
                textSize={16}
                onPress={onPress}
                width={180}
                height={50}
                borderRadius={10}
                fontFamily={Font.bakh_black}
                textSize={22}
            />
          </View>
        </View>
      </Wrapper>
      {
        lock == true&&
        <View style={{width:"100%", height:"100%", alignItems:"center", justifyContent:"center", backgroundColor:"#b6c9d270", position:"absolute", top:0, left:0, borderRadius:13}}>
            <LockedSeasonAnimation
                animate={currentScroll}
                lockFontSize={STAGE_GAME_CARD_WIDTH/1.7}
            />
        </View>
      }
    </View>
  );
}

const styles = StyleSheet.create({
});

const areEqual = (prevProps, nextProps) => {
  if (prevProps.currentScroll !== nextProps.currentScroll) return false;
  if (prevProps.lock !== nextProps.lock) return false;
  if (prevProps.title !== nextProps.title) return false;
  if (prevProps.description !== nextProps.description) return false;
  if (prevProps.image !== nextProps.image) return false;
  if (prevProps.seasonNumber !== nextProps.seasonNumber) return false;
  if (prevProps.stageNumberFrom !== nextProps.stageNumberFrom) return false;
  if (prevProps.stageNumberTo !== nextProps.stageNumberTo) return false;
  if (prevProps.numberStage !== nextProps.numberStage) return false;
  if (prevProps.isActive !== nextProps.isActive) return false;
  if (prevProps.onPress !== nextProps.onPress) return false;
  return true;
};

export default memo(StageGameSeasonCard, areEqual);
