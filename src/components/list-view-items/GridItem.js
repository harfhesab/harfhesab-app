import React, {useState, memo, useEffect} from 'react';
import {View, Text, TouchableNativeFeedback, Dimensions} from 'react-native';
import Icon from '../../utils/Icon';
import Font from '../../utils/Font';
import FastImage from '@d11/react-native-fast-image';
import Globals from '../../utils/Globals';
import useAppTheme from '../../hooks/theme/useAppTheme';
import ImageComponent from '../image-components/ImageComponent';
import LocalImageComponent from '../image-components/LocalImageComponent';


function GridItem({
    onPress,
    disabled=undefined,
    title,
    description,
    image,
    localImage,
    width,
    height,
    selected,
    iconName='layers',
    iconType='Ionicons',
    deletedItem,
    selectedItem,
    disabledDeleteItem,
    blank_background
}){
    const colors = useAppTheme();
    const [select, setSelect] = useState(selected);

    useEffect(() => {
        setSelect(selected);
    }, [selected]);

    const onClick = () => {
        if(disabled == true){
            onPress?.()
        } else {
            if (select == true) {
                if(disabledDeleteItem == true) return
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
        }
    };

    return (
        <View style={{width, height, borderRadius:15, overflow:'hidden'}}>
            <TouchableNativeFeedback onPress={onClick} style={{width, height}} background={TouchableNativeFeedback.Ripple(colors.border.a1,false)}>
                <View style={{alignItems:'center', justifyContent:'flex-start', paddingVertical:10, width:"100%", height:"100%", gap:10, borderColor:select?colors.primary.a1:colors.border.a1, borderWidth:select?1.5:0.5, borderRadius:15, backgroundColor:select?`${colors.primary.a1}15`:"transparent"}}>
                    {
                        localImage == true?
                        <LocalImageComponent
                            path={image}
                            width={width - 20}
                            height={width - 20}
                            resizeMode={'cover'}
                            borderRadius={13}
                            style={{ borderRadius:10 }}
                            blank_background
                        />
                        :
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
                            blank_background
                        />
                    }
                    <View style={{width:"100%", alignItems:'center', paddingHorizontal:10, flex:1, justifyContent:'space-between'}}>
                        {title&&<Text style={{fontFamily:Font.medium, color:colors.text.a2, fontSize:13, width:width - 20, textAlign:'center', lineHeight:20}}>{title}</Text>}
                        {description&&<Text style={{fontFamily:Font.medium, color:colors.text.a6, fontSize:8, width:width - 20, textAlign:'center', lineHeight:15}}>{description}</Text>}
                    </View>
                </View>
            </TouchableNativeFeedback> 
        </View>
    );
};
export default memo(GridItem)