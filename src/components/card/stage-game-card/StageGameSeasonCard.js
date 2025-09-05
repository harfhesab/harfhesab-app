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
import { tabScreenSoundInOnClick } from '../../../utils/sound/SoundFunctions';



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

  const onClick = async () => {
    if (!lock) {
      tabScreenSoundInOnClick()
      onPress()
    }
  };

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
            <View style={{width:"100%", alignItems:'center', paddingTop:10, paddingHorizontal:10}}>
                <View style={{flexDirection:'row', justifyContent:'space-between', alignItems:'center', width:"100%", backgroundColor:`${colors.primary.a1}40`, paddingVertical:15, paddingHorizontal:10, borderRadius:10, marginHorizontal:10}}>
                  <Text style={ { color: colors.text.a1, fontFamily:Font.medium, fontSize:15  }}>{`فصل ${seasonNumber}`}</Text>
                  {
                    lock == true?
                    <Icon name={"download-cloud"} type={"Feather"} style={{fontSize:20, color:colors.text.a1}}/>:
                    <Text style={ { color: colors.text.a1, fontFamily:Font.medium, fontSize:15  }}>{`${numberStage} مرحله ( ${stageNumberFrom} تا ${stageNumberTo} )`}</Text>
                  }
                </View>
            </View>
          </View>
          <View style={{flex:1, width:"100%", alignItems:'flex-start', justifyContent:'center', paddingHorizontal:10}}>
            <MultiLineTextGradientSvg
                  text={title}
                  fontFamily={Font.iran_yekan_extra_black_fa}
                  fontSize={30}
                  borderColor={"#795548"}
                  borderWidth={1}
                  glowBlur={100}
                  glowColor={'#FFFFFF'}
                  glowShadow={true}
                  colors={['#ffc107', '#ff9800', '#ff5722']}
                />
          </View>
          <View style={{width:"100%", alignItems:'flex-end', paddingBottom:10, paddingEnd:10}}>
            
            <ButtonGradient
                text={lock == true ? undefined : "شروع بازی"}
                textSize={16}
                onPress={onClick}
                width={180}
                height={50}
                borderRadius={10}
                fontFamily={Font.iran_yekan_black_fa}
                textSize={22}
                iconName={lock == true ? "shield-lock" : "gamepad"}
                iconType={lock == true ? "MaterialCommunityIcons" : "FontAwesome5"}
                iconSize={lock == true ? 35 : 30}
            />
          </View>
        </View>
      </Wrapper>
      {
        lock == true&&
        <View style={{width:"100%", height:"100%", alignItems:"center", justifyContent:"center", backgroundColor:"#b6c9d270", position:"absolute", top:0, left:0, borderRadius:13}}>
            <LockedSeasonAnimation
                animate={currentScroll}
                lockFontSize={STAGE_GAME_CARD_WIDTH/2}
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
  return true;
};

export default memo(StageGameSeasonCard, areEqual);
