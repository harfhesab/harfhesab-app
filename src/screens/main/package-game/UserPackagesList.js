import React, {useMemo, useState, useEffect, useRef} from 'react';
import {StyleSheet, View, Text, Dimensions, TouchableOpacity, SafeAreaView, FlatList, ImageBackground} from 'react-native';
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
import SimpleBorderText from '../../../components/text-components/SimpleBorderText';
import { creatingMultiplePackageAndUsePackageDocumentsInSameTime } from '../../../realm/repositories/user/user-package-game-progress.repository';
import { updateSyncUserPackage } from '../../../redux/slices/accountSlice';
import axios from 'axios';

const {width, height} = Dimensions.get("window")
function useUserPackage() {
    const isFocused = useIsFocused();
    const allUserPackage = useQuery(UserPackage);
    const allPackage = useQuery(Package);

    // داده ترکیب‌ شده
    const data = useMemo(() => {
        return allUserPackage.map(userPkg => {
            const packag = allPackage.find(p => 
                p._id.toHexString() === userPkg.package_ref.toHexString()
            );
            return {
                ...userPkg.toJSON(),
                packag,
            };
        });
    }, [allUserPackage, allPackage, isFocused]);

    return data.sort((a, b) => b.createdAt - a.createdAt).sort((a, b) => b.content_completed - a.content_completed);
}

function UserPackagesList(props){
    const isFocused = useIsFocused();
    const colors = useAppTheme()
    const state = useSelector((state) => state.stageGameDownload);
    const {syncUserPackage} = useSelector((state) => state.account);
    const { subscriptionExpiration, activeSubscription} = useSelector((state) => state.subscription);
    const dispatch = useDispatch();
    const realm = useRealm();
    const [loading, setLoading] = useState(true)
    const [noItem, setNoItem] = useState(false)
    const data = useUserPackage()

    useEffect(()=>{
        if(data.length > 0){
            setLoading(false)
            setNoItem(false)
        } else {
            setTimeout(()=>{
                setNoItem(true)
            }, 1000)
        }
    }, [data])

    useEffect(()=>{
        checkSyncData()
    }, [])

    const checkSyncData = ()=>{
        const now = Date.now()
        if(!syncUserPackage || (syncUserPackage && now - Number(syncUserPackage) > 2592000000)){
            syncData()
        }
    }

    const syncData = async()=>{
        await axios({
            url:'/',
            method:'post',
            data: {
                query : `
                    query getUserPackageGameList(
                        $_id : ID,
                    ){
                        getUserPackageGameList(
                            _id : $_id,
                        ) {
                            _id,
                            access_type,
                            number_coin_paid,
                            last_season,
                            last_season_number,
                            last_stage,
                            last_stage_number,
                            ended_game,
                            version_created,
                            version_updated,
                            version_deleted,
                            activation_date,
                            package_info{
                                _id,
                                title,
                                language_ref,
                                icon_image,
                                banner_image,
                                completion_status,
                                completion_status_title,
                                free,
                                free_with_subscription,
                                price,
                                testable,
                                number_stage,
                                number_season,
                            },
                        }
                    }
                `,
                variables : {
                    "_id" : null,
                }
            }
        }).then(async(response)=>{
            const dataList = response.data.data?.getUserPackageGameList
            const syncData = creatingMultiplePackageAndUsePackageDocumentsInSameTime(realm, dataList)
            if(syncData == true){
                dispatch(updateSyncUserPackage({sync:`${Date.now()}`}))
            }
        }).catch((e)=>{
            null
        })
    }
    const renderItem = ({item, index})=>{
        return(
            <UserPackageItem
                _id={item._id}
                activeSubscription={(activeSubscription == true && subscriptionExpiration)?true:false}
                packageId={item.packag._id}
                accessType={item.access_type}
                title={item?.packag?.title}
                image={item?.packag?.icon_image}
                price={item?.packag?.price}
                numberStage={item?.packag?.number_stage}
                numberSeason={item?.packag?.number_season}
                progress={(item?.ended_game && item?.packag?.number_stage == item?.last_stage_number)?item?.packag?.number_stage:item?.last_stage_number?item.last_stage_number-1:0}
                contentCompleted={item?.content_completed??false}
                endedGame={(item?.ended_game && item?.packag?.number_stage == item?.last_stage_number)?true:false}
            />
        )
    }
    const memoizedValue = useMemo(() => renderItem, [data]);
    const keyExtractor = (item,index)=>index.toString()
    

    
    const ListEmptyComponent = ()=>(
        <View style={{width:"100%", height:(height-115)*0.75, alignItems:'center', justifyContent:'center'}}>
            <ScreenLoading
                loading={loading}
                getError={false}
                noItem={noItem}
                tryAgain={()=>{}}
            />
        </View>
    )
    return(
        <View style={{flex:1, backgroundColor:colors.background.a1}}>
            <GeneralHeader
                back={true}
                coin={true}
                subscription={true}
            />
                <View style={styles.container}>
                    <ImageBackground
                        source={require("../../../assets/image/frame_list.png")}
                        style={{ width: width - 20, height: height-115, paddingTop:"3.2%", paddingBottom:"4.1%"}}
                        imageStyle={{ resizeMode: "stretch" }}
                        resizeMode="stretch"
                    >
                        <View style={{width:"100%", height:"100%", borderBottomLeftRadius:"16%", borderBottomRightRadius:"16%", borderTopLeftRadius:"15%", borderTopRightRadius:"15%", overflow:'hidden'}}>
                            <FlatList
                                showsVerticalScrollIndicator={false}
                                keyExtractor={keyExtractor}
                                contentContainerStyle={{alignItems:'center', paddingTop:30, paddingBottom:50, gap:50}}
                                renderItem={memoizedValue}
                                ListEmptyComponent={ListEmptyComponent}
                                data={data}
                                onEndReachedThreshold={0.5}
                                removeClippedSubviews={Platform.OS == 'ios' ? false : true}
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
                                text={"بسته های بازی من"}
                                width={width - 100}
                                height={20*1.6}
                                fontSize={20}
                                borderWidth={2}
                                textColor={colors.primary.a5}
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
export default UserPackagesList;