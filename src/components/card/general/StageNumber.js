import React, { memo } from 'react';
import {
  View,
  Text,
  TouchableNativeFeedback,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import Icon from '../../../utils/Icon';
import Font from '../../../utils/Font';
import Globals from '../../../utils/Globals';
import useAppTheme from '../../../hooks/theme/useAppTheme';
import TextGradientSvg from '../../text-components/TextGradientSvg';
import StageNumberCurrently from './StageNumberCurrently';
import LinearGradient from 'react-native-linear-gradient';




const { width, height } = Dimensions.get('window');

const AVERAGE_SIZE = 70
export const STAGE_CARD_MARGIN = 5
const PADDING_HORIZONTAL = 15
const CALCULATE_ALMOST_NUMBER_COLUMN = (width - (PADDING_HORIZONTAL*2)) / (AVERAGE_SIZE + (STAGE_CARD_MARGIN*2))
export const LIST_STAGE_CARD_NUMBER_COLUMN = Math.trunc(CALCULATE_ALMOST_NUMBER_COLUMN)
export const STAGE_CARD_SIZE = ((width - (PADDING_HORIZONTAL*2)) / LIST_STAGE_CARD_NUMBER_COLUMN) - (STAGE_CARD_MARGIN*2)

function StageNumber({
  number,
  lock,
  currently,
  onPress
}) {
  const colors = useAppTheme();

  const textLength = number.toString().length
  const fontSizeScale = textLength == 1?1.5:textLength == 2?1.8:textLength == 3?2.2:2.6
  const fontSize = STAGE_CARD_SIZE/fontSizeScale

  return (
    lock == true?
    <LinearGradient colors={["#97baca", "#263d49"]} style={{borderRadius:15, width:STAGE_CARD_SIZE, height:STAGE_CARD_SIZE, margin:STAGE_CARD_MARGIN}}>
      <View style={{width:STAGE_CARD_SIZE, height:STAGE_CARD_SIZE, borderRadius:15, alignItems:'center', justifyContent:'center'}}>
          <Icon name={"locked"} type={"Fontisto"} style={{fontSize:fontSize/1.2, color:"#fcb900", textShadowColor: "#00000060", textShadowOffset: { width:0.5, height:0.5 }, textShadowRadius: 5}}/>
      </View>
    </LinearGradient>
    :currently == true?
    <StageNumberCurrently
        text={`${number}`}
        boxSize={STAGE_CARD_SIZE}
        onPress={onPress}
        fontSize={fontSize}
        margin={STAGE_CARD_MARGIN}
    />
    :
    <TouchableOpacity activeOpacity={0.85} onPress={onPress} style={{ margin:STAGE_CARD_MARGIN}}>
      <LinearGradient colors={["#4fc3f7", "#004479"]} style={{borderRadius:15, width:STAGE_CARD_SIZE, height:STAGE_CARD_SIZE}}>
        <View style={{width:STAGE_CARD_SIZE, height:STAGE_CARD_SIZE, borderRadius:15, alignItems:'center', justifyContent:'center'}}>
            <TextGradientSvg
                  text={`${number}`}
                  fontFamily={Font.bakh_extra_bold}
                  fontSize={fontSize}
                  colors={["#dce775", "#fcb900"]}
                  shadowColor={"#00000090"}
                  shadowBlur={5}
                  dropShadow={true}
                  borderColor={"#33333385"}
                  borderWidth={0.5}
                  glowBlur={100}
                  glowColor={'#fff5c8'}
                  glowShadow={true}
              />
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
}


const areEqual = (prevProps, nextProps) => {
  if (prevProps.number !== nextProps.number) return false;
  if (prevProps.lock !== nextProps.lock) return false;
  if (prevProps.currently !== nextProps.currently) return false;
  if (prevProps.onPress !== nextProps.onPress) return false;
  return true;
};
export default memo(StageNumber, areEqual);

