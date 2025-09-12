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
        <View style={{width:150, height:180, alignItems:'center', justifyContent:'center'}}>
            <TouchableNativeFeedback onPress={click} background={TouchableNativeFeedback.Ripple(colors.border.a1,false)}>
                <View style={{flexDirection:'column', gap:15, alignItems:'center', justifyContent:'flex-start', padding:10}}>
                    <View style={{width:itemWidth, height:itemWidth, alignItems:'center', justifyContent:'center', borderRadius:10}}>
                        {
                            image?
                            <ImageComponent
                                uri={image}
                                width={itemWidth}
                                height={itemWidth}
                                resizeMode="cover"
                                borderRadius={10}
                            />
                            :
                            <Icon name={'camera-off'} type={'Feather'} style={{fontSize:itemWidth*0.7, color:colors.border.a1}}/>
                        }
                    </View>
                    <View>
                        <Text style={{fontFamily:Font.medium, color:colors.text.a1, fontSize:14, textAlign:"center"}}>{title}</Text>
                    </View>
                </View>
            </TouchableNativeFeedback>
        </View>
    );
};
export default memo(PackageCollectionItem)