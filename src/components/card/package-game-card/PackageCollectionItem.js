import React, {memo} from 'react';
import {View, Text, TouchableNativeFeedback, Dimensions} from 'react-native';
import Icon from '../../../utils/Icon';
import Font from '../../../utils/Font';
import FastImage from '@d11/react-native-fast-image';
import Globals from '../../../utils/Globals';
import useAppTheme from '../../../hooks/theme/useAppTheme';
import ImageComponent from '../../image-components/ImageComponent';

const width = Dimensions.get('window').width
const itemWidth = (width - 80)/3
function PackageCollectionItem({_id, title, image, click}){
    const colors = useAppTheme();

    return (
        <View style={{alignItems:'center', justifyContent:'center'}}>
            <TouchableNativeFeedback onPress={click} background={TouchableNativeFeedback.Ripple(colors.border.a1,false)}>
                <View style={{flexDirection:'column', gap:5, alignItems:'center', justifyContent:'flex-start', paddingHorizontal:5, paddingVertical:10, height:itemWidth + 70}}>
                    <View style={{width:itemWidth, height:itemWidth, alignItems:'center', justifyContent:'center', backgroundColor:colors.border.a1, borderRadius:15}}>
                        {
                            image?
                            <ImageComponent
                                uri={image}
                                width={itemWidth}
                                height={itemWidth}
                                resizeMode="cover"
                                borderRadius={15}
                            />
                            :
                            <Icon name={'camera-off'} type={'Feather'} style={{fontSize:itemWidth*0.45, color:colors.text.a5}}/>
                        }
                    </View>
                    <View>
                        <Text numberOfLines={2} style={{fontFamily:Font.medium, color:colors.text.a2, fontSize:13, textAlign:"center", width:itemWidth, lineHeight:21}}>{title}</Text>
                    </View>
                </View>
            </TouchableNativeFeedback>
        </View>
    );
};
export default memo(PackageCollectionItem)