import React, { memo } from 'react';
import {
  View,
  Text,
  TouchableNativeFeedback,
  Dimensions,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import Icon from '../../../utils/Icon';
import Font from '../../../utils/Font';
import FastImage from '@d11/react-native-fast-image';
import Globals from '../../../utils/Globals';
import useAppTheme from '../../../hooks/theme/useAppTheme';
import TextGradientSvg from '../../text-components/TextGradientSvg';



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
    <TouchableOpacity activeOpacity={0.6} onPress={onPress}>
      <View style={{width:STAGE_CARD_SIZE, height:STAGE_CARD_SIZE, borderRadius:15, backgroundColor:"#abb8c3", alignItems:'center', justifyContent:'center', margin:STAGE_CARD_MARGIN}}>
          <Icon name={"locked"} type={"Fontisto"} style={{fontSize:STAGE_CARD_SIZE/2, color:"#2d5d86"}}/>
      </View>
    </TouchableOpacity>
    :currently == true?
    <TouchableOpacity activeOpacity={0.6} onPress={onPress}>
      <View style={{width:STAGE_CARD_SIZE, height:STAGE_CARD_SIZE, borderRadius:15, backgroundColor:colors.primary.a1, alignItems:'center', justifyContent:'center', margin:STAGE_CARD_MARGIN}}>
          <TextGradientSvg
              text={`${number}`}
              fontFamily={Font.bakh_extra_bold}
              fontSize={fontSize}
              colors={["#ff9800", "#f57c00", "#e65100"]}
              shadowColor={"#33333350"}
              dropShadow={true}
              glowShadow={true}
              glowColor={"#555555"}
              glowBlur={10}
              borderColor={"#ae2900"}
              borderWidth={0.8}
          />
      </View>
    </TouchableOpacity>
    :
    <TouchableOpacity activeOpacity={0.6} onPress={onPress}>
      <View style={{width:STAGE_CARD_SIZE, height:STAGE_CARD_SIZE, borderRadius:15, backgroundColor:"#0288d1", alignItems:'center', justifyContent:'center', margin:STAGE_CARD_MARGIN}}>
          <TextGradientSvg
                text={`${number}`}
                fontFamily={Font.bakh_extra_bold}
                fontSize={fontSize}
                colors={["#ff9800", "#f57c00", "#e65100"]}
                shadowColor={"#33333350"}
                dropShadow={true}
                glowShadow={true}
                glowColor={"#555555"}
                glowBlur={10}
                borderColor={"#ae2900"}
                borderWidth={0.8}
            />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  
});

const areEqual = (prevProps, nextProps) => {
  if (prevProps.number !== nextProps.number) return false;
  if (prevProps.lock !== nextProps.lock) return false;
  if (prevProps.currently !== nextProps.currently) return false;
  return true;
};

export default memo(StageNumber, areEqual);
