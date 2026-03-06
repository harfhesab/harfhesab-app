import React, { useState, useEffect} from 'react';
import {  StyleSheet, View, Dimensions, Text, FlatList, TouchableNativeFeedback } from 'react-native';
import axios from 'axios';
import {useTheme} from '@react-navigation/native';
import ScreenLoading from '../../../components/screen-loading/ScreenLoading';
import Font from '../../../utils/Font';
import Icon from '../../../utils/Icon';
import Border from '../../../components/Border';
import CommentRating from '../../../components/rating/CommentRating';
import RatingInfo from '../../../components/rating/RatingInfo';
import GeneralHeader from '../../../components/header/GeneralHeader';
import useAppTheme from '../../../hooks/theme/useAppTheme';
import FooterLoading from '../../../components/screen-loading/FooterLoading';

  
const {width} = Dimensions.get('window');
function ViewAllPackageRating(props) {
    const colors = useAppTheme()
    const [data, setData] = useState([])
    const [page, setPage] = useState(1)
    const [loading, setLoading] = useState(true)
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
                query paginatePackageGameRating($package : ID!, $page : Int){
                    paginatePackageGameRating(package : $package, page : $page) {
                    list{
                        _id,
                        user{name},
                        grade,
                        comment,
                        like,
                        dis_like,
                        me_set_like,
                        me_set_dis_like,
                        createdAt,
                    },
                    hasNextPage,
                    nextPage
                }
            }`,
                variables : {
                    "package": props.route.params?._id,
                    "page" : 1,
                }
            }
        }).then(async(response)=>{
            const riciveData = response.data.data?.paginatePackageGameRating;
            if(riciveData.hasNextPage == true){
                setLoading(false)
                setData(riciveData.list)
                setPage(riciveData.nextPage)
                setFooterLoading(true)
            } else {
                if(riciveData.list.length > 0){
                    setFooterLoading(false)
                    setLoading(false)
                    setData(riciveData.list)
                    setPage(1)
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
                    query paginatePackageGameRating($package : ID!, $page : Int){
                        paginatePackageGameRating(package : $package, page : $page) {
                        list{
                            _id,
                            user{name},
                            grade,
                            comment,
                            like,
                            dis_like,
                            me_set_like,
                            me_set_dis_like,
                            createdAt,
                        },
                        hasNextPage,
                        nextPage
                    }
                }`,
                variables : {
                    "package": props.route.params?._id,
                    "page" : page,
                }
            }
        }).then(async(response)=>{
            const riciveData = response.data.data?.paginatePackageGameRating;
            if(riciveData.hasNextPage == true){
                setData([...data, ...riciveData.list])
                setPage(riciveData.nextPage)
                setFooterLoading(true)
            } else {
                if(riciveData.list.length > 0){
                    setFooterLoading(false)
                    setData([...data, ...riciveData.list])
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
    const renderItem = ({item})=>(
        <CommentRating
            _id={item?._id}
            name={item?.user?.name}
            grade={item?.grade}
            date={item?.createdAt}
            comment={item?.comment}
            likeNumbers={item?.like}
            disLikeNumbers={item?.dis_like}
            likedIt={item?.me_set_like}
            disLikedIt={item?.me_set_dis_like}
        />
    )
    const flatListHeaderComponent = ()=>{
        return(
            <View style={{marginTop:15}}>
                <RatingInfo
                    rating_average={props.route.params?.rating_average}
                    rating_info={props.route.params?.rating_info}
                    reviews={props.route.params?.rating_number}
                />
                <Border
                    height={2}
                    horizontal={0}
                    top={15}
                    bottom={0}
                />
            </View>
        )
    }
    const flatListItemSeprator = ()=>{
        return(
            <Border
              height={0.5}
              horizontal={15}
              top={0}
              bottom={0}
            />
        )
    }
    const ListEmptyComponent = ()=>(
        <View style={{flex:1, alignItems:'center', justifyContent:'center'}}>
            <ScreenLoading
                loading={loading}
                getError={getError}
                noItem={noItem}
                tryAgain={tryAgain}
            />
        </View>
    )
    const keyExtractor = (item,index)=>index.toString()
    return (
        <View style={[styles.container, {backgroundColor:colors.background.a1}]}> 
            <GeneralHeader
                back={true}
                title={props.route.params?.title}
                coin={true}
            />
            <FlatList
                style={{flex:1}}
                showsVerticalScrollIndicator={true}
                data={data}
                ListHeaderComponent={flatListHeaderComponent}
                ItemSeparatorComponent={flatListItemSeprator}
                keyExtractor={keyExtractor}
                renderItem={renderItem}
                ListFooterComponent={renderFooter}
                onEndReached={fetchMoreData}
                onEndReachedThreshold={0.5}
                initialNumToRender={20}
            />
        </View>
    );
};
  
const styles = StyleSheet.create({
    container: {
      flex: 1
    },
    title: {
        fontSize:14,
        fontFamily:Font.medium,
        marginStart:10,
        maxWidth:width - 100
    }
});
export default ViewAllPackageRating