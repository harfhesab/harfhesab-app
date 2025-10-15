import React, { useState, useEffect, useMemo} from 'react';
import {Platform, StyleSheet, View, Text, Dimensions, TouchableOpacity, SafeAreaView, FlatList, I18nManager, ImageBackground, NativeModules, StatusBar} from 'react-native';
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
import GeneralHeader from '../../../components/header/GeneralHeader';
import MultiLineTextGradientSvg from '../../../components/text-components/MultiLineTextGradientSvg';
import SeasonHeader from '../../../components/header/SeasonHeader';
import { IS_TABLET_CONDITION, STATUS_BAR_HEIGHT } from '../../../utils/constants/constants';

const {width, height} = Dimensions.get("screen");

const { ImmersiveMode } = NativeModules;
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
        ImmersiveMode.enterImmersiveMode();
        return () => {
            ImmersiveMode.exitImmersiveMode();
        };
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

   

    const BANNER_WIDTH = IS_TABLET_CONDITION?460:width - 24
    const listHeaderComponent = ()=>{
        return(
            <View style={{width:width, alignItems:'center'}}>
                <ImageBackground
                    source={require("../../../assets/image/frame_stages_title.png")}
                    style={{ width: width - 160, height: (width - 160)/2.22, justifyContent: "center", alignItems: "center" }}
                    imageStyle={{ resizeMode: "stretch" }}
                    resizeMode="stretch"
                >
                    <View style={{width:"100%", height:"100%", alignItems:'center', justifyContent:'center', paddingHorizontal:10, paddingVertical:10}}>
                        <Text style={{fontFamily:Font.bold, color:colors.text.a1, fontSize:16}}>{seasonName}</Text>
                        <Text style={{fontFamily:Font.medium, color:colors.text.a2, fontSize:12}}>{`زبان ${stageGameLanguageName}  -  فصل ${info?.season_number}  -  مرحله ${info?.stage_number_from} تا ${info?.stage_number_to}`}</Text>
                    </View>
                </ImageBackground>
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
        <>
        <StatusBar translucent={true} hidden={true} />
        {
            loading?
            <View style={{flex:1}}>
                <GeneralHeader
                    height={60}
                    back={true}
                    coin={true}
                />
                <View style={[styles.container, {backgroundColor:colors.background.a1}]}>
                    <ScreenLoading
                        loading={loading}
                        getError={getError}
                        noItem={noItem}
                        tryAgain={tryAgain}
                    />
                </View>
            </View>
            :
            <View style={{flex:1, backgroundColor:colors.background.a1, paddingTop:STATUS_BAR_HEIGHT}}>
                    <SeasonHeader/>
                    <View style={styles.container}>
                        <MediaSwiper
                            items={info?.media}
                        />
                        <ImageBackground
                            source={require("../../../assets/image/frame_stages.png")}
                            style={{ width: width - 20, height: (width-20)*1.21, justifyContent: "center", alignItems: "center" }}
                            imageStyle={{ resizeMode: "stretch" }}
                            resizeMode="stretch"
                        >
                            <FlatList
                                showsVerticalScrollIndicator={false}
                                keyExtractor={keyExtractor}
                                initialNumToRender={20}
                                contentContainerStyle={{direction:'ltr', marginTop:50}}
                                renderItem={memoizedValue}
                                data={data}
                                numColumns={LIST_STAGE_CARD_NUMBER_COLUMN}
                                onEndReachedThreshold={0.5}
                                removeClippedSubviews={Platform.OS == 'ios' ? false : true}
                                extraData={{lastStage, lastStageNumber}}
                            />
                            <View style={{ position: 'absolute', top: -(width - 240)/2.22, alignSelf: 'center', zIndex: 50 }}>
                                {listHeaderComponent()}
                            </View>
                        </ImageBackground>
                    </View>
            </View>
        }
        </>
    )
}
const styles = StyleSheet.create({
    container: {
      flex: 1,
      alignItems: 'center',
      justifyContent:'space-between',
      paddingBottom:10
    }
});
export default StagesStageGameSeason;