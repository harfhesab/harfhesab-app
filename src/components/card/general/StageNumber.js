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

const AVERAGE_SIZE = 65
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

  return (
    lock == true?
    <TouchableOpacity activeOpacity={0.6} onPress={onPress}>
      <View style={{width:STAGE_CARD_SIZE, height:STAGE_CARD_SIZE, borderRadius:15, backgroundColor:"#999", alignItems:'center', justifyContent:'center', margin:STAGE_CARD_MARGIN}}>
          <Icon name={"locked"} type={"Fontisto"} style={{fontSize:STAGE_CARD_SIZE/2, color:colors.alert.a1}}/>
      </View>
    </TouchableOpacity>
    :currently == true?
    <TouchableOpacity activeOpacity={0.6} onPress={onPress}>
      <View style={{width:STAGE_CARD_SIZE, height:STAGE_CARD_SIZE, borderRadius:15, backgroundColor:"#4caf50", alignItems:'center', justifyContent:'center', margin:STAGE_CARD_MARGIN}}>
          <TextGradientSvg
              text={number}
              fontFamily={Font.bakh_black}
              fontSize={15}
          />
      </View>
    </TouchableOpacity>
    :
    <TouchableOpacity activeOpacity={0.6} onPress={onPress}>
      <View style={{width:STAGE_CARD_SIZE, height:STAGE_CARD_SIZE, borderRadius:15, backgroundColor:"#03a9f4", alignItems:'center', justifyContent:'center', margin:STAGE_CARD_MARGIN}}>
          <TextGradientSvg
                text={number}
                fontFamily={Font.bakh_black}
                fontSize={15}
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
