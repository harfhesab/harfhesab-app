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
import ButtonGradient from '../../../components/buttons/ButtonGradient';
import MyPackageButton from '../../../components/buttons/MyPackageButton';
import OnlineGameCard from '../../../components/card/online-game/OnlineGameCard';
import { IS_TABLET_CONDITION } from '../../../utils/constants/constants';

const {width, height} = Dimensions.get("window")
function OnlineGame(props){
    const colors = useAppTheme()
    const [loading, setLoading] = useState(true)
    const [getError, setGetError] = useState(false)
    const [noItem, setNoItem] = useState(false)
    const [data, setData] = useState([])

    useEffect(()=>{
        getData()
    }, [])
    
    const getData = async()=>{
        await axios({
            url:'/',
            method:'post',
            data: {
                query : `
                    query getAllOnlineGame(
                        $_id : ID
                    ){
                        getAllOnlineGame(
                            _id : $_id,
                        ) {
                            title,
                            description,
                            badge,
                            icon_image,
                            is_active,
                        }
                    }
                `,
                variables : {
                    "_id" : null,
                }
            }
        }).then(async(response)=>{
            const dataReceived = response.data.data?.getAllOnlineGame
            setData(dataReceived || [])
            if(dataReceived.length == 0){
                setNoItem(true)
            }
            setLoading(false)
        }).catch((e)=>{
            setLoading(true)
            setGetError(true)
        })
    }
    const tryAgain = async()=>{
        setLoading(true)
        setGetError(false)
        setNoItem(false)
        getData()
    }
    const renderItem = useCallback(({item})=>(
        <OnlineGameCard
            _id={item._id}
            title={item.title}
            image={item.icon_image}
        />
    ), [])
    const memoizedValue = useMemo(() => renderItem, [data]);
    const keyExtractor = (item,index)=>index.toString()
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
    return(
         <View style={{flex:1, backgroundColor:colors.background.a1}}>
            <GeneralHeader
                title={"بازی‌های آنلاین"}
                coin={true}
                subscription={true}
            />
            <View style={styles.container}>
                <FlatList
                    style={{flex:1, width:"100%", paddingHorizontal:15}}
                    contentContainerStyle={[
                        { paddingBottom:70, paddingTop:20,  rowGap:15, justifyContent:'space-between'},
                        data.length === 0 && {flex: 1}
                    ]}
                    showsVerticalScrollIndicator={false}
                    data={data}
                    keyExtractor={keyExtractor}
                    numColumns={IS_TABLET_CONDITION?3:2}
                    renderItem={memoizedValue}
                    onEndReachedThreshold={0.5}
                    initialNumToRender={20}
                    removeClippedSubviews={Platform.OS == 'ios' ? false : true}
                    ListEmptyComponent={ListEmptyComponent}
                    columnWrapperStyle={{ gap:15}}
                /> 
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
export default OnlineGame;