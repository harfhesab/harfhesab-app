import React, { memo } from 'react';
import {
  View,
  Text,
  TouchableNativeFeedback,
  Dimensions,
  TouchableOpacity,
  ImageBackground
} from 'react-native';
import Icon from '../../../utils/Icon';
import Font from '../../../utils/Font';
import Globals from '../../../utils/Globals';
import useAppTheme from '../../../hooks/theme/useAppTheme';
import StageNumberCurrently from './StageNumberCurrently';
import { tabScreenSoundInOnClick } from '../../../utils/sound/SoundFunctions';
import { IS_TABLET_CONDITION } from '../../../utils/constants/constants';
import SimpleBorderText from '../../text-components/SimpleBorderText';




const { width, height } = Dimensions.get('window');

export const STAGE_CARD_MARGIN = 5
const PADDING_HORIZONTAL = 32
export const LIST_STAGE_CARD_NUMBER_COLUMN = IS_TABLET_CONDITION?6:4
export const STAGE_CARD_SIZE = ((width - (PADDING_HORIZONTAL*2)) / LIST_STAGE_CARD_NUMBER_COLUMN) - (STAGE_CARD_MARGIN*2)

function StageNumber({
  number,
  lock,
  currently,
  onPress
}) {
  const colors = useAppTheme();

  const onClick = async () => {
    tabScreenSoundInOnClick()
    onPress()
  };

  const textLength = number.toString().length
  const fontSizeScale = textLength == 1?1.7:textLength == 2?2:textLength == 3?2.7:3.6
  const fontSize = STAGE_CARD_SIZE/fontSizeScale
  const iconSize = STAGE_CARD_SIZE/2.2
  
  return (
    lock == true?
    <ImageBackground
        source={require("../../../assets/image/square_black.png")}
        style={{ width: STAGE_CARD_SIZE, height: STAGE_CARD_SIZE, justifyContent: "center", alignItems: "center", margin:STAGE_CARD_MARGIN }}
        imageStyle={{ resizeMode: "stretch" }}
        resizeMode="stretch"
    >
      <View style={{width:STAGE_CARD_SIZE, height:STAGE_CARD_SIZE, borderRadius:15, alignItems:'center', justifyContent:'center'}}>
          <Icon name={"locked"} type={"Fontisto"} style={{fontSize:iconSize, color:colors.primary.a3, textShadowColor: "#00000060", textShadowOffset: { width:0.5, height:0.5 }, textShadowRadius: 5}}/>
      </View>
    </ImageBackground>
    :currently == true?
    <StageNumberCurrently
        text={`${number}`}
        boxSize={STAGE_CARD_SIZE}
        onPress={onClick}
        fontSize={fontSize}
        margin={STAGE_CARD_MARGIN}
    />
    :
    <TouchableOpacity activeOpacity={0.85} onPress={onClick} style={{ margin:STAGE_CARD_MARGIN}}>
      <ImageBackground
          source={require("../../../assets/image/square_blue.png")}
          style={{ width: STAGE_CARD_SIZE, height: STAGE_CARD_SIZE, justifyContent: "center", alignItems: "center"}}
          imageStyle={{ resizeMode: "stretch" }}
          resizeMode="stretch"
      >
        <View style={{width:STAGE_CARD_SIZE, height:STAGE_CARD_SIZE, borderRadius:15, alignItems:'center', justifyContent:'center'}}>
            
              <SimpleBorderText
                    text={`${number}`}
                    width={STAGE_CARD_SIZE}
                    height={fontSize*1.6}
                    fontSize={fontSize}
                    borderWidth={3}
                    textColor={colors.primary.a5}
                    borderColor={colors.primary.a2}
                />
        </View>
      </ImageBackground>
    </TouchableOpacity>
  );
}


export default memo(StageNumber);

