import React, {memo} from 'react';
import {View, Text, TouchableOpacity, ImageBackground} from 'react-native';
import Icon from '../../utils/Icon';
import SimpleBorderText from '../text-components/SimpleBorderText';


interface ButtonImgSrcProps {
  text?: string;
  textColor?: string,
  textBorderColor?: string,
  fontSize?: number;
  textWidth: number;
  onPress?: () => void;
  width?: number;
  height?: number;
  iconType?: string;
  iconName?: string;
  iconSize?: number;
  iconColor?: string,
  imageSrc?: string,
}
const ButtonImgSrc: React.FC<ButtonImgSrcProps> = ({
  text,
  textColor = "#FFFFFF",
  textBorderColor = "#311b92",
  fontSize = 16,
  textWidth = 100,
  onPress,
  width = 200,
  height = 50,
  iconType,
  iconName,
  iconSize = 20,
  iconColor = "#FFFFFF",
  imageSrc = "1"
}) => {
    const source = imageSrc == "1"?require('../../assets/image/button_1.png'): imageSrc== "2"&&require('../../assets/image/button_2.png')
    return(
        <TouchableOpacity activeOpacity={0.8} onPress={onPress} style={{width, height, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 3.84, elevation: 5}}>
            <ImageBackground
                source={source}
                style={{ width: width, height: height, justifyContent: "center", alignItems: "center" }}
                imageStyle={{ resizeMode: "stretch" }}
                resizeMode="stretch"
            >
                <View style={{alignSelf : 'center', width:'100%', justifyContent:'center', flexDirection:'row', alignItems:'center', gap:10}}>
                    {text&&<SimpleBorderText
                                text={text}
                                width={textWidth}
                                height={fontSize*1.6}
                                fontSize={fontSize}
                                textColor={textColor}
                                borderColor={textBorderColor}
                                borderWidth={3}
                            />}
                    {(iconType && iconName)&&<Icon name={iconName} type={iconType} style={{fontSize:iconSize, color:iconColor}}/>}
                </View>
            </ImageBackground>
        </TouchableOpacity>
    )
}
export default memo(ButtonImgSrc);