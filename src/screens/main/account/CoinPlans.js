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
import CoinPlanItem from '../../../components/card/general/CoinPlanItem';
import { getAllCoinPlansList } from '../../../realm/repositories/user/coin-plan-repository';
import { IS_TABLET_CONDITION } from '../../../utils/constants/constants';
import Globals from '../../../utils/Globals';

const {width, height} = Dimensions.get("window")
const numColumns = IS_TABLET_CONDITION ? 4 : 2

function CoinPlans(props){
    const realm = useRealm();
    const isFocused = useIsFocused();
    const colors = useAppTheme()
    const state = useSelector((state) => state.stageGameDownload);
    const dispatch = useDispatch();
    const data = getAllCoinPlansList(realm)

    const clickItem = (item)=>{
        if(Globals.install_source == "direct") {
            directPaymentGateway()
        } else if(Globals.install_source == "googleplay") {
            directPaymentGateway()
        } else if(Globals.install_source == "cafebazaar") {
            cafebazaarPaymentGateway()
        } else if(Globals.install_source == "myket") {
            mayketPaymentGateway()
        }
    }
    
    const directPaymentGateway = ()=>{

    }

    const cafebazaarPaymentGateway = ()=>{

    }

    const mayketPaymentGateway = ()=>{
        
    }

    const renderItem = ({item, index})=>{
        return(
            <CoinPlanItem
                _id={item._id}
                click={()=>clickItem(item)}
                productId={item.product_id}
                title={item.title}
                badg={item.badg}
                image={item.icon_image}
                numberCoin={item.number_coin}
                price={item.price}
                active={item.active}
            />
        )
    }
    const memoizedValue = useMemo(() => renderItem, [data]);
    const keyExtractor = (item,index)=>index.toString()
    

    
    const ListEmptyComponent = ()=>{
        <View style={{flex:1, alignItems:'center', justifyContent:'center'}}>
            <ScreenLoading
                loading={false}
                getError={false}
                noItem={true}
                tryAgain={()=>{}}
            />
        </View>
    }
    return(
        <View style={{flex:1, backgroundColor:colors.background.a1}}>
            <GeneralHeader
                paddingHorizontal={15}
                back={true}
                height={60}
                title={"خرید سکه"}
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
export default CoinPlans;