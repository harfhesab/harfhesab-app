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
import LocalImageComponent from '../../image-components/LocalImageComponent';
import WoodProgressBar from '../../WoodProgressBar';

const { width, height } = Dimensions.get('window');

export const STAGE_GAME_SEASON_CARD_MARGIN = 10;
export const STAGE_GAME_SEASON_CARD_HEIGHT = height - 185;
const CONTENT_HEIGHT = STAGE_GAME_SEASON_CARD_HEIGHT - 25
const STAGE_GAME_CARD_WIDTH = IS_TABLET_CONDITION
  ? (width - (STAGE_GAME_SEASON_CARD_MARGIN * 3)) / 2
  : width - (STAGE_GAME_SEASON_CARD_MARGIN * 2);

function StageGameSeasonCard({
  lock,
  ended,
  currentScroll,
  title,
  description,
  image,
  progress,
  seasonNumber,
  stageNumberFrom,
  stageNumberTo,
  numberStage,
  isActive,
  onPress,
  languageName
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
              ended={ended}
              title={title}
              image={image}
              progress={progress}
              seasonNumber={seasonNumber}
              stageNumberFrom={stageNumberFrom}
              stageNumberTo={stageNumberTo}
              numberStage={numberStage}
              colors={colors}
              onClick={onClick}
              languageName={languageName}
            />
          </View>

          {lock === true && (
            <View style={{
              width: '100%',
              height: '100%',
              alignItems: 'center',
              justifyContent: 'flex-start',
              paddingTop:"15%",
              position: 'absolute',
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
  lock, ended, title, image, progress, seasonNumber, stageNumberFrom, stageNumberTo, numberStage, colors, onClick, languageName
}) => {
  const seasonNumberLength = seasonNumber?.toString().length
  const cupNumberFontSize = seasonNumberLength == 1?14:seasonNumberLength == 2?11:8
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
      </View>
      <View style={{ width: '100%', alignItems: 'center' }}>
        <ImageBackground
            source={require("../../../assets/image/frame_stage_info.png")}
            style={{ width: STAGE_GAME_CARD_WIDTH*0.8, height: STAGE_GAME_CARD_WIDTH*0.31, alignItems:'center', justifyContent:'center'}}
            imageStyle={{ resizeMode: "stretch" }}
            resizeMode="stretch"
        >
          {
            lock == true?
            <View style={{flexDirection: 'column', justifyContent: 'center', alignItems: 'center', width: '100%', height: '100%', gap:10, paddingBottom:10}}>
              <Text style={{ color: colors.text.a1, fontFamily: Font.iran_yekan_black_fa, fontSize: 20 }}>{`فصل ${seasonNumber}`}</Text>
              <Icon name={'download-cloud'} type={'Feather'} style={{ fontSize: 25, color:"#fcb900" }} />
            </View>
            :
            <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', width: '100%', height: '100%', paddingHorizontal:15, paddingBottom:10}}>
                <View style={{flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', gap:3}}>
                  <Text style={{ color: colors.text.a1, fontFamily: Font.black, fontSize: 16 }}>{`فصل ${seasonNumber}`}</Text>
                  <Text style={{ color: colors.text.a3, fontFamily: Font.medium, fontSize: 11 }}>{`مرحله ${stageNumberFrom} تا ${stageNumberTo} (${numberStage} مرحله)`}</Text>
                  <Text style={{ color: colors.text.a3, fontFamily: Font.medium, fontSize: 11 }}>{`زبان ${languageName}`}</Text>
                </View>
                {
                  ended == true&&
                  <ImageBackground
                      source={require("../../../assets/image/cup.png")}
                      style={{ width: STAGE_GAME_CARD_WIDTH*0.15, height: STAGE_GAME_CARD_WIDTH*0.15, alignItems:'center', justifyContent:'center', paddingBottom:20}}
                      imageStyle={{ resizeMode: "stretch", opacity:0.9 }}
                      resizeMode="stretch"
                  >
                    <Text style={{ color: "#86442d", fontFamily: Font.iran_yekan_black_fa, fontSize:cupNumberFontSize }}>{seasonNumber}</Text>
                  </ImageBackground>
                }
            </View>
            
          }
          
        </ImageBackground>
      </View>
      <View style={{alignItems:'center', width:'100%'}}>
        <WoodProgressBar
          progressWidth={STAGE_GAME_CARD_WIDTH*0.8}
          progress={ended == true?numberStage:progress??0}
          maxValue={numberStage}
          showValue={lock == true?false:true}
        />
      </View>
      <View style={{ width: '100%', alignItems: 'center', paddingBottom:30 }}>
        <TouchableOpacity onPress={onClick} activeOpacity={1} style={{ alignSelf:'center', shadowColor:'#000', elevation:5}}>
          <ImageBackground
              source={require("../../../assets/image/frame_stage_button.png")}
              style={{ width: STAGE_GAME_CARD_WIDTH * 0.65, height: STAGE_GAME_CARD_WIDTH * 0.247, alignItems:'center', justifyContent:'center', paddingBottom:5}}
              imageStyle={{ resizeMode: "stretch" }}
              resizeMode="stretch"
          >
            {
              lock==true?
              <LocalImageComponent
                path={require('../../../assets/image/lock_yellow.png')}
                width={28}
                height={35}
                resizeMode={'stretch'}
                blank_background={true}
              />
              :
              <Text style={{fontFamily:Font.iran_yekan_black_fa, fontSize:25, color:"#fcb900"}}>{'شروع بازی'}</Text>
            }
          </ImageBackground>
        </TouchableOpacity>
      </View>
      
    </View>
  );
}, (p, n) => {
  // فقط وقتی داده‌های متن یا تصویر یا لاک عوض شد، rerender کن
  return (
    p.lock === n.lock &&
    p.ended === n.ended &&
    p.title === n.title &&
    p.image === n.image &&
    p.progress === n.progress &&
    p.seasonNumber === n.seasonNumber &&
    p.stageNumberFrom === n.stageNumberFrom &&
    p.stageNumberTo === n.stageNumberTo &&
    p.numberStage === n.numberStage &&
    p.languageName === n.languageName
  );
});

export default memo(StageGameSeasonCard);
