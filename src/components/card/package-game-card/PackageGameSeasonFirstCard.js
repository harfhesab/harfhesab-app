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
const CONTENT_HEIGHT = PACKAGE_GAME_SEASON_CARD_HEIGHT - 10
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
    <View style={{height:PACKAGE_GAME_SEASON_CARD_HEIGHT, alignItems:'center', justifyContent:'flex-start'}}>
      <ImageBackground
          source={require("../../../assets/image/card_package_info.png")}
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
          source={require("../../../assets/image/card_package_info_button.png")}
          style={{ width: PACKAGE_GAME_CARD_WIDTH*0.9, height: PACKAGE_GAME_CARD_WIDTH*0.225, position:'absolute', top:0, alignSelf:'center', alignItems:'center', justifyContent:'center', paddingBottom:15}}
          imageStyle={{ resizeMode: "stretch" }}
          resizeMode="stretch"
      >
        <SimpleBorderText
            text={title}
            width={PACKAGE_GAME_CARD_WIDTH * 0.6 - 30}
            height={18*1.6}
            fontSize={18}
            borderWidth={1.5}
            textColor={"#4d2719"}
            borderColor={"#e5c0b3"}
        />
      </ImageBackground>
      <TouchableOpacity activeOpacity={0.8} style={{position:'absolute', bottom:0, alignSelf:'center'}}>
        <ImageBackground
            source={require("../../../assets/image/wood_blue_button.png")}
            style={{ width: PACKAGE_GAME_CARD_WIDTH*0.7, height: PACKAGE_GAME_CARD_WIDTH*0.7*0.383, alignItems:'center', justifyContent:'center', paddingBottom:10}}
            imageStyle={{ resizeMode: "stretch" }}
            resizeMode="stretch"
        >
        <Text style={{fontFamily:Font.iran_yekan_black_fa, fontSize:25, color:"#fcb900"}}>{'شروع'}</Text>
        </ImageBackground>
      </TouchableOpacity>
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
      <View style={{ width: '100%', alignItems: 'center', paddingTop:PACKAGE_GAME_CARD_WIDTH*0.185 }}>
        <ImageComponent
          uri={image}
          width={PACKAGE_GAME_CARD_WIDTH*0.922}
          height={PACKAGE_GAME_CARD_WIDTH * 0.5175}
          resizeMode={'cover'}
          style={{borderTopLeftRadius:23, borderTopRightRadius:23, borderBottomLeftRadius:8, borderBottomRightRadius:8}}
        />
      </View>
      
      
      <View style={{width:'100%', flexDirection:'row', alignItems:'center', justifyContent:'center', gap:10}}>
        
        <ImageBackground
            source={require("../../../assets/image/card_2.png")}
            style={{ width: PACKAGE_GAME_CARD_WIDTH*0.2, height: PACKAGE_GAME_CARD_WIDTH*0.26, alignItems:'center', justifyContent:'center'}}
            imageStyle={{ resizeMode: "stretch" }}
            resizeMode="stretch"
        >
          <Text style={{fontFamily:Font.medium, fontSize:14, color:"#222"}}>{numberSeason}</Text>
          <Text style={{fontFamily:Font.medium, fontSize:8, color:"#666"}}>{'تعداد فصل'}</Text>
          <Icon name={"receipt"} type={"Ionicons"} style={{color:"#333", fontSize:20}}/>
        </ImageBackground>

        <ImageBackground
            source={require("../../../assets/image/card_2.png")}
            style={{ width: PACKAGE_GAME_CARD_WIDTH*0.2, height: PACKAGE_GAME_CARD_WIDTH*0.26, alignItems:'center', justifyContent:'center'}}
            imageStyle={{ resizeMode: "stretch" }}
            resizeMode="stretch"
        >
          <Text style={{fontFamily:Font.medium, fontSize:14, color:"#222"}}>{numberStage}</Text>
          <Text style={{fontFamily:Font.medium, fontSize:8, color:"#666"}}>{'تعداد مرحله'}</Text>
          <Icon name={"golf"} type={"Ionicons"} style={{color:"#333", fontSize:20}}/>
        </ImageBackground>

        <ImageBackground
            source={require("../../../assets/image/card_2.png")}
            style={{ width: PACKAGE_GAME_CARD_WIDTH*0.2, height: PACKAGE_GAME_CARD_WIDTH*0.26, alignItems:'center', justifyContent:'center'}}
            imageStyle={{ resizeMode: "stretch" }}
            resizeMode="stretch"
        >
          <Text style={{fontFamily:Font.medium, fontSize:14, color:"#222"}}>{"فارسی"}</Text>
          <Text style={{fontFamily:Font.medium, fontSize:8, color:"#666"}}>{'زبان بازی'}</Text>
          <Icon name={"layers"} type={"Ionicons"} style={{color:"#333", fontSize:20}}/>
        </ImageBackground>
        
      </View>

      
      <View style={{alignItems:'center', width:'100%', paddingBottom:"30%"}}>
        <WoodProgressBar
          progressWidth={PACKAGE_GAME_CARD_WIDTH*0.8}
          progress={lastStageNumber??0}
          maxValue={numberStage}
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

