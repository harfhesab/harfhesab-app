import React, {memo} from 'react';
import {View, Text, TouchableNativeFeedback, Dimensions} from 'react-native';
import Icon from '../../../utils/Icon';
import Font from '../../../utils/Font';
import FastImage from '@d11/react-native-fast-image';
import Globals from '../../../utils/Globals';
import useAppTheme from '../../../hooks/theme/useAppTheme';

const width = Dimensions.get('window').width
function PackageCollectionItem({_id, title, image, click}){
    const colors = useAppTheme();

    return (
        <View style={{width:150, height:180, alignItems:'center', justifyContent:'center'}}>
            <TouchableNativeFeedback onPress={click} background={TouchableNativeFeedback.Ripple(colors.border,false)}>
                <View style={{flexDirection:'column', gap:15, alignItems:'center', justifyContent:'flex-start', padding:10}}>
                    <View style={{width:100, height:100, alignItems:'center', justifyContent:'center', borderRadius:10}}>
                        {
                            image?
                            <FastImage
                                style={{width:100, height:100, borderTopStartRadius:10, borderTopEndRadius:10}}
                                source={{
                                    uri: image,
                                    priority: FastImage.priority.normal,
                                }}
                                resizeMode={FastImage.resizeMode.cover}
                            />
                            :
                            <Icon name={'camera-off'} type={'Feather'} style={{fontSize:50, color:colors.border.a1}}/>
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


const areEqual = (prevProps, nextProps) => {
    if (prevProps.label !== nextProps.label) return false;
    return true;
};

export default memo(PackageCollectionItem, areEqual)