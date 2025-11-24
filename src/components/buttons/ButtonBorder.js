import React, { memo } from 'react';
import { View, Text, TouchableNativeFeedback } from 'react-native';
import Font from '../../utils/Font';
import { DotIndicator, MaterialIndicator } from 'react-native-indicators';
import useAppTheme from '../../hooks/theme/useAppTheme';

const colors = useAppTheme();

function ButtonBorder({
    loading,
    loadingType,
    onPress,
    borderRadius = 8,
    borderWidth = 0.75,
    borderColor = colors.primary.a1,
    width,
    height,
    text,
    text2,
    iconName,
    iconType,
    iconSize = 25,
    textSize = 16,
    fontFamily = Font.medium,
    justifyContent = 'center',
    flexDirection = "row",
    activeOpacity = 0.8,
    textColor = colors.primary.a1,
    CustomContent
}) {

    const renderLoading = () => (
        <View style={{ width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center' }}>
            {
                !loadingType ?
                    <DotIndicator color={borderColor ?? colors.primary.a1} count={3} size={7} /> :
                    loadingType == "DotIndicator" ?
                        <DotIndicator color={borderColor ?? colors.primary.a1} count={3} size={7} /> :
                        loadingType == "MaterialIndicator" &&
                        <MaterialIndicator color={borderColor ?? colors.primary.a1} trackWidth={3} size={25} />
            }
        </View>
    )

    return (
        <View style={{
            borderRadius: borderRadius,
            width: width,
            height: height,
            overflow: 'hidden',
            borderWidth: borderWidth,
            borderColor: borderColor,
            backgroundColor: borderColor ? `${borderColor}15` : `${colors.primary.a1}25`
        }}>
            <TouchableNativeFeedback
                disabled={loading}
                onPress={onPress}
                useForeground={false} 
                background={TouchableNativeFeedback.Ripple(colors.border.a1, false)}
            >
                <View style={{
                    flex: 1,
                    alignItems: 'center',
                    justifyContent: 'center',
                }}>
                    {
                        (loading == true) ?
                            (renderLoading())
                            :
                            ((iconName && iconType) || CustomContent) ?
                            (<View style={{ flexDirection: flexDirection, alignItems: 'center', width: '100%', justifyContent: justifyContent, paddingHorizontal: 15, gap: 15 }}>
                                <Text style={{ fontFamily: fontFamily, fontSize: textSize, color: textColor }}>{text}</Text>
                                {
                                    CustomContent ?
                                        <CustomContent />
                                        :
                                        <Icon name={iconName} type={iconType} style={{ fontSize: iconSize, color: textColor }} />
                                }
                            </View>)
                            :
                            (<View style={{ width: '100%', alignItems: 'center' }}>
                                <Text style={{ fontFamily: fontFamily, fontSize: textSize, color: textColor, textAlign: 'center' }}>{text}</Text>
                                {
                                    text2 &&
                                    <Text style={{ fontFamily: Font.medium, fontSize: 12, color: textColor, textAlign: 'center' }}>{text2}</Text>
                                }
                            </View>)
                    }
                </View>
            </TouchableNativeFeedback>
        </View>
    )
}
export default memo(ButtonBorder);