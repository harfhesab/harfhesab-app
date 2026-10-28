import React, {memo} from 'react';
import {View, Text, TouchableOpacity} from 'react-native';
import Animated, { interpolate, useAnimatedStyle, useSharedValue } from 'react-native-reanimated';
import Font from '../../utils/Font';
import { DotIndicator, MaterialIndicator } from 'react-native-indicators';
import LinearGradient from 'react-native-linear-gradient';
import Icon from '../../utils/Icon';
import useAppTheme from '../../hooks/theme/useAppTheme';
import usePressAnimation from '../../hooks/animation/usePressAnimation';
import { vibrate } from '../../utils/vibrationManager';

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

function ButtonGradient(
    {loading, loadingType, onPress, borderRadius=8, width, height, text, text2, iconName, iconType, iconSize=25, backgorundGradinte, textSize=16, fontFamily=Font.bakh_semi_bold, justifyContent='center', flexDirection='row', activeOpacity=0.8}
){
    const colors = useAppTheme();
    const { pressed, sweep, onPressIn, onPressOut, pressStyle } = usePressAnimation({ pressedScale: 0.94, pressedTranslateY: 1.5 });
    const layoutWidth = useSharedValue(0);

    // سایه با لمس کمتر می‌شود => حس «فرو رفتن» دکمه
    const shadowStyle = useAnimatedStyle(() => ({
        elevation: interpolate(pressed.value, [0, 1], [3, 1]),
    }));

    // لایه روشن کم‌رنگ هنگام لمس
    const glowStyle = useAnimatedStyle(() => ({
        opacity: interpolate(pressed.value, [0, 1], [0, 0.14]),
    }));

    // درخشش مورب که از چپ به راست عبور می‌کند
    const shineStyle = useAnimatedStyle(() => ({
        opacity: interpolate(sweep.value, [0, 0.15, 0.85, 1], [0, 1, 1, 0]),
        transform: [
            { translateX: interpolate(sweep.value, [0, 1], [-layoutWidth.value * 0.4, layoutWidth.value * 1.1]) },
            { skewX: '-20deg' },
        ],
    }));

    const renderLoading = ()=>(
        <View style={{width:'100%', height:'100%', alignItems:'center', justifyContent:'center'}}>
            {
                !loadingType?
                <DotIndicator color={colors.button_gradient.content_1} count={3} size={7}/>:
                loadingType == "DotIndicator"?
                <DotIndicator color={colors.button_gradient.content_1} count={3} size={7}/>:
                loadingType == "MaterialIndicator"&&
                <MaterialIndicator color={colors.button_gradient.content_1} trackWidth={3} size={25}/>
            }
        </View>
    )

    const click = ()=>{
        vibrate({pattern:40})
        onPress()
    }

    return(
        <AnimatedTouchable
            disabled={loading}
            activeOpacity={activeOpacity}
            onPress={click}
            onPressIn={onPressIn}
            onPressOut={onPressOut}
            style={[{width:width, height:height, alignItems:'center', justifyContent:'center', borderRadius:borderRadius, shadowColor:colors.shadow.a1, elevation:3}, shadowStyle, pressStyle]}
        >
            <LinearGradient
                colors={backgorundGradinte??colors.button_gradient.background}
                style={{borderRadius:borderRadius, width:"100%", height:"100%", overflow:'hidden'}}
                onLayout={(e) => { layoutWidth.value = e.nativeEvent.layout.width; }}
            >
                <View style={{borderRadius:borderRadius, width:"100%", height:"100%", alignItems:'center', justifyContent:'center'}}>
                    {
                        (loading == true)?
                        (renderLoading())
                        :
                        (iconName && iconType)?
                        (<View style={{flexDirection:flexDirection, alignItems:'center', width:'100%', justifyContent:justifyContent, paddingHorizontal:15, gap:15}}>
                            {text&&<Text style={{fontFamily:fontFamily, fontSize:textSize, color:colors.button_gradient.content_1}}>{text}</Text>}
                            <Icon name={iconName} type={iconType} style={{fontSize:iconSize, color:colors.button_gradient.content_1}}/>
                        </View>)
                        :
                        (<View style={{width:'100%', alignItems:'center'}}>
                            <Text style={{fontFamily:fontFamily, fontSize:textSize, color:colors.button_gradient.content_1, textAlign:'center'}}>{text}</Text>
                            {
                                text2&&
                                <Text style={{fontFamily:Font.bakh_semi_bold, fontSize:12, color:colors.button_gradient.content_2, textAlign:'center'}}>{text2}</Text>
                            }
                        </View>)
                    }
                </View>

                {/* لایه‌های افکت؛ روی لمس تاثیری ندارند */}
                <Animated.View
                    pointerEvents="none"
                    style={[{ position:'absolute', top:0, left:0, right:0, bottom:0, backgroundColor:'#FFFFFF' }, glowStyle]}
                />
                <Animated.View
                    pointerEvents="none"
                    style={[{ position:'absolute', top:0, bottom:0, left:0, width:40, backgroundColor:'rgba(255,255,255,0.28)' }, shineStyle]}
                />
            </LinearGradient>
        </AnimatedTouchable>
    )
}
export default memo(ButtonGradient);