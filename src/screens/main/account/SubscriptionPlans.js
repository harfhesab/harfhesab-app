import React, {useMemo, useState, useEffect, useRef} from 'react';
import {StyleSheet, View, Text, Dimensions, TouchableOpacity, SafeAreaView, FlatList} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import AlertHelper from '../../../components/alert/AlertHelper';
import { useDispatch, useSelector } from "react-redux";
import { useQuery, useRealm } from '../../../realm';
import useAppTheme from '../../../hooks/theme/useAppTheme';
import Font from '../../../utils/Font';
import TextSkia from '../../../components/text-components/TextSkia';
import ScreenLoading from '../../../components/screen-loading/ScreenLoading';
import GeneralHeader from '../../../components/header/GeneralHeader';
import Icon from '../../../utils/Icon';
import { BSON } from 'realm';
import { useIsFocused } from '@react-navigation/native';
import UserPackageItem from '../../../components/card/package-game-card/UserPackageItem';
import { UserPackage } from '../../../realm/schemas/user/UserPackageSchema';
import { Package } from '../../../realm/schemas/package-game/PackageSchema';
import { IS_TABLET_CONDITION } from '../../../utils/constants/constants';
import SubscriptionPlanItem from '../../../components/card/general/SubscriptionPlanItem';
import { getAllSubscriptionPlansList } from '../../../realm/repositories/user/subscription-plan-repository';

const {width, height} = Dimensions.get("window")
const numColumns = IS_TABLET_CONDITION ? 4 : 2

function SubscriptionPlans(props){
    const realm = useRealm();
    const isFocused = useIsFocused();
    const colors = useAppTheme()
    const state = useSelector((state) => state.stageGameDownload);
    const dispatch = useDispatch();
    const data = getAllSubscriptionPlansList(realm)

    const renderItem = ({item, index})=>{
        return(
            <SubscriptionPlanItem
                _id={item._id}
                productId={item.product_id}
                title={item.title}
                badg={item.badg}
                image={item.icon_image}
                duration={item.duration}
                price={item.price}
                active={item.active}
            />
        )
    }
    const memoizedValue = useMemo(() => renderItem, [data]);
    const keyExtractor = (item,index)=>index.toString()
    

    
    const ListEmptyComponent = ()=>(
        <View style={{flex:1, alignItems:'center', justifyContent:'center'}}>
            <ScreenLoading
                loading={false}
                getError={false}
                noItem={true}
                tryAgain={()=>{}}
            />
        </View>
    )
    return(
        <View style={{flex:1, backgroundColor:colors.background.a1}}>
            <GeneralHeader
                paddingHorizontal={10}
                back={true}
                height={60}
                title={"خرید اشتراک"}
            />
            <View style={styles.container}>
                <FlatList
                    showsVerticalScrollIndicator={false}
                    keyExtractor={keyExtractor}
                    renderItem={memoizedValue}
                    numColumns={numColumns}
                    data={data}
                    onEndReachedThreshold={0.5}
                    removeClippedSubviews={Platform.OS == 'ios' ? false : true}
                    columnWrapperStyle={{justifyContent:'space-between', gap:15}}
                    style={{width:width, paddingHorizontal:15}}
                    contentContainerStyle={{ rowGap:15, paddingTop:15, paddingBottom:50, justifyContent:'space-between'}}
                />
            </View>
        </View>
    )
}
const styles = StyleSheet.create({
    container: {
      flex: 1,
      alignItems: 'center',
    }
});
export default SubscriptionPlans;