import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Platform, StyleSheet, View, Dimensions, FlatList } from 'react-native';
import axios from 'axios';
import ScreenLoading from '../../../components/screen-loading/ScreenLoading';
import Border from '../../../components/Border';
import CommentRating from '../../../components/rating/CommentRating';
import RatingInfo from '../../../components/rating/RatingInfo';
import GeneralHeader from '../../../components/header/GeneralHeader';
import useAppTheme from '../../../hooks/theme/useAppTheme';
import FooterLoading from '../../../components/screen-loading/FooterLoading';
import Font from '../../../utils/Font';

const { width } = Dimensions.get('window');

const GET_COMMENTS_QUERY = `
  query paginatePackageGameRating($package : ID!, $page : Int){
    paginatePackageGameRating(package : $package, page : $page) {
      list {
        _id
        user { name }
        grade
        comment
        like
        dis_like
        me_set_like
        me_set_dis_like
        createdAt
      }
      hasNextPage
      nextPage
    }
  }
`;

function ViewAllPackageRating(props) {
    const colors = useAppTheme();
    const packageId = props.route.params?._id;
    
    const [data, setData] = useState([]);
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(true);
    const [getError, setGetError] = useState(false);
    const [noItem, setNoItem] = useState(false);
    const [footerLoading, setFooterLoading] = useState(false);
    const [footerTry, setFooterTry] = useState(false);
    const isFetching = useRef(false);

    useEffect(() => {
        fetchData(1, true);
    }, []);

    const fetchData = async (targetPage, isFirstLoad = false) => {
        if (isFetching.current) return;
        
        isFetching.current = true;
        if (isFirstLoad) {
            setLoading(true);
            setGetError(false);
            setNoItem(false);
        } else {
            setFooterTry(false);
        }

        try {
            const response = await axios.post('/', {
                query: GET_COMMENTS_QUERY,
                variables: { package: packageId, page: targetPage }
            });

            if (response.data?.errors) throw new Error("GraphQL Error");
            
            const receivedData = response.data?.data?.paginatePackageGameRating;
            if (!receivedData || !Array.isArray(receivedData.list)) throw new Error("Invalid data");
            
            if (isFirstLoad) {
                if (receivedData.list.length === 0) {
                    setNoItem(true);
                    setData([]);
                } else {
                    setData(receivedData.list);
                }
            } else {
                setData(prevData => [...prevData, ...receivedData.list]);
            }
            if (receivedData.hasNextPage) {
                setPage(receivedData.nextPage);
                setFooterLoading(true);
            } else {
                setFooterLoading(false);
            }
            
            setGetError(false);
            
        } catch (error) {
            if (isFirstLoad) {
                setGetError(true);
                setData([]);
            } else {
                setFooterTry(true);
                setFooterLoading(false);
            }
        } finally {
            setLoading(false);
            isFetching.current = false;
        }
    };

    const tryAgain = useCallback(() => {
        fetchData(1, true);
    }, []);

    const footerTryAgain = useCallback(() => {
        fetchData(page, false);
        setFooterLoading(true)
    }, [page]);

    const fetchMoreData = useCallback(() => {
        if (footerLoading === true && loading === false && !isFetching.current) {
            fetchData(page, false);
        }
    }, [footerLoading, loading, page]);

    const renderItem = useCallback(({ item }) => (
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
    ), []);

    const keyExtractor = useCallback((item, index) => index.toString(), []);

    const ListHeaderComponent = useCallback(() => (
        <View style={{ marginTop: 15 }}>
            <RatingInfo
                rating_average={props.route.params?.rating_average}
                rating_info={props.route.params?.rating_info}
                reviews={props.route.params?.rating_number}
            />
            <Border height={2} horizontal={0} top={15} bottom={0} />
        </View>
    ), [props.route.params]);

    const ItemSeparatorComponent = useCallback(() => (
        <Border height={0.5} horizontal={15} top={0} bottom={0} />
    ), []);

    const ListFooterComponent = useCallback(() => {
        if (loading === false && data.length > 0) {
            return (
                <FooterLoading
                    loading={footerLoading}
                    tryAgain={footerTry}
                    tryOperation={footerTryAgain}
                />
            );
        }
        return null;
    }, [loading, data.length, footerLoading, footerTry, footerTryAgain]);

    const ListEmptyComponent = useCallback(() => (
        <View style={styles.centerFlex}>
            <ScreenLoading
                loading={loading}
                getError={getError}
                noItem={noItem}
                tryAgain={tryAgain}
            />
        </View>
    ), [loading, getError, noItem, tryAgain]);

    return (
        <View style={[styles.container, { backgroundColor: colors.background.a1 }]}> 
            <GeneralHeader
                back={true}
                title={props.route.params?.title}
                coin={true}
            />
            <FlatList
                style={styles.container}
                showsVerticalScrollIndicator={true}
                data={data}
                keyExtractor={keyExtractor}
                renderItem={renderItem}
                ListHeaderComponent={ListHeaderComponent}
                ItemSeparatorComponent={ItemSeparatorComponent}
                ListFooterComponent={ListFooterComponent}
                ListEmptyComponent={ListEmptyComponent}
                onEndReached={fetchMoreData}
                onEndReachedThreshold={0.5}
                initialNumToRender={10} 
                maxToRenderPerBatch={10}
                windowSize={11}
                removeClippedSubviews={Platform.OS == 'ios' ? false : true}
                updateCellsBatchingPeriod={50}
            />
        </View>
    );
}
  
const styles = StyleSheet.create({
    container: { flex: 1 },
    centerFlex: { flex: 1, alignItems: 'center', justifyContent: 'center' },
    title: {
        fontSize: 14,
        fontFamily: Font.bakh_semi_bold,
        marginStart: 10,
        maxWidth: width - 100
    }
});

export default ViewAllPackageRating;