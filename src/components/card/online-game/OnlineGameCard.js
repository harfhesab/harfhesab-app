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

const width = Dimensions.get('window').width
const itemWidth = IS_TABLET_CONDITION?(width - 60)/3:(width - 45)/2
function OnlineGameCard({_id, title, image}){
    const colors = useAppTheme();

    const click = ()=>{
        
    }
    return (
        <View style={{alignItems:'center', justifyContent:'center'}}>
            <TouchableNativeFeedback onPress={click} background={TouchableNativeFeedback.Ripple(colors.border.a1,false)}>
                <View style={{flexDirection:'column', gap:10, alignItems:'center', justifyContent:'flex-start'}}>
                    <View style={{width:itemWidth, height:itemWidth, alignItems:'center', justifyContent:'center'}}>
                        {
                            image?
                            <ImageComponent
                                uri={image}
                                width={itemWidth}
                                height={itemWidth}
                                resizeMode="cover"
                                borderRadius={15}
                                blank_background={true}
                            />
                            :
                            <Icon name={'camera-off'} type={'Feather'} style={{fontSize:itemWidth*0.45, color:colors.text.a5}}/>
                        }
                    </View>
                    <View>
                        <Text numberOfLines={2} style={{fontFamily:Font.medium, color:colors.text.a2, fontSize:15, textAlign:"center", width:itemWidth, lineHeight:21}}>{title}</Text>
                    </View>
                </View>
            </TouchableNativeFeedback>
        </View>
    );
};
export default memo(OnlineGameCard)