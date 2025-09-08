import React, {memo} from 'react';
import {View, Text, TouchableNativeFeedback, Dimensions, Image} from 'react-native';
import Icon from '../../utils/Icon';
import Font from '../../utils/Font';
import useAppTheme from '../../hooks/theme/useAppTheme';

const width = Dimensions.get('window').width
function SimpleItem({
    click,
    arrow,
    value,
    valueColor,
    title,
    titleColor,
    icon_name,
    icon_type,
    image_icon,
    icon_size=25,
    horizontal,
    disabled,
    textSize=14,
    height = 55,
    iconBackColor
}){
    const colors = useAppTheme();
    return (
        <TouchableNativeFeedback disabled={disabled == true?true:false} onPress={click} background={TouchableNativeFeedback.Ripple(colors.border.a1,false)}>
            <View style={{ height:height, width:width, flexDirection:'row', justifyContent:'space-between', alignItems:'center', paddingHorizontal:horizontal}}>
                <View style={{flexDirection:'row', alignItems:'center', gap:10}}>
                    {
                        icon_name && icon_type&&
                        <View style={{width:35, height:35, borderRadius:10, alignItems:'center', backgroundColor:iconBackColor, justifyContent:'center'}}>
                            <Icon name={icon_name} type={icon_type} style={{color:"#FFFFFF", fontSize:icon_size}}/>
                        </View>
                    }
                    {
                        image_icon &&
                        <View style={{width:35, height:35, borderRadius:10, alignItems:'center', backgroundColor:iconBackColor, justifyContent:'center'}}>
                            <Image
                                style={{height:icon_size, width:icon_size}}
                                source={image_icon}
                            />
                        </View>
                    }
                    <Text style={{fontSize:textSize, color:titleColor??colors.text.a2, fontFamily:Font.medium}}>{title}</Text>
                </View>
                <View style={{flexDirection:'row', alignItems:'center', gap:15}}>
                    {
                        value&&
                        <Text style={{fontSize:textSize, color:valueColor??colors.text.a4, fontFamily:Font.medium}}>{value}</Text>
                    }
                    {
                        arrow == true&&
                        <Icon name={'angle-left'} type={'FontAwesome'} style={{color:colors.text.a4, fontSize:25}}/>
                    }
                </View>
            </View>
        </TouchableNativeFeedback> 
    );
};
export default memo(SimpleItem)