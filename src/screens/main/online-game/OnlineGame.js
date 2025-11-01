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
                            
                        }
                    }
                `,
                variables : {
                    "_id" : null,
                }
            }
        }).then(async(response)=>{
            const dataReceived = response.data.data?.getAllOnlineGame
           
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
        <View>

        </View>
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
                height={60}
                coin={true}
            />
            <View style={styles.container}>
                <FlatList
                    style={{flex:1}}
                    contentContainerStyle={[
                        {width: width, gap: 5, paddingBottom:70},
                        data.length === 0 && {flex: 1}
                    ]}
                    showsVerticalScrollIndicator={false}
                    data={data}
                    keyExtractor={keyExtractor}
                    renderItem={memoizedValue}
                    onEndReachedThreshold={0.5}
                    initialNumToRender={20}
                    removeClippedSubviews={Platform.OS == 'ios' ? false : true}
                    ListEmptyComponent={ListEmptyComponent}
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