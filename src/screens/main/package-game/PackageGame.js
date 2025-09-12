import React, {useState, useEffect, useMemo, useCallback} from 'react';
import {StyleSheet, Platform, View, Text, Dimensions, TouchableOpacity, FlatList} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import FooterLoading from '../../../components/screen-loading/FooterLoading';
import ScreenLoading from '../../../components/screen-loading/ScreenLoading';
import CollectionPackageList from '../../../components/list-view-items/CollectionPackageList';
import BannerSwiper from '../../../components/swiper/BannerSwiper';
import GeneralHeader from '../../../components/header/GeneralHeader';
import useAppTheme from '../../../hooks/theme/useAppTheme';
import axios from 'axios';

const {width, height} = Dimensions.get("window")
function PackageGame(props){
    const colors = useAppTheme()
    const [collection, setCollection] = useState([])
    const [page, setPage] = useState(1)
    const [loading, setLoading] = useState(true)
    const [refreshing, setRefreshing] = useState(false)
    const [getError, setGetError] = useState(false)
    const [noItem, setNoItem] = useState(false)
    const [footerTry, setFooterTry] = useState(false)
    const [footerLoading, setFooterLoading] = useState(false)

    useEffect(()=>{
        getDataForFirst()
    }, [])
    const getDataForFirst = async()=>{
        await axios({
            url:'/',
            method:'post',
            data: {
                query : `
                    query paginatePackageGameCollection(
                        $page : Int,
                        $limit : Int,
                    ){
                        paginatePackageGameCollection(
                            page : $page,
                            limit : $limit,
                        ) {
                            banner{
                                path,
                                file_type,
                                duration,
                                click_type,
                                link,
                                navigate,
                                params_id,
                                params_other,
                                order,
                                page,
                                is_visible,
                                is_active,
                            },
                            collection{
                                _id,
                                title,
                                list{_id, title, icon_image},
                                is_visible,
                                is_active,
                            },
                            hasNextPage,
                            nextPage
                        }
                    }
                `,
                variables : {
                    "page" : 1,
                    "limit" : 10,
                }
            }
        }).then(async(response)=>{
            const dataReceived = response.data.data?.paginatePackageGameCollection
            console.log(response)
            const newData = dataReceived?.banner?.length>0?[{banner:true, list:dataReceived?.banner}, ...dataReceived.collection]:dataReceived.collection
            if(dataReceived.hasNextPage == true){
                setLoading(false)
                setCollection(newData)
                setPage(dataReceived.nextPage)
                setFooterLoading(true)
            } else {
                if(dataReceived.collection.length > 0){
                    setFooterLoading(false)
                    setLoading(false)
                    setCollection(newData)
                    setPage(1)
                } else {
                    setFooterLoading(false)
                    setLoading(true)
                    setCollection([])
                    setNoItem(true)
                }
            }
            setRefreshing(false)
        }).catch((e)=>{
            setFooterLoading(false)
            setLoading(true)
            setFooterTry(false)
            setGetError(true)
            setCollection([])
            setRefreshing(false)
        })
    }
    const getDataForMore = async()=>{
        await axios({
            url:'/',
            method:'post',
            data: {
                query : `
                    query paginatePackageGameCollection(
                        $page : Int,
                        $limit : Int,
                    ){
                        paginatePackageGameCollection(
                            page : $page,
                            limit : $limit,
                        ) {
                            banner{
                                path,
                                file_type,
                                duration,
                                click_type,
                                link,
                                navigate,
                                params_id,
                                params_other,
                                order,
                                page,
                                is_visible,
                                is_active,
                            },
                            collection{
                                _id,
                                title,
                                list{_id, title, icon_image},
                                is_visible,
                                is_active,
                            },
                            hasNextPage,
                            nextPage
                        }
                    }
                `,
                variables : {
                    "page" : page,
                    "limit" : 10,
                }
            }
        }).then(async(response)=>{
            const dataReceived = response.data.data?.paginatePackageGameCollection
            const newData = dataReceived?.banner?.length>0?[{banner:true, list:dataReceived?.banner}, ...dataReceived.collection]:dataReceived.collection
            if(dataReceived.hasNextPage == true){
                setCollection([...collection, ...newData])
                setPage(dataReceived.nextPage)
                setFooterLoading(true)
            } else {
                if(dataReceived.collection.length > 0){
                    setFooterLoading(false)
                    setCollection([...collection, ...newData])
                    setPage(page)
                } else {
                    setFooterLoading(false)
                    setNoItem(collection.length > 0?false:true)
                    setLoading(collection.length > 0?false:true)
                }
            }
        }).catch(()=>{
            setLoading(collection.length > 0?false:true)
            setFooterTry(collection.length > 0?true:false)
            setGetError(collection.length > 0?false:true)
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
    const onRefresh = ()=>{
        setRefreshing(true)
        getDataForFirst()
    }
    const renderFooter = ()=>{
        if(loading == false && collection.length > 0){
            return(
                <FooterLoading
                    loading={footerLoading}
                    tryAgain={footerTry}
                    tryOperation={footertryAgain}
                />
            )
        }
    }
    const renderItem = useCallback(({item})=>(
        item?.banner == true?
        <View style={{width:width, alignItems:'center'}}>
            <BannerSwiper
                items={item.list}
            />
        </View>
        :
        <CollectionPackageList
            _id={item?._id}
            title={item?.title}
            list={item?.list}
        />
    ), [])
    const memoizedValue = useMemo(() => renderItem, [collection]);
    const keyExtractor = (item,index)=>index.toString()
    const ListEmptyComponent = ()=>{
        return(
            <View style={{flex:1, alignItems:'center', justifyContent:'center'}}>
                <ScreenLoading
                    loading={loading}
                    getError={getError}
                    noItem={noItem}
                    tryAgain={tryAgain}
                />
            </View>
        )
    }
    return(
         <View style={{flex:1}}>
            <GeneralHeader
                title={"بسته‌های بازی"}
                height={60}
                coin={true}
            />
            <LinearGradient colors={colors.background_gradient} style={{flex:1}}>
                <View style={styles.container}>
                    <FlatList
                        style={{flex:1}}
                        contentContainerStyle={{width:width, flex:1}}
                        showsVerticalScrollIndicator={true}
                        data={collection}
                        keyExtractor={keyExtractor}
                        renderItem={memoizedValue}
                        ListFooterComponent={renderFooter}
                        onEndReached={fetchMoreData}
                        onEndReachedThreshold={0.5}
                        initialNumToRender={20}
                        removeClippedSubviews={Platform.OS == 'ios' ? false : true}
                        ListEmptyComponent={ListEmptyComponent}
                    /> 
                </View>
            </LinearGradient> 
        </View>
    )
}
const styles = StyleSheet.create({
    container: {
      flex: 1,
      alignItems: 'center',
    },
});
export default PackageGame;