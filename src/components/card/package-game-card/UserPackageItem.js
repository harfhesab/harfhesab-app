import React, {memo} from 'react';
import {View, Text, TouchableNativeFeedback, Dimensions} from 'react-native';
import Icon from '../../../utils/Icon';
import Font from '../../../utils/Font';
import FastImage from '@d11/react-native-fast-image';
import Globals from '../../../utils/Globals';
import useAppTheme from '../../../hooks/theme/useAppTheme';
import ImageComponent from '../../image-components/ImageComponent';
import { navigate } from '../../../main/navigationService';

const width = Dimensions.get('window').width
function UserPackageItem({_id, packageId, title, image}){
    const colors = useAppTheme();

    const click = ()=>{
        navigate("PackageInformation", {_id})
    }
    return (
        <View style={{alignItems:'center', justifyContent:'center'}}>
            <TouchableNativeFeedback onPress={click} background={TouchableNativeFeedback.Ripple(colors.border.a1,false)}>
                <View style={{flexDirection:'row', gap:10, alignItems:'center', justifyContent:'flex-start', paddingHorizontal:15, paddingVertical:10}}>
                    <View style={{width:90, height:90, alignItems:'center', justifyContent:'center', backgroundColor:colors.border.a1, borderRadius:10}}>
                        {
                            image?
                            <ImageComponent
                                uri={image}
                                width={90}
                                height={90}
                                resizeMode="cover"
                                borderRadius={10}
                            />
                            :
                            <Icon name={'camera-off'} type={'Feather'} style={{fontSize:40, color:colors.text.a5}}/>
                        }
                    </View>
                    <View>
                        <Text numberOfLines={2} style={{fontFamily:Font.medium, color:colors.text.a2, fontSize:14, textAlign:"center"}}>{title}</Text>
                    </View>
                </View>
            </TouchableNativeFeedback>
        </View>
    );
};
export default memo(UserPackageItem)