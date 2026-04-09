import React, {memo} from 'react';
import {View, Text, TouchableOpacity, Dimensions, Image, ImageBackground} from 'react-native';
import Icon from '../../utils/Icon';
import Font from '../../utils/Font';
import useAppTheme from '../../hooks/theme/useAppTheme';
import LocalImageComponent from '../image-components/LocalImageComponent';

const width = Dimensions.get('window').width
function SimpleItem({
    click,
    arrow,
    value,
    valueColor="#fcb900",
    title,
    title_color="#fcb900",
    icon_name,
    icon_type,
    image_icon,
    image_width=25,
    image_height=25,
    icon_size=25,
    icon_color="#fcb900",
    disabled = false,
    ValueComponent
}){
    const colors = useAppTheme();
    return (
        <TouchableOpacity activeOpacity={0.8} disabled={disabled} onPress={click}>
            <ImageBackground
                source={require("../../assets/image/simple_list_item.png")}
                style={{ width: width - 55, height: 70}}
                imageStyle={{ resizeMode: "stretch" }}
                resizeMode="stretch"
            >
                <View style={{ height:70, width:"100%", flexDirection:'row', justifyContent:'space-between', alignItems:'center', paddingHorizontal:10}}>
                    <View style={{flexDirection:'row', alignItems:'center', gap:10}}>
                        <ImageBackground
                            source={require("../../assets/image/circle_button.png")}
                            style={{ width:50, height: 50, alignItems:'center', justifyContent:'center', paddingBottom:3}}
                            imageStyle={{ resizeMode: "stretch" }}
                            resizeMode="stretch"
                        >
                            {
                            icon_name && icon_type&&
                                <Icon name={icon_name} type={icon_type} style={{color:icon_color, fontSize:icon_size}}/>
                            }
                            {
                                image_icon &&
                                <LocalImageComponent
                                    path={image_icon}
                                    width={image_width}
                                    height={image_height}
                                    resizeMode="stretch"
                                    blank_background
                                />
                            }
                        </ImageBackground>
                        <Text style={{fontSize:14, color:title_color, fontFamily:Font.bold}}>{title}</Text>
                    </View>
                    <View style={{flexDirection:'row', alignItems:'center', gap:10}}>
                        {
                            value&&
                            <View style={{backgroundColor:colors.alert.a2, paddingHorizontal:7.5, borderRadius:20}}>
                                <Text style={{fontSize:12, color:"#FFF", fontFamily:Font.black}}>{value}</Text>
                            </View>
                        }
                        {
                            ValueComponent&&
                            <ValueComponent/>
                        }
                        {
                            arrow == true&&
                            <Icon name={'angle-left'} type={'FontAwesome'} style={{color:icon_color, fontSize:30}}/>
                        }
                    </View>
                </View>
            </ImageBackground>
        </TouchableOpacity> 
    );
};
export default memo(SimpleItem)