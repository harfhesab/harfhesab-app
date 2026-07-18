import React, {memo} from 'react';
import {View, Text, TouchableNativeFeedback, Dimensions} from 'react-native';
import Icon from '../../../utils/Icon';
import Font from '../../../utils/Font';
import FastImage from '@d11/react-native-fast-image';
import Globals from '../../../utils/Globals';
import useAppTheme from '../../../hooks/theme/useAppTheme';
import ImageComponent from '../../image-components/ImageComponent';
import { IS_TABLET_CONDITION } from '../../../utils/constants/constants';
import { navigate } from '../../../main/navigationService';
import { showToast } from '../../custom-toast/ToastRef';

const width = Dimensions.get('window').width
const itemWidth = IS_TABLET_CONDITION?(width - 80)/3:(width - 60)/2
function OnlineGameCard({_id, title, image, badge, active, onPress}){
    const colors = useAppTheme();

    const click = ()=>{
        if(active == true){
            onPress()
        } else {
            showToast({
                title: `سرویس غیر فعال`,
                message: "در حال حاضر این بازی آنلاین غیر فعال است.",
                type: "info",
                animationType: "slide",
                position: "top",
                duration: 6000
            });
        }
    }
    return (
        <View style={{alignItems:'center', justifyContent:'center', overflow:'hidden', borderRadius:15}}>
            <TouchableNativeFeedback onPress={click} background={TouchableNativeFeedback.Ripple(colors.border.a1,false)}>
                <View style={{flexDirection:'column', gap:10, alignItems:'center', justifyContent:'flex-start', paddingHorizontal:5, paddingVertical:10}}>
                    <View style={{width:itemWidth, height:itemWidth, alignItems:'center', justifyContent:'center', borderWidth:1.5, borderColor:colors.primary.a3, borderRadius:itemWidth*0.185, backgroundColor:colors.primary.a2}}>
                        {
                            image?
                            <ImageComponent
                                uri={image}
                                width={itemWidth-3}
                                height={itemWidth-3}
                                resizeMode="cover"
                                blank_background={true}
                                borderRadius={itemWidth*0.185}
                            />
                            :
                            <Icon name={'camera-off'} type={'Feather'} style={{fontSize:itemWidth*0.45, color:colors.text.a5}}/>
                        }
                    </View>
                    {
                        (badge && badge?.length > 0)&&
                        <View style={{position:'absolute', start:5, backgroundColor:active==true?colors.primary.a4:colors.primary.a6, borderRadius:20, paddingHorizontal:10, paddingVertical:2, alignItems:'center', justifyContent:'center'}}>
                            <Text style={{fontFamily:Font.medium, color:colors.text.a1, fontSize:10, textAlign:"center"}}>{badge}</Text>
                        </View>
                    }
                    <Text numberOfLines={2} style={{fontFamily:Font.medium, color:colors.text.a2, fontSize:14, textAlign:"center", width:itemWidth, lineHeight:21}}>{title}</Text>
                </View>
            </TouchableNativeFeedback>
        </View>
    );
};
export default memo(OnlineGameCard)