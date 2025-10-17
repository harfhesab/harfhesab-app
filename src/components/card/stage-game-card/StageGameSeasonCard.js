import React, { memo } from 'react';
import {
  View,
  Text,
  Dimensions,
  StyleSheet,
  ImageBackground,
  TouchableOpacity,
} from 'react-native';
import Icon from '../../../utils/Icon';
import Font from '../../../utils/Font';
import ImageComponent from '../../image-components/ImageComponent';
import MultiLineTextGradientSvg from '../../text-components/MultiLineTextGradientSvg';
import ButtonImgSrc from '../../buttons/ButtonImgSrc';
import LockedSeasonAnimation from '../../LockedSeasonAnimation';
import { IS_TABLET_CONDITION } from '../../../utils/constants/constants';
import { tabScreenSoundInOnClick } from '../../../utils/sound/SoundFunctions';
import useAppTheme from '../../../hooks/theme/useAppTheme';
import SimpleBorderText from '../../text-components/SimpleBorderText';

const { width, height } = Dimensions.get('window');

export const STAGE_GAME_SEASON_CARD_MARGIN = 10;
export const STAGE_GAME_SEASON_CARD_HEIGHT = height - 185;
const CONTENT_HEIGHT = STAGE_GAME_SEASON_CARD_HEIGHT - 25
const STAGE_GAME_CARD_WIDTH = IS_TABLET_CONDITION
  ? (width - (STAGE_GAME_SEASON_CARD_MARGIN * 3)) / 2
  : width - (STAGE_GAME_SEASON_CARD_MARGIN * 2);

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
  onPress,
}) {
  const colors = useAppTheme();

  const onClick = async () => {
    if (!lock) {
      tabScreenSoundInOnClick();
      onPress();
    }
  };

  return (
    <View style={{height:STAGE_GAME_SEASON_CARD_HEIGHT, alignItems:'center', justifyContent:'flex-end'}}>
      <ImageBackground
          source={require("../../../assets/image/frame_stage.png")}
          style={{ width: STAGE_GAME_CARD_WIDTH, height: CONTENT_HEIGHT }}
          imageStyle={{ resizeMode: "stretch" }}
          resizeMode="stretch"
      >
        <View style={{
          width: STAGE_GAME_CARD_WIDTH,
          height: CONTENT_HEIGHT,
          overflow: 'visible',
          alignItems:'center'
        }}>
          <View style={{ flex: 1, position: 'relative' }}>
            <CardContent
              lock={lock}
              title={title}
              image={image}
              seasonNumber={seasonNumber}
              stageNumberFrom={stageNumberFrom}
              stageNumberTo={stageNumberTo}
              numberStage={numberStage}
              colors={colors}
              onClick={onClick}
            />
          </View>

          {lock === true && (
            <View style={{
              width: '100%',
              height: '100%',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: '#83703d70',
              position: 'absolute',
              top: 0,
              left: 0,
            }}>
              <LockedSeasonAnimation animate={currentScroll} lockFontSize={STAGE_GAME_CARD_WIDTH / 2} />
            </View>
          )}
        </View>
      </ImageBackground>
      <ImageBackground
          source={require("../../../assets/image/frame_stage_title.png")}
          style={{ width: STAGE_GAME_CARD_WIDTH * 0.75, height: STAGE_GAME_CARD_WIDTH * 0.177, position:'absolute', top:0, alignSelf:'center', alignItems:'center', justifyContent:'center'}}
          imageStyle={{ resizeMode: "stretch" }}
          resizeMode="stretch"
      >
        <SimpleBorderText
            text={title}
            width={STAGE_GAME_CARD_WIDTH * 0.6 - 30}
            height={18*1.6}
            fontSize={18}
            borderWidth={2}
        />
      </ImageBackground>
    </View>
  );
}

const CardContent = memo(({
  lock, title, image, seasonNumber, stageNumberFrom, stageNumberTo, numberStage, colors, onClick
}) => {
  return (
    <View style={{
      width: STAGE_GAME_CARD_WIDTH,
      height: CONTENT_HEIGHT,
      flexDirection: 'column',
      justifyContent: 'space-between',
    }}>
      <View style={{ width: '100%', alignItems: 'center', paddingTop:STAGE_GAME_CARD_WIDTH*0.055 }}>
        <ImageComponent
          uri={image}
          width={STAGE_GAME_CARD_WIDTH*0.92}
          height={STAGE_GAME_CARD_WIDTH * 0.5175}
          resizeMode={'cover'}
          style={{borderTopLeftRadius:STAGE_GAME_CARD_WIDTH*0.16, borderTopRightRadius:STAGE_GAME_CARD_WIDTH*0.16, borderBottomLeftRadius:25, borderBottomRightRadius:25}}
        />
        <View style={{ width: '100%', alignItems: 'center', paddingTop: 10, paddingHorizontal: 10 }}>
          <View style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            width: '100%',
            backgroundColor: `${colors.primary.a1}45`,
            paddingVertical: 15,
            paddingHorizontal: 10,
            borderRadius: 10,
            marginHorizontal: 10,
          }}>
            <Text style={{ color: colors.text.a1, fontFamily: Font.medium, fontSize: 15 }}>{`فصل ${seasonNumber}`}</Text>
            {lock == true ? (
              <Icon name={'download-cloud'} type={'Feather'} style={{ fontSize: 20, color: colors.text.a1 }} />
            ) : (
              <Text style={{ color: colors.text.a1, fontFamily: Font.medium, fontSize: 15 }}>{`${numberStage} مرحله ( ${stageNumberFrom} تا ${stageNumberTo} )`}</Text>
            )}
          </View>
        </View>
      </View>

      

      <View style={{ width: '100%', alignItems: 'center', paddingBottom:30 }}>
        <TouchableOpacity onPress={onClick} activeOpacity={1} style={{ alignSelf:'center', shadowColor:'#000', elevation:5}}>
          <ImageBackground
              source={require("../../../assets/image/frame_stage_button.png")}
              style={{ width: STAGE_GAME_CARD_WIDTH * 0.65, height: STAGE_GAME_CARD_WIDTH * 0.247, alignItems:'center', justifyContent:'center', paddingBottom:10}}
              imageStyle={{ resizeMode: "stretch" }}
              resizeMode="stretch"
          >
            <Text style={{fontFamily:Font.iran_yekan_black_fa, fontSize:25, color:"#fcb900"}}>{'شروع بازی'}</Text>
          </ImageBackground>
        </TouchableOpacity>
      </View>
      
    </View>
  );
}, (p, n) => {
  // فقط وقتی داده‌های متن یا تصویر یا لاک عوض شد، rerender کن
  return (
    p.lock === n.lock &&
    p.title === n.title &&
    p.image === n.image &&
    p.seasonNumber === n.seasonNumber &&
    p.stageNumberFrom === n.stageNumberFrom &&
    p.stageNumberTo === n.stageNumberTo &&
    p.numberStage === n.numberStage
  );
});

export default memo(StageGameSeasonCard);
