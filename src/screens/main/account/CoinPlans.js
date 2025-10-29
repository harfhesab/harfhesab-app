import React, {useMemo, useState, useEffect, useRef} from 'react';
import {StyleSheet, View, Text, Dimensions, TouchableOpacity, SafeAreaView, FlatList, ImageBackground, NativeModules} from 'react-native';
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
import SimpleBorderText from '../../../components/text-components/SimpleBorderText';

const { ImmersiveMode } = NativeModules;
const { width, height } = ImmersiveMode.isImmersiveModeActive()? Dimensions.get('screen'): Dimensions.get('window');
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
                coin={true}
            />
            <View style={styles.container}>
                <ImageBackground
                    source={require("../../../assets/image/frame_list.png")}
                    style={{ width: width - 20, height: height-115, paddingTop:"3.2%", paddingBottom:"4.1%"}}
                    imageStyle={{ resizeMode: "stretch" }}
                    resizeMode="stretch"
                >
                    <View style={{width:"100%", height:"100%", borderRadius:69, overflow:'hidden'}}>
                    <FlatList
                        showsVerticalScrollIndicator={false}
                        keyExtractor={keyExtractor}
                        renderItem={memoizedValue}
                        numColumns={numColumns}
                        data={data}
                        onEndReachedThreshold={0.5}
                        removeClippedSubviews={Platform.OS == 'ios' ? false : true}
                        columnWrapperStyle={{justifyContent:'space-between', gap:15}}
                        style={{width:"100%", paddingHorizontal:20}}
                        contentContainerStyle={{ rowGap:15, paddingTop:35, paddingBottom:50, justifyContent:'space-between'}}
                    />
                </View>
            </ImageBackground>
            <View style={{alignSelf:'center', position:'absolute', top:10}}>
                <ImageBackground
                    source={require("../../../assets/image/header_title_frame.png")}
                    style={{ width: width - 100, height: 60, alignItems:'center', justifyContent:'center', paddingBottom:15}}
                    imageStyle={{ resizeMode: "stretch" }}
                    resizeMode="stretch"
                >
                    <SimpleBorderText
                        text={"خرید سکه"}
                        width={width - 100}
                        height={20*1.6}
                        fontSize={20}
                        borderWidth={2}
                        textColor={colors.primary.a3}
                        borderColor={"#4d2719"}
                    />
                </ImageBackground>
            </View>
            </View>
        </View>
    )
}
const styles = StyleSheet.create({
    container: {
      flex: 1,
      alignItems: 'center',
      justifyContent:'flex-end',
      paddingBottom:10
    }
});
export default CoinPlans;