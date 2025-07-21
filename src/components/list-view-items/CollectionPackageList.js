import React, {memo} from 'react';
import {View, Text, TouchableNativeFeedback, Dimensionsm, ScrollView} from 'react-native';
import {useTheme} from '@react-navigation/native';
import Icon from '../../utils/Icon';
import Font from '../../utils/Font';
import FastImage from '@d11/react-native-fast-image';
import Globals from '../../utils/Globals';
import PackageCollectionItem from '../card/package-game-card/PackageCollectionItem';

const width = Dimensions.get('window').width
function CollectionPackageList({_id, title, arrowText, list}){
    const {colors} = useTheme().colors;

    const onClick = () => {
        if (disabled) return;
        onPress();
    };

    return (
        <View>
            {
                title?.length > 0 &&(
                <TouchableNativeFeedback onPress={onClick} style={{width:width??"100%"}} background={TouchableNativeFeedback.Ripple(colors.border.a1,false)}>
                    <View style={{width:width, height:55, flexDirection:'row', alignItems:'center', justifyContent:'space-between' }}>
                        <Text style={{fontFamily:Font.medium, color:colors.text.a1, fontSize:14}}>{title}</Text>
                        <View style={{flexDirection:"row", alignItems:"center", gap:10}}>
                            <Text style={{fontSize:14, color:colors.text.a2, fontFamily:Font.medium}}>{arrowText || "بیشتر"}</Text>
                            <Icon name={'chevron-left'} type={'Feather'} style={{color:colors.text.a2, fontSize:25}}/>
                        </View>
                    </View>
                </TouchableNativeFeedback>)
            }
            <ScrollView horizontal={true}>
                {
                    list?.map((item, index)=>(
                        <PackageCollectionItem
                            _id={item?._id}
                            image={item?.icon_image}
                        />
                    ))
                }
            </ScrollView>
        </View>
    );
};
export default memo(CollectionPackageList)