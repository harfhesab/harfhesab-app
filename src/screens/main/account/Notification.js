import React, { useState, useEffect, useMemo } from 'react';
import {StyleSheet, View, Dimensions, ScrollView, ImageBackground, NativeModules, FlatList} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import useAppTheme from '../../../hooks/theme/useAppTheme';
import GeneralHeader from '../../../components/header/GeneralHeader';
import { STATUS_BAR_HEIGHT } from '../../../utils/constants/constants';
import ScreenLoading from '../../../components/screen-loading/ScreenLoading';
import axios from 'axios';
import FooterLoading from '../../../components/screen-loading/FooterLoading';
import NotificationCard from '../../../components/card/notification/NotificationCard';
import { changeNewNotifications } from '../../../redux/slices/accountSlice';

const { ImmersiveMode } = NativeModules;
function Notification(props){
    const dispatch = useDispatch();
    const { width, height } = ImmersiveMode.isImmersiveModeActive()? Dimensions.get('screen'): Dimensions.get('window');
    const [loading, setLoading] = useState(true)
    const [getError, setGetError] = useState(false)
    const [noItem, setNoItem] = useState(false)
    const [data, setData] = useState([])
    const [page, setPage] = useState(1)
    const [footerTry, setFooterTry] = useState(false)
    const [footerLoading, setFooterLoading] = useState(false)
    const colors = useAppTheme()

    useEffect(()=>{
        getDataForFirst()
    }, [])
    const getDataForFirst = async()=>{
        await axios({
            url:'/',
            method:'post',
            data: {
                query : `
                    query paginateAllNotificationForUser($page : Int){
                        paginateAllNotificationForUser(page : $page) {
                        publicList{
                            _id,
                            title,
                            body,
                            link,
                            package{_id, title, icon_image},
                            free_coin_plan{_id, title, icon_image, number_coin},
                            free_subscription_plan{_id, title, icon_image, duration},
                            createdAt,
                        },
                        privateList{
                            _id,
                            title,
                            body,
                            link,
                            package{_id, title, icon_image},
                            free_coin_plan{_id, title, icon_image, number_coin},
                            free_subscription_plan{_id, title, icon_image, duration},
                            createdAt,
                        },
                        hasNextPage,
                        nextPage
                    }
                }`,
                variables : {
                    "page" : 1,
                }
            }
        }).then(async(response)=>{
            const riciveData = response.data.data?.paginateAllNotificationForUser;
            const mergedItems = [...riciveData.publicList, ...riciveData.privateList].sort(function(a, b){return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()})
            if(riciveData.hasNextPage == true){
                setLoading(false)
                setData(mergedItems)
                setPage(riciveData.nextPage)
                setFooterLoading(true)
                const number = 1
                seenNotification(number)
            } else {
                if(mergedItems.length > 0){
                    setFooterLoading(false)
                    setLoading(false)
                    setData(mergedItems)
                    setPage(1)
                    const number = 1
                    seenNotification(number)
                } else {
                    setFooterLoading(false)
                    setLoading(true)
                    setData([])
                    setNoItem(true)
                }
            }
        }).catch(()=>{
            setFooterLoading(false)
            setLoading(true)
            setFooterTry(false)
            setGetError(true)
            setData([])
        })
    }
    const getDataForMore = async()=>{
        await axios({
            url:'/',
            method:'post',
            data: {
                    query : `
                    query paginateAllNotificationForUser($page : Int){
                        paginateAllNotificationForUser(page : $page) {
                        publicList{
                            _id,
                            title,
                            body,
                            link,
                            package{_id, title, icon_image},
                            free_coin_plan{_id, title, icon_image, number_coin},
                            free_subscription_plan{_id, title, icon_image, duration},
                            createdAt,
                        },
                        privateList{
                            _id,
                            title,
                            body,
                            link,
                            package{_id, title, icon_image},
                            free_coin_plan{_id, title, icon_image, number_coin},
                            free_subscription_plan{_id, title, icon_image, duration},
                            createdAt,
                        },
                        hasNextPage,
                        nextPage
                    }
                }`,
                variables : {
                    "page" : page,
                }
            }
        }).then(async(response)=>{
            const riciveData = response.data.data?.paginateAllNotificationForUser;
            const mergedItems = [...riciveData.publicList, ...riciveData.privateList].sort(function(a, b){return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()})
            if(riciveData.hasNextPage == true){
                setData([...data, ...mergedItems])
                setPage(riciveData.nextPage)
                setFooterLoading(true)
            } else {
                if(mergedItems.length > 0){
                    setFooterLoading(false)
                    setData([...data, ...mergedItems])
                    setPage(page)
                } else {
                    setFooterLoading(false)
                    setNoItem(data.length > 0?false:true)
                    setLoading(data.length > 0?false:true)
                }
            }
        }).catch(()=>{
            setLoading(data.length > 0?false:true)
            setFooterTry(data.length > 0?true:false)
            setGetError(data.length > 0?false:true)
        })
    }
    const seenNotification = async(tryNumber)=>{
        let data = {
            query : `
                mutation seenNotificationByUser($_id : ID){
                    seenNotificationByUser(_id : $_id) {
                        status,
                        message
                    }
                }
              `,
            variables : {
                "_id" : null,
            }
        }
        await axios({
            url:'/',
            method:'post',
            data: data,
        }).then(async(response)=>{
            if(response.data?.data?.seenNotificationByUser?.status == 200){
                dispatch(changeNewNotifications({number:0}))
            } else {
                if(tryNumber < 6){
                    const number = tryNumber + 1
                    seenNotification(number)
                }
            }
        }).catch(()=>{
            if(tryNumber < 6){
                const number = tryNumber + 1
                seenNotification(number)
            }
        })
    }
    const tryAgain = async()=>{
        setFooterLoading(false)
        setLoading(true)
        setGetError(false)
        setNoItem(false)
        setPage(1)
        setFooterTry(false)
        getDataForFirst()
    }
    const footertryAgain = async()=>{
        setFooterLoading(true)
        setFooterTry(false)
        getDataForMore()
    }
    const fetchMoreData = ()=>{
        if(footerLoading == true && loading == false){
            getDataForMore()
        }
    }

    const renderFooter = ()=>{
        if(loading == false && data.length > 0){
            return(
                <FooterLoading
                    loading={footerLoading}
                    tryAgain={footerTry}
                    tryOperation={footertryAgain}
                />
            )
        }
    }

    const renderItem = ({item, index})=>{
        return(
            <NotificationCard
                _id={item._id}
                title={item.title}
                body={item.body}
                link={item.link}
                packageInfo={item.package}
                freeCoinPlan={item?.free_coin_plan}
                freeSubscriptionPlan={item?.free_subscription_plan}
                createdAt={item.createdAt}
            />
        )
    }
    const memoizedValue = useMemo(() => renderItem, [data]);
    const keyExtractor = (item,index)=>index.toString()
    const ListEmptyComponent = ()=>(
        <View style={{width: "100%", height:ImmersiveMode.isImmersiveModeActive()?(height-(80 + STATUS_BAR_HEIGHT))*0.8:(height-80)*0.8, alignItems:'center', justifyContent:'center'}}>
            <ScreenLoading
                loading={loading}
                getError={getError}
                noItem={noItem}
                tryAgain={tryAgain}
            />
        </View>
    )
    return(
        <View style={{flex:1, backgroundColor:colors.background.a2, paddingTop:ImmersiveMode.isImmersiveModeActive()?STATUS_BAR_HEIGHT:0}}>
            <GeneralHeader
                coin={true}
                back={true}
                title={"اعلانات"}
            />
            <View style={{flex:1, alignItems:'center', justifyContent:'center', backgroundColor:colors.background.a1}}>
                

                <ImageBackground
                    source={require("../../../assets/image/menu_frame_full.png")}
                    style={{ width: width - 20, height:ImmersiveMode.isImmersiveModeActive()?height-(80 + STATUS_BAR_HEIGHT):height-80, paddingVertical:"3.8%"}}
                    imageStyle={{ resizeMode: "stretch" }}
                    resizeMode="stretch"
                >
                    <View style={{borderRadius:"9%", overflow:'hidden', width:width-40, height:"100%", alignItems:'center', alignSelf:'center'}}>
                        <FlatList
                            showsVerticalScrollIndicator={false}
                            keyExtractor={keyExtractor}
                            contentContainerStyle={{alignItems:'center', paddingTop:15, paddingBottom:15, gap:15}}
                            renderItem={memoizedValue}
                            data={data}
                            onEndReachedThreshold={0.5}
                            removeClippedSubviews={Platform.OS == 'ios' ? false : true}
                            ListEmptyComponent={ListEmptyComponent}
                        />
                    </View>
                </ImageBackground>
            </View>
        </View>
    )
}
const styles = StyleSheet.create({
    container: {
      flex: 1,
      alignItems: 'center',
    },
});

export default Notification;