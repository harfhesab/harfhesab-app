import React, {useState, memo, useEffect} from 'react';
import {View, Text, TouchableNativeFeedback, Dimensions} from 'react-native';
import {useTheme} from '@react-navigation/native';
import Icon from '../../utils/Icon';
import Font from '../../utils/Font';
import FastImage from '@d11/react-native-fast-image';
import Globals from '../../utils/Globals';
import CheckBox from '../CheckBox';

const width = Dimensions.get('window').width
function CheckBoxItem({check, disabled, checkBoxSize, onPress, width, height, paddingHorizontal, iconName, iconType, iconSize, iconColor, imageUrl, imageSize, imageLocal, text1, text2, fontFamilyText1, fontSizeText1, fontFamilyText2, fontSizeText2}){
    const {colors} = useTheme().colors;
    const [checkState, setCheckState] = useState(check);

    useEffect(() => {
        setCheckState(check);
    }, [check]);

    const onClick = () => {
        if (disabled) return;
        const newState = !checkState;
        setCheckState(newState);
        const time = setTimeout(() => {
            onPress?.(newState);
            clearTimeout(time);
        }, 100);
    };

    return (
        <TouchableNativeFeedback disabled={disabled??undefined} onPress={onClick} style={{width:width??"100%"}} background={TouchableNativeFeedback.Ripple(colors.border.a1,false)}>
            <View style={{flexDirection:'row', alignItems:'center', justifyContent:'space-between', width:width??"100%", height:height??60, paddingHorizontal:paddingHorizontal??15}}>
                <View style={{flexDirection:'row', alignItems:'center', gap:10}}>
                    {
                        (iconName && iconType)&&
                        <Icon name={iconName} type={iconType} style={{fontSize:iconSize??30, color:iconColor??colors.text.a2}}/>
                    }
                    {
                        imageUrl &&
                        <FastImage
                            style={{ borderColor:colors.border.a1, borderWidth:1, borderRadius:10, width:imageSize??30, height:imageSize??30, backgroundColor:colors.text.a4 }}
                            source={{
                                uri: `${Globals.uri}${imageUrl}`,
                                priority: FastImage.priority.normal,
                            }}
                            resizeMode={FastImage.resizeMode.cover}
                        />
                    }
                    {
                        imageLocal &&
                        <FastImage
                            style={{ borderColor:colors.border.a1, borderWidth:1, borderRadius:10, width:imageSize??30, height:imageSize??30, backgroundColor:colors.text.a4 }}
                            source={imageLocal}
                        />
                    }
                    <View>
                        <Text style={{fontFamily:fontFamilyText1??Font.medium, fontSize:fontSizeText1??16, color:colors.text.a1}}>{text1}</Text>
                        {
                            text2&&
                            <Text style={{fontFamily:fontFamilyText2??Font.medium, fontSize:fontSizeText2??12, color:colors.text.a3}}>{text2}</Text>
                        }
                    </View>
                </View>
                <View>
                    <CheckBox
                        check={checkState}
                        size={checkBoxSize??30}
                        onPress={onClick}
                        disabled={disabled??undefined}
                    />
                </View>
            </View>
        </TouchableNativeFeedback> 
    );
};
export default memo(CheckBoxItem)