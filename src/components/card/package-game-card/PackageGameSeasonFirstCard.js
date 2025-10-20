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
import { IS_TABLET_CONDITION, STATUS_BAR_HEIGHT } from '../../../utils/constants/constants';
import { tabScreenSoundInOnClick } from '../../../utils/sound/SoundFunctions';
import useAppTheme from '../../../hooks/theme/useAppTheme';
import SimpleBorderText from '../../text-components/SimpleBorderText';
import LocalImageComponent from '../../image-components/LocalImageComponent';
import WoodProgressBar from '../../WoodProgressBar';

const { width, height } = Dimensions.get('screen');
const HEADER_HEIGHT = 65+STATUS_BAR_HEIGHT
const PACKAGE_GAME_SEASON_CARD_MARGIN = 10;
const PACKAGE_GAME_SEASON_CARD_HEIGHT = height - (HEADER_HEIGHT + 140);
const CONTENT_HEIGHT = PACKAGE_GAME_SEASON_CARD_HEIGHT*0.8 - 40
const PACKAGE_GAME_CARD_WIDTH = IS_TABLET_CONDITION
  ? 450
  : width - (PACKAGE_GAME_SEASON_CARD_MARGIN * 2);

function PackageGameSeasonFirstCard({
  title,
  image,
  numberStage,
  numberSeason,
  lastStageNumber,
  onPress,
}) {
  const colors = useAppTheme();

  const onClick = async () => {
    
  };

  return (
    <View style={{height:PACKAGE_GAME_SEASON_CARD_HEIGHT, alignItems:'center', justifyContent:'flex-start', paddingTop:40}}>
      <ImageBackground
          source={require("../../../assets/image/frame_stage.png")}
          style={{ width: PACKAGE_GAME_CARD_WIDTH, height: CONTENT_HEIGHT }}
          imageStyle={{ resizeMode: "stretch" }}
          resizeMode="stretch"
      >
        <View style={{
          width: PACKAGE_GAME_CARD_WIDTH,
          height: CONTENT_HEIGHT,
          overflow: 'visible',
          alignItems:'center'
        }}>
            <CardContent
              title={title}
              image={image}
              numberStage={numberStage}
              numberSeason={numberSeason}
              lastStageNumber={lastStageNumber}
              colors={colors}
              onPress={onPress}
            />
        </View>
      </ImageBackground>
      <ImageBackground
          source={require("../../../assets/image/header_title_frame.png")}
          style={{ width: PACKAGE_GAME_CARD_WIDTH*0.9, height: PACKAGE_GAME_CARD_WIDTH*0.9*0.233, position:'absolute', top:0, alignSelf:'center', alignItems:'center', justifyContent:'center', paddingBottom:10}}
          imageStyle={{ resizeMode: "stretch" }}
          resizeMode="stretch"
      >
        <SimpleBorderText
            text={title}
            width={PACKAGE_GAME_CARD_WIDTH * 0.6 - 30}
            height={18*1.6}
            fontSize={18}
            borderWidth={2}
            textColor={"#4d2719"}
            borderColor={"#e5c0b3"}
        />
      </ImageBackground>
    </View>
  );
}

const CardContent = memo(({
  title,
  image,
  numberStage,
  numberSeason,
  lastStageNumber,
  colors,
  onPress,
}) => {
  return (
    <View style={{
      width: PACKAGE_GAME_CARD_WIDTH,
      height: CONTENT_HEIGHT,
      flexDirection: 'column',
      justifyContent: 'space-between',
    }}>
      <View style={{ width: '100%', alignItems: 'center', paddingTop:PACKAGE_GAME_CARD_WIDTH*0.04 }}>
        <ImageComponent
          uri={image}
          width={PACKAGE_GAME_CARD_WIDTH*0.92}
          height={PACKAGE_GAME_CARD_WIDTH * 0.5175}
          resizeMode={'cover'}
          style={{borderTopLeftRadius:PACKAGE_GAME_CARD_WIDTH*0.16, borderTopRightRadius:PACKAGE_GAME_CARD_WIDTH*0.16, borderBottomLeftRadius:25, borderBottomRightRadius:25}}
        />
      </View>
      
      


      


      <View style={{ width: '100%', alignItems: 'center' }}>
        <ImageBackground
            source={require("../../../assets/image/frame_stage_info.png")}
            style={{ width: PACKAGE_GAME_CARD_WIDTH*0.8, height: PACKAGE_GAME_CARD_WIDTH*0.31, alignItems:'center', justifyContent:'center'}}
            imageStyle={{ resizeMode: "stretch" }}
            resizeMode="stretch"
        >
          
          
        </ImageBackground>
      </View>
      <View style={{alignItems:'center', width:'100%', paddingBottom:30}}>
        <WoodProgressBar
          progressWidth={PACKAGE_GAME_CARD_WIDTH*0.8}
          progress={0}
          maxValue={100}
          showValue={true}
        />
      </View>
    </View>
  );
}, (p, n) => {
  // فقط وقتی داده‌های متن یا تصویر یا لاک عوض شد، rerender کن
  return (
    p.title === n.title &&
    p.image === n.image &&
    p.numberStage === n.numberStage &&
    p.numberSeason === n.numberSeason &&
    p.lastStageNumber === n.lastStageNumber
  );
});

export default memo(PackageGameSeasonFirstCard);

