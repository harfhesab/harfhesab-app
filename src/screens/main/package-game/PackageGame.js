import React, {useState, useEffect, useMemo} from 'react';
import {StyleSheet, Platform, View, Text, Dimensions, TouchableOpacity, FlatList} from 'react-native';
import {useTheme} from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import FooterLoading from '../../../components/screen-loading/FooterLoading';
import ScreenLoading from '../../../components/screen-loading/ScreenLoading';
import CollectionPackageList from '../../../components/list-view-items/CollectionPackageList';
import BannerSwiper from '../../../components/BannerSwiper';

const {width, height} = Dimensions.get("window")
function PackageGame(props){
    const {colors} = useTheme().colors;
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
                    query paginatePackageGameCollectionAndOther(
                        $page : Int,
                        $limit : Int,
                    ){
                        paginatePackageGameCollectionAndOther(
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
            const dataReceived = response.data.data?.paginatePackageGameCollectionAndOther
            const newData = dataReceived?.banner?.length>0?dataReceived.collection.unshift({banner:true, list:dataReceived?.banner}):dataReceived.collection
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
        }).catch(()=>{
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
                    query paginatePackageGameCollectionAndOther(
                        $page : Int,
                        $limit : Int,
                    ){
                        paginatePackageGameCollectionAndOther(
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
            const dataReceived = response.data.data?.paginatePackageGameCollectionAndOther
            const newData = dataReceived?.banner?.length>0?dataReceived.collection.unshift({banner:true, list:dataReceived?.banner}):dataReceived.collection
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
                banner={item}
                navigation={props.navigation}
            />
        </View>
        :
        <CollectionPackageList
            _id={item?._id}
            title={item?.title}
            list={item?.list}
        />
    ), [])
    const memoizedValue = useMemo(() => renderItem, [data]);
    const keyExtractor = (item,index)=>index.toString()
    
    return(
         <View style={[styles.container, {backgroundColor:colors.background}]}> 
            <GeneralHeader
                back={false}
                title={"بروزرسانی محتوای بازی مرحله‌ای"}
            />
            <LinearGradient colors={colors.background_gradient} style={{width:width, height:height}}>
                <View style={styles.container}>
                    {
                        loading == true?
                        <ScreenLoading
                            loading={loading}
                            getError={getError}
                            noItem={noItem}
                            tryAgain={tryAgain}
                        />
                        :
                        <FlatList
                            style={{flex:1}}
                            showsVerticalScrollIndicator={true}
                            data={collection}
                            keyExtractor={keyExtractor}
                            renderItem={memoizedValue}
                            ListFooterComponent={renderFooter}
                            onEndReached={fetchMoreData}
                            onEndReachedThreshold={0.5}
                            initialNumToRender={20}
                            removeClippedSubviews={Platform.OS == 'ios' ? false : true}
                        />
                    } 
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