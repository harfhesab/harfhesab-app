import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Platform, StyleSheet, View, Dimensions, FlatList, Text, SafeAreaView } from 'react-native';
import axios from 'axios';
import ScreenLoading from '../../../../components/screen-loading/ScreenLoading';
import Border from '../../../../components/Border';
import GeneralHeader from '../../../../components/header/GeneralHeader';
import useAppTheme from '../../../../hooks/theme/useAppTheme';
import FooterLoading from '../../../../components/screen-loading/FooterLoading';
import Font from '../../../../utils/Font';
import KalamAkharChallenge from '../../../../components/card/online-game/KalamAkharChallenge';
import { IS_TABLET_CONDITION } from '../../../../utils/constants/constants';
import GalaxyTwinkle from '../../../../components/particles/GalaxyTwinkle';

const { width } = Dimensions.get('window');

const GET_ITEMS_QUERY = `
  query paginateKalamAkharChallenges($page : Int){
    paginateKalamAkharChallenges(page : $page) {
      list {
        _id,
        title,
        time_limit,
        entry_fee_coins,
        subscription_required,
        reward_coins,
        reward_subscription,
        end_date,
        is_active
      },
      server_now,
      hasNextPage,
      nextPage
    }
  }
`;

const calculateTimeRemaining = (endDate, serverNow) => {
    const diff = new Date(endDate).getTime() - new Date(serverNow).getTime();
    if (diff <= 0 || isNaN(diff)) {
        return { days: 0, hours: 0, minutes: 0, seconds: 0 };
    }
    return {
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((diff / 1000 / 60) % 60),
        seconds: Math.floor((diff / 1000) % 60)
    };
};

function KalamAkhar(props) {
    const colors = useAppTheme();
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
                query: GET_ITEMS_QUERY,
                variables: { page: targetPage }
            });

            if (response.data?.errors) throw new Error("GraphQL Error");
            
            const receivedData = response.data?.data?.paginateKalamAkharChallenges;
            if (!receivedData || !Array.isArray(receivedData.list)) throw new Error("Invalid data");
            
            const serverNow = receivedData.server_now;
            const processedList = receivedData.list.map(item => {
                if (item.end_date) {
                    return {
                        ...item,
                        timer: calculateTimeRemaining(item.end_date, serverNow)
                    };
                }
                return item;
            });
            if (isFirstLoad) {
                if (processedList.length === 0) {
                    setNoItem(true);
                    setData([]);
                } else {
                    setData(processedList);
                }
            } else {
                setData(prevData => [...prevData, ...processedList]);
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
        <KalamAkharChallenge
            _id={item?._id}
            title={item?.title}
            time_limit={item?.time_limit}
            entry_fee_coins={item?.entry_fee_coins}
            subscription_required={item?.subscription_required}
            reward_coins={item?.reward_coins}
            reward_subscription={item?.reward_subscription}
            timer={item?.timer}
            is_active={item?.is_active}
        />
    ), []);

    const keyExtractor = useCallback((item, index) => index.toString(), []);

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
        <SafeAreaView style={{flex:1, backgroundColor:"#120426"}}>
            <GalaxyTwinkle >
                <View style={{flex:1 }}> 
                    <View style={styles.container}>
                        <FlatList
                            style={{flex:1, width:"100%", paddingHorizontal:20}}
                            contentContainerStyle={[
                                { paddingBottom:70, paddingTop:10,  rowGap:20},
                                data.length === 0 && {flex: 1}
                            ]}
                            columnWrapperStyle={{ justifyContent:'space-between', gap:20}}
                            numColumns={IS_TABLET_CONDITION?3:2}
                            showsVerticalScrollIndicator={false}
                            data={data}
                            keyExtractor={keyExtractor}
                            renderItem={renderItem}
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
                </View>
            </GalaxyTwinkle>
        </SafeAreaView>
    );
}
  
const styles = StyleSheet.create({
    container: { flex: 1, alignItems:'center' },
    centerFlex: { flex: 1, alignItems: 'center', justifyContent: 'center' },
    title: {
        fontSize: 14,
        fontFamily: Font.medium,
        marginStart: 10,
        maxWidth: width - 100
    }
});

export default KalamAkhar;