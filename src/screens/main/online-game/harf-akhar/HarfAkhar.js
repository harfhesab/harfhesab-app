import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Platform, StyleSheet, View, Dimensions, FlatList, Text, StatusBar, InteractionManager } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import axios from 'axios';
import ScreenLoading from '../../../../components/screen-loading/ScreenLoading';
import Border from '../../../../components/Border';
import GeneralHeader from '../../../../components/header/GeneralHeader';
import useAppTheme from '../../../../hooks/theme/useAppTheme';
import FooterLoading from '../../../../components/screen-loading/FooterLoading';
import Font from '../../../../utils/Font';
import HarfAkharChallenge from '../../../../components/card/online-game/HarfAkharChallenge';
import { IS_TABLET_CONDITION, STATUS_BAR_HEIGHT } from '../../../../utils/constants/constants';
import GalaxyTwinkle from '../../../../components/particles/GalaxyTwinkle';
import { useImmersiveMode } from '../../../../hooks/useImmersiveMode';
import { WaveIndicator } from 'react-native-indicators';
import { removeExpiredHarfAkharChallenges } from '../../../../realm/repositories/harf-akhar/harf-akhar-challenge.repository';
import { useRealm } from '../../../../realm';

const { width } = Dimensions.get('screen');

const NUM_COLUMNS = IS_TABLET_CONDITION ? 3 : 2;
const itemWidth = IS_TABLET_CONDITION?(width - 80)/3:(width - 60)/2
const ITEM_HEIGHT = itemWidth * 1.25;
const ROW_GAP = 20;
const ROW_HEIGHT = ITEM_HEIGHT + ROW_GAP;
const TOP_PADDING = STATUS_BAR_HEIGHT + 70;

const getItemLayout = (_, index) => {
    const rowIndex = Math.floor(index / NUM_COLUMNS);

    return {
        length: ROW_HEIGHT,
        offset: TOP_PADDING + rowIndex * ROW_HEIGHT,
        index,
    };
};

const GET_ITEMS_QUERY = `
  query paginateHarfAkharChallenges($page : Int){
    paginateHarfAkharChallenges(page : $page) {
      list {
        _id,
        title,
        entry_fee_coins,
        subscription_required,
        reward_coins,
        reward_subscription,
        is_active
      },
      hasNextPage,
      nextPage
    }
  }
`;

function HarfAkhar(props) {
    useImmersiveMode()
    const realm = useRealm()
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
        removeExpired()
    }, []);

    const removeExpired = ()=>{
        InteractionManager.runAfterInteractions(()=>{
            removeExpiredHarfAkharChallenges(realm)
        })
    }

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
            
            const receivedData = response.data?.data?.paginateHarfAkharChallenges;
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
        <HarfAkharChallenge
            _id={item?._id}
            title={item?.title}
            entry_fee_coins={item?.entry_fee_coins}
            subscription_required={item?.subscription_required}
            reward_coins={item?.reward_coins}
            reward_subscription={item?.reward_subscription}
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
                LoadingComponent={()=>{
                    return(
                        <WaveIndicator
                            color={`#FFFFFF`}
                            size={width/2}
                            count={1}
                            waveMode="fill"
                        />
                    )
                }}
            />
        </View>
    ), [loading, getError, noItem, tryAgain]);

    return (
        <SafeAreaView style={{flex:1, backgroundColor:"#120426"}}>
            <StatusBar translucent={true} hidden={true} />
            <GalaxyTwinkle >
                <View style={{flex:1 }}> 
                    <View style={styles.container}>
                        <FlatList
                            style={{flex:1, width:"100%"}}
                            contentContainerStyle={[
                                { paddingBottom:70, paddingTop:STATUS_BAR_HEIGHT+70,  rowGap:20},
                                data.length === 0 && {flex: 1}
                            ]}
                            columnWrapperStyle={{ justifyContent:'space-between', gap:20, paddingHorizontal:20}}
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
                            getItemLayout={getItemLayout}
                        />
                    </View>
                </View>
            </GalaxyTwinkle>
            <View style={{position:'absolute', paddingTop:STATUS_BAR_HEIGHT, backgroundColor:'#12042670'}}>
                <GeneralHeader
                    backgroundColor={'transparent'}
                    home={"BottomTab"}
                    coin={true}
                    subscription={true}
                    shadowColor={'transparent'}
                    borderBottomColor={'transparent'}
                    borderBottomWidth={0}
                    height={60}
                />
            </View>
        </SafeAreaView>
    );
}
  
const styles = StyleSheet.create({
    container: { flex: 1, alignItems:'center' },
    centerFlex: { flex: 1, alignItems: 'center', justifyContent: 'center' },
    title: {
        fontSize: 14,
        fontFamily: Font.bakh_semi_bold,
        marginStart: 10,
        maxWidth: width - 100
    }
});

export default HarfAkhar;