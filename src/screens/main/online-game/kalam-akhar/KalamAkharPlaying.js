import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Platform, StyleSheet, View, Dimensions, FlatList, Text, StatusBar, InteractionManager } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import axios from 'axios';
import ScreenLoading from '../../../../components/screen-loading/ScreenLoading';
import Border from '../../../../components/Border';
import GeneralHeader from '../../../../components/header/GeneralHeader';
import useAppTheme from '../../../../hooks/theme/useAppTheme';
import FooterLoading from '../../../../components/screen-loading/FooterLoading';
import Font from '../../../../utils/Font';
import KalamAkharChallengeStarted from '../../../../components/card/online-game/KalamAkharChallengeStarted';
import { IS_TABLET_CONDITION, STATUS_BAR_HEIGHT } from '../../../../utils/constants/constants';
import GalaxyTwinkle from '../../../../components/particles/GalaxyTwinkle';
import { useImmersiveMode } from '../../../../hooks/useImmersiveMode';
import { WaveIndicator } from 'react-native-indicators';
import { getAllKalamAkharChallengesPlaying, removeExpiredKalamAkharChallenges } from '../../../../realm/repositories/kalam-akhar/kalam-akhar-challenge.repository';
import { useQuery, useRealm } from '../../../../realm';
import { KalamAkharChallenge } from '../../../../realm/schemas/kalam-akhar/KalamAkharChallengeSchema';

const { width } = Dimensions.get('screen');

const NUM_COLUMNS = IS_TABLET_CONDITION ? 3 : 2;
const itemWidth = IS_TABLET_CONDITION?(width - 80)/3:(width - 60)/2
const ITEM_HEIGHT = itemWidth * 1.25;
const ROW_GAP = 20;
const ROW_HEIGHT = ITEM_HEIGHT + ROW_GAP;
const TOP_PADDING = STATUS_BAR_HEIGHT + 70;

function useChallengesStarted() {
  const all = useQuery(KalamAkharChallenge);
  return all;
}
const getItemLayout = (_, index) => {
    const rowIndex = Math.floor(index / NUM_COLUMNS);

    return {
        length: ROW_HEIGHT,
        offset: TOP_PADDING + rowIndex * ROW_HEIGHT,
        index,
    };
};

function KalamAkharPlaying(props) {
    useImmersiveMode()
    const realm = useRealm()
    const colors = useAppTheme();
    const data = useChallengesStarted();
    const [loading, setLoading] = useState(true);
    const [noItem, setNoItem] = useState(false);

    useEffect(()=>{
        removeExpired()
    }, [])

    useEffect(()=>{
        handleLoading()
    }, [data])

    const handleLoading = ()=>{
        setLoading(false)
        if(data.length > 0){
            setNoItem(false)
        } else {
            setNoItem(true)
        }
    }

    const removeExpired = ()=>{
        InteractionManager.runAfterInteractions(()=>{
            removeExpiredKalamAkharChallenges(realm)
        })
    }

    const getData = async () => {
        const data = getAllKalamAkharChallengesPlaying(realm)
        if(data?.length > 0){
            setData(data)
            setLoading(false)
            setNoItem(false)
        } else {
            setLoading(false)
            setNoItem(true)
        }
    };

    const tryAgain = useCallback(() => {
        getData();
    }, []);

    const renderItem = useCallback(({ item }) => (
        <KalamAkharChallengeStarted
            _id={item?._id}
            title={item?.title}
            entry_fee_coins={item?.entry_fee_coins}
            subscription_required={item?.subscription_required}
            reward_coins={item?.reward_coins}
            reward_subscription={item?.reward_subscription}
            expiration={item?.expiration}
        />
    ), []);

    const keyExtractor = useCallback((item, index) => index.toString(), []);

    const ListEmptyComponent = useCallback(() => (
        <View style={styles.centerFlex}>
            <ScreenLoading
                loading={loading}
                getError={false}
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
    ), [loading, noItem, tryAgain]);

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
                            ListEmptyComponent={ListEmptyComponent}
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
        fontFamily: Font.medium,
        marginStart: 10,
        maxWidth: width - 100
    }
});

export default KalamAkharPlaying;