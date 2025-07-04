import React, {memo} from 'react';
import {View, Text, TouchableNativeFeedback, Dimensions} from 'react-native';
import {useTheme} from '@react-navigation/native';
import Icon from '../../../utils/Icon';
import Font from '../../../utils/Font';
import FastImage from 'react-native-fast-image';
import Globals from '../../../utils/Globals';

const width = Dimensions.get('window').width
function StageGameSeason({}){
    const {colors} = useTheme().colors;

    return (
        <View style={{title, description, image, seasonNumber, stageNumberFrom, stageNumberTo, numberStage, isActive}}>
            
        </View>
    );
};


const areEqual = (prevProps, nextProps) => {
    if (prevProps.label !== nextProps.label) return false;
    return true;
};

export default memo(StageGameSeason, areEqual)