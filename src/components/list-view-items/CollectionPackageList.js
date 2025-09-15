import React, {useMemo, memo} from 'react';
import {Platform, View, Text, TouchableNativeFeedback, Dimensions, FlatList} from 'react-native';
import Icon from '../../utils/Icon';
import Font from '../../utils/Font';
import FastImage from '@d11/react-native-fast-image';
import Globals from '../../utils/Globals';
import PackageCollectionItem from '../card/package-game-card/PackageCollectionItem';
import useAppTheme from '../../hooks/theme/useAppTheme';

const width = Dimensions.get('window').width
function CollectionPackageList({_id, title, arrowText, list}){
    const colors = useAppTheme();

    const onClick = () => {
        if (disabled) return;
        onPress();
    };

    const renderItem = ({item, index})=>{
        return(
            <PackageCollectionItem
                _id={item?._id}
                image={item?.icon_image}
                title={item?.title}
            />
        )
    }
    const memoizedValue = useMemo(() => renderItem, [list]);
    const keyExtractor = (item,index)=>index.toString()

    return (
        <View>
            {
                title?.length > 0 &&(
                <TouchableNativeFeedback onPress={onClick} style={{width:width}} background={TouchableNativeFeedback.Ripple(colors.border.a1,false)}>
                    <View style={{width:width, height:50, flexDirection:'row', alignItems:'center', justifyContent:'space-between', paddingHorizontal:15 }}>
                        <Text style={{fontFamily:Font.medium, color:colors.text.a1, fontSize:14}}>{title}</Text>
                        <View style={{flexDirection:"row", alignItems:"center", gap:10}}>
                            <Text style={{fontSize:14, color:colors.text.a4, fontFamily:Font.medium}}>{arrowText || "بیشتر"}</Text>
                            <Icon name={'angle-left'} type={'FontAwesome'} style={{color:colors.text.a4, fontSize:25}}/>
                        </View>
                    </View>
                </TouchableNativeFeedback>)
            }
            <FlatList
                keyExtractor={keyExtractor}
                showsHorizontalScrollIndicator={false}
                data={list}
                contentContainerStyle={{alignItems:'flex-start', paddingHorizontal:10, gap:5}}
                horizontal={true}
                renderItem={memoizedValue}
                onEndReachedThreshold={0.5}
                removeClippedSubviews={Platform.OS == 'ios' ? false : true}
            />
        </View>
    );
};
export default memo(CollectionPackageList)