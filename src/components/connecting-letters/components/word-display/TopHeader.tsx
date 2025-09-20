import React from 'react';
import {Dimensions, Image, StyleSheet, Text} from 'react-native';
import Animated, { useAnimatedProps } from 'react-native-reanimated';
import Svg, { Rect } from 'react-native-svg';
import { useLetters } from '../../context/LettersContext';
import { TouchableOpacity, View } from 'react-native';
import Icon from '../../../../utils/Icon';
import useAppTheme from '../../../../hooks/theme/useAppTheme';
import NumberCoins from '../../../coin/NumberCoins';
import Font from '../../../../utils/Font';
import { goBack, navigate } from '../../../../main/navigationService';
import NumberCoinsHelp from '../../../coin/NumberCoinsHelp';
import { useSelector } from 'react-redux';
import { RootState } from '../../../../redux/store/RootReducer';

const {width} = Dimensions.get("screen");
const TopHeader = () => {
  const colors = useAppTheme();
  const {coins_for_get_help_letter_connecting_stage_game, coins_for_get_help_letter_connecting_package_game} = useSelector((state: RootState) => state.constants);
  const { type, applyForHelp } = useLetters();

  return (
    <View style={styles.header}>
        <View style={{flexDirection:'row', alignItems:'center', gap:7}}>
            <TouchableOpacity onPress={()=>navigate("ConnectingLettersStageGame")} activeOpacity={0.8}>
                <View style={{justifyContent:'center', alignItems:'center', height:40, width:40, borderWidth:1, borderRadius:8, borderColor:colors.border.a1, backgroundColor:`${colors.primary.a1}25`}}>
                    <Icon name={"settings-outline"} type='Ionicons' style={{color:colors.text.a1, fontSize:25}}/>
                </View>
            </TouchableOpacity>
            <View style={{direction:'rtl'}}>
                <NumberCoins />
            </View>
        </View>
        <View style={{flexDirection:'row', alignItems:'center', gap:7}}>
        <NumberCoinsHelp
            numberCoinsHelp={type == "stage-game"?coins_for_get_help_letter_connecting_stage_game:type == "package-game"&&coins_for_get_help_letter_connecting_package_game}
            onPress={applyForHelp}
        />
        <TouchableOpacity onPress={()=>{goBack()}} activeOpacity={0.8}>
            <View style={{justifyContent:'center', alignItems:'center', height:40, width:40, borderWidth:1, borderRadius:8, borderColor:colors.border.a1, backgroundColor:`${colors.primary.a1}25`}}>
                <Icon name={"arrow-right"} type='Feather' style={{color:colors.text.a1, fontSize:25}}/>
            </View>
        </TouchableOpacity>
        </View>
    </View>
    
  );
};
const styles = StyleSheet.create({
  sentenceContainer: {
    flex:1,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom:10
  },
  sentenceText: {
    fontSize: 18,
    fontFamily: Font.black,
    textAlign: 'center',
  },
  header: {
    height:65,
    width:width,
    flexDirection:'row',
    alignItems:'center',
    justifyContent:'space-between',
    paddingHorizontal:15,
  },
});

export default React.memo(TopHeader);