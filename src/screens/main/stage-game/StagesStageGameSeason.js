import React, { useState, useEffect, useMemo} from 'react';
import {Platform, StyleSheet, View, Text, Dimensions, TouchableOpacity, SafeAreaView, FlatList, I18nManager} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import AlertHelper from '../../../components/alert/AlertHelper';
import { checkStageGameContentVersion } from '../../../utils/api/StageGameApi';
import { useDispatch, useSelector } from "react-redux";
import { useRealm } from '../../../realm';
import { getStageSeasonById } from '../../../realm/repositories/stage-game/stage-season.repository';
import { getAllLanguages } from '../../../realm/repositories/general/language.repository';
import { changeStageGameLanguage } from '../../../redux/slices/stageGamePersistSlice';
import useAppTheme from '../../../hooks/theme/useAppTheme';
import Font from '../../../utils/Font';
import TextSkia from '../../../components/text-components/TextSkia';
import ScreenLoading from '../../../components/screen-loading/ScreenLoading';
import MediaSwiper from '../../../components/swiper/MediaSwiper';
import StageNumber, { STAGE_CARD_MARGIN, LIST_STAGE_CARD_NUMBER_COLUMN, STAGE_CARD_SIZE } from '../../../components/card/general/StageNumber';
import { getStagesBySeasonId } from '../../../realm/repositories/stage-game/stage.repository';
import GalaxyTwinkle from '../../../components/backgroun-layer/GalaxyTwinkle';
import GeneralHeader from '../../../components/header/GeneralHeader';
import MultiLineTextGradientSvg from '../../../components/text-components/MultiLineTextGradientSvg';
import SeasonHeader from '../../../components/header/SeasonHeader';

const {width, height} = Dimensions.get("window")
function StagesStageGameSeason(props){
    const colors = useAppTheme()
    const realm = useRealm();
    const { stageGameLanguage, stageGameLanguageName } = useSelector((state) => state.stageGamePersist);
    const { lastStageNumber, lastStage } = useSelector((state) => state.stageGame);
    const [loading, setLoading] = useState(true)
    const [getError, setGetError] = useState(false)
    const [noItem, setNoItem] = useState(false)
    const [info, setInfo] = useState(null)
    const [data, setData] = useState([])
    const [headerTransparent, setHeaderTransparent] = useState(0)
    const seasonName = props?.route?.params?.seasonName

    useEffect(() => {
        getData()
    }, []);

    const operationHeaderTransparent = (i)=>{
        if(i < 101){
            setHeaderTransparent(i/100)
        }
    }

    const getData = async (selected)=>{
        const id = props?.route?.params?.season
        const season = getStageSeasonById(realm, id)
        const stages = getStagesBySeasonId(realm, id)
        if(season && stages?.length > 0){
            setInfo(season)
            setData(stages)
            setLoading(false)
        } else if(seasons?.length == 0){
            setNoItem(true)
        } else {
            setGetError(true)
        }
    }
    const tryAgain = ()=>{
        setLoading(true)
        setGetError(false)
        getData()
    }

   

    const BANNER_WIDTH = width > 600?460:width - 30
    const LIST_HEADER_COMPONENT_HEIGHT = info?.media?.length > 0?(BANNER_WIDTH*0.7) + 30 + 80:80
    const listHeaderComponent = ()=>{
        return(
            info?.media?.length > 0&&
            <View style={{height:LIST_HEADER_COMPONENT_HEIGHT, width:width-30, alignItems:'center', justifyContent:'center'}}>
                <MediaSwiper
                    items={info?.media}
                />
                <View style={{width:width-30, height:70, backgroundColor:`${colors.primary.a1}50`, borderRadius:15, alignItems:'flex-end', justifyContent:'space-between', marginTop:10, paddingHorizontal:10, paddingVertical:10}}>
                    <Text style={{fontFamily:Font.bold, color:colors.text.a1, fontSize:14}}>{seasonName}</Text>
                    <Text style={{fontFamily:Font.medium, color:colors.text.a2, fontSize:12}}>{`زبان ${stageGameLanguageName}  -  فصل ${info?.season_number}  -  مرحله ${info?.stage_number_from} تا ${info?.stage_number_to}`}</Text>
                </View>
            </View>
        )
    }

    const renderItem = ({item})=>(
        <StageNumber
            currently={item._id.toString() == lastStage?true:false}
            lock={item.stage_number_in_language > lastStageNumber?true:false}
            number={item.stage_number_in_language}
            onPress={()=>{
                if(item.stage_number_in_language > lastStageNumber)return
                props.navigation.navigate("WordToSlotStageGame", {stage:item?._id.toString()})
            }}
        />
    )
    const memoizedValue = useMemo(() => renderItem, [data, lastStage, lastStageNumber]);

    const keyExtractor = (item,index)=>index.toString()
    const FLATLIST_PADDING_TOP = 15
    return(
        loading?
        <View style={{flex:1}}>
            <GeneralHeader
                height={60}
                back={true}
                coin={true}
            />
            <LinearGradient colors={colors.background_gradient} style={{flex:1}}>
                <View style={styles.container}>
                    <ScreenLoading
                        loading={loading}
                        getError={getError}
                        noItem={noItem}
                        tryAgain={tryAgain}
                    />
                </View>
            </LinearGradient>
        </View>
        :
        <View style={{flex:1, backgroundColor:"#120426"}}>
            <GalaxyTwinkle style={{width:width, height:height }}>
                <SeasonHeader
                    transparent={headerTransparent}
                />
                <View style={styles.container}>
                    <FlatList
                        onScroll={(i)=>operationHeaderTransparent(i.nativeEvent.contentOffset.y)}
                        showsVerticalScrollIndicator={false}
                        keyExtractor={keyExtractor}
                        initialNumToRender={20}
                        ListHeaderComponent={listHeaderComponent}
                        contentContainerStyle={{direction:'ltr'}}
                        renderItem={memoizedValue}
                        data={data}
                        style={{paddingHorizontal:15}}
                        numColumns={LIST_STAGE_CARD_NUMBER_COLUMN}
                        onEndReachedThreshold={0.5}
                        removeClippedSubviews={Platform.OS == 'ios' ? false : true}
                        getItemLayout={(data, index) => ({
                            length: STAGE_CARD_SIZE + (STAGE_CARD_MARGIN*2),
                            offset: FLATLIST_PADDING_TOP + (STAGE_CARD_MARGIN*2) + LIST_HEADER_COMPONENT_HEIGHT + (STAGE_CARD_SIZE* index),  // 15 پدینگ بالای کل لیست
                            index,
                        })}
                        extraData={{lastStage, lastStageNumber}}
                    />
                </View>
            </GalaxyTwinkle>
        </View>
    )
}
const styles = StyleSheet.create({
    container: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center'
    }
});
export default StagesStageGameSeason;