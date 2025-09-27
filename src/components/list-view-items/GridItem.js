import React, {useState, memo, useEffect} from 'react';
import {View, Text, TouchableNativeFeedback, Dimensions} from 'react-native';
import Icon from '../../utils/Icon';
import Font from '../../utils/Font';
import FastImage from '@d11/react-native-fast-image';
import Globals from '../../utils/Globals';
import useAppTheme from '../../hooks/theme/useAppTheme';
import ImageComponent from '../image-components/ImageComponent';


function GridItem({
    onPress,
    disabled=undefined,
    title,
    image,
    width,
    height,
    selected,
    iconName='layers',
    iconType='Ionicons',
    deletedItem,
    selectedItem,
}){
    const colors = useAppTheme();
    const [select, setSelect] = useState(selected);

    useEffect(() => {
        setSelect(selected);
    }, [selected]);

    const selectItem = () => {
        if (select == true) {
            setSelect(false);
            const time = setTimeout(() => {
                deletedItem();
            }, 100);
        } else {
            setSelect(true);
            const time = setTimeout(() => {
                if (selectedItem() == false) {
                    setSelect(false);
                }
            }, 100);
        }
    };

    return (
        <View style={{width, height}}>
            <TouchableNativeFeedback disabled={disabled} onPress={selectItem} style={{width, height}} background={TouchableNativeFeedback.Ripple(colors.border.a1,false)}>
                <View style={{alignItems:'center', justifyContent:'flex-start', paddingTop:10, width:"100%", height:"100%", gap:5, borderColor:select?colors.primary.a1:colors.border.a1, borderWidth:select?1.5:0.5, borderRadius:10, backgroundColor:select?`${colors.primary.a1}15`:"transparent"}}>
                    <ImageComponent
                        uri={image}
                        width={width - 20}
                        height={width - 20}
                        resizeMode={'cover'}
                        borderRadius={13}
                        style={{ borderRadius:10 }}
                        iconName={iconName}
                        iconType={iconType}
                        iconSize={width/2}
                    />  
                    <Text style={{fontFamily:Font.medium, color:colors.text.a3, fontSize:14, width:width - 20, textAlign:'center'}}>{title}</Text>
                </View>
            </TouchableNativeFeedback> 
        </View>
    );
};
export default memo(GridItem)