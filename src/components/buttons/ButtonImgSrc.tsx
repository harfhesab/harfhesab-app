import React, {memo} from 'react';
import {View, Text, TouchableOpacity, ImageBackground} from 'react-native';
import Icon from '../../utils/Icon';


interface ButtonImgSrcProps {
  text?: string;
  textColor?: string,
  fontSize?: number;
  fontFamily?: string;
  onPress?: () => void;
  width?: number;
  height?: number;
  iconType?: string;
  iconName?: string;
  iconSize?: number;
  iconColor?: string,
}
const ButtonImgSrc: React.FC<ButtonImgSrcProps> = ({
  text,
  textColor = "#FFFFFF",
  fontSize = 16,
  fontFamily,
  onPress,
  width = 200,
  height = 50,
  iconType,
  iconName,
  iconSize = 20,
  iconColor = "#FFFFFF",
}) => {
    return(
        <TouchableOpacity activeOpacity={0.8} onPress={onPress} style={{width, height, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 3.84, elevation: 5}}>
            
            <ImageBackground
                source={require('../../assets/image/button_1.png')}
                style={{ width: width, height: height, justifyContent: "center", alignItems: "center" }}
                imageStyle={{ resizeMode: "stretch" }}
                resizeMode="stretch"
            >
                <View style={{flexDirection:'row', alignItems:'center', gap:10}}>
                    {text&&<Text style={{ color: textColor, fontSize, fontFamily}}>{text}</Text>}
                    {(iconType && iconName)&&<Icon name={iconName} type={iconType} style={{fontSize:iconSize, color:iconColor}}/>}
                </View>
            </ImageBackground>
        </TouchableOpacity>
    )
}
export default memo(ButtonImgSrc);