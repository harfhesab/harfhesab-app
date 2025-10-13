import React from 'react';
import {Dimensions, StyleSheet} from 'react-native';
import { useLetters } from '../../context/LettersContext';
import { View } from 'react-native';
import useAppTheme from '../../../../hooks/theme/useAppTheme';
import NumberCoins from '../../../coin/NumberCoins';
import Font from '../../../../utils/Font';
import NumberCoinsHelp from '../../../coin/NumberCoinsHelp';
import { useSelector } from 'react-redux';
import { RootState } from '../../../../redux/store/RootReducer';
import Setting from '../../../icon/Setting';
import Back from '../../../icon/Back';

const {width} = Dimensions.get("screen");
const TopHeader = () => {
  const colors = useAppTheme();
  const {coins_for_get_help_letter_connecting_stage_game, coins_for_get_help_letter_connecting_package_game} = useSelector((state: RootState) => state.constants);
  const { type, applyForHelp } = useLetters();

  return (
    <View style={styles.header}>
        <View style={{flexDirection:'row', alignItems:'center', gap:7}}>
            <Setting/>
            <View style={{direction:'rtl'}}>
                <NumberCoins />
            </View>
        </View>
        <View style={{flexDirection:'row', alignItems:'center', gap:7}}>
        <NumberCoinsHelp
            numberCoinsHelp={type == "stage-game"?coins_for_get_help_letter_connecting_stage_game:type == "package-game"&&coins_for_get_help_letter_connecting_package_game}
            onPress={applyForHelp}
        />
        <Back/>
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
    paddingHorizontal:10,
  },
});

export default React.memo(TopHeader);