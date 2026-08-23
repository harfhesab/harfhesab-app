import React, {useMemo, memo} from 'react';
import {Platform, View, Text, TouchableNativeFeedback, Dimensions, FlatList} from 'react-native';
import Icon from '../../utils/Icon';
import Font from '../../utils/Font';
import FastImage from '@d11/react-native-fast-image';
import Globals from '../../utils/Globals';
import PackageCollectionItem from '../card/package-game-card/PackageCollectionItem';
import useAppTheme from '../../hooks/theme/useAppTheme';
import { IS_TABLET_CONDITION } from '../../utils/constants/constants';

const width = Dimensions.get('window').width
const ITEM_WIDTH = IS_TABLET_CONDITION?(width - 160)/6:(width - 80)/3;
const HORIZONTAL = 10;
const GAP = 5;
function CollectionPackageList({_id, title, arrowText, list}){
    const colors = useAppTheme();

    const renderItem = ({item, index})=>{
        return(
            <PackageCollectionItem
                _id={item?._id}
                image={item?.icon_image}
                title={item?.title}
                badge={item?.badge}
            />
        )
    }
    const memoizedValue = useMemo(() => renderItem, [list]);
    const keyExtractor = (item,index)=>index.toString()

    return (
        <View>
            {
                title?.length > 0 &&(
                <TouchableNativeFeedback style={{width:width}} background={TouchableNativeFeedback.Ripple(colors.border.a2,false)}>
                    <View style={{width:width, height:35, flexDirection:'row', alignItems:'center', justifyContent:'space-between', paddingHorizontal:15 }}>
                        <Text style={{fontFamily:Font.bakh_semi_bold, color:colors.text.a5, fontSize:14}}>{title}</Text>
                        <View style={{flexDirection:"row", alignItems:"center", gap:15}}>
                            <Text style={{fontSize:14, color:colors.text.a6, fontFamily:Font.bakh_semi_bold}}>{arrowText || "بیشتر"}</Text>
                            <Icon name={'angle-left'} type={'FontAwesome'} style={{color:colors.text.a6, fontSize:20}}/>
                        </View>
                    </View>
                </TouchableNativeFeedback>)
            }
            <FlatList
                keyExtractor={keyExtractor}
                showsHorizontalScrollIndicator={false}
                data={list}
                contentContainerStyle={{alignItems:'flex-start', paddingHorizontal:HORIZONTAL, gap:GAP}}
                horizontal={true}
                renderItem={memoizedValue}
                onEndReachedThreshold={0.5}
                initialNumToRender={5}
                maxToRenderPerBatch={10}
                windowSize={5}
                removeClippedSubviews={false}
                decelerationRate="fast"
                getItemLayout={(data, index) => ({
                    length: ITEM_WIDTH + GAP,
                    offset: HORIZONTAL + (ITEM_WIDTH + GAP) * index,
                    index,
                })}
            />
        </View>
    );
};
export default memo(CollectionPackageList)