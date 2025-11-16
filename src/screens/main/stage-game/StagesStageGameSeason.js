import React, { useState, useEffect, useMemo} from 'react';
import {Platform, StyleSheet, View, Text, Dimensions, TouchableOpacity, SafeAreaView, FlatList, I18nManager, ImageBackground, StatusBar} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import AlertHelper from '../../../components/alert/AlertHelper';
import { checkStageGameContentVersion } from '../../../utils/api/StageGameApi';
import { useDispatch, useSelector } from "react-redux";
import { useRealm } from '../../../realm';
import { getStageSeasonById } from '../../../realm/repositories/stage-game/stage-season.repository';
import { changeStageGameLanguage } from '../../../redux/slices/stageGamePersistSlice';
import useAppTheme from '../../../hooks/theme/useAppTheme';
import Font from '../../../utils/Font';
import TextSkia from '../../../components/text-components/TextSkia';
import StageNumber, { STAGE_CARD_MARGIN, LIST_STAGE_CARD_NUMBER_COLUMN, STAGE_CARD_SIZE } from '../../../components/card/general/StageNumber';
import { getStagesBySeasonId } from '../../../realm/repositories/stage-game/stage.repository';
import GeneralHeader from '../../../components/header/GeneralHeader';
import MultiLineTextGradientSvg from '../../../components/text-components/MultiLineTextGradientSvg';
import SeasonHeader from '../../../components/header/SeasonHeader';
import { IS_TABLET_CONDITION, STATUS_BAR_HEIGHT } from '../../../utils/constants/constants';
import SimpleBorderText from '../../../components/text-components/SimpleBorderText';
import SeasonMediaSwiper from '../../../components/swiper/SeasonMediaSwiper';
import { useImmersiveMode } from '../../../hooks/useImmersiveMode';

const {width, height} = Dimensions.get("screen");

function StagesStageGameSeason(props){
    useImmersiveMode()
    const colors = useAppTheme()
    const realm = useRealm();
    const { stageGameLanguage, stageGameLanguageName } = useSelector((state) => state.stageGamePersist);
    const { lastStageNumber, lastStage } = useSelector((state) => state.stageGame);
    const [getError, setGetError] = useState(false)
    const [noItem, setNoItem] = useState(false)
    const [info, setInfo] = useState(null)
    const [data, setData] = useState([])
    const seasonName = props?.route?.params?.seasonName

    useEffect(() => {
        getData()
    }, []);

    const getData = async (selected)=>{
        const id = props?.route?.params?.season
        const season = getStageSeasonById(realm, id)
        const stages = getStagesBySeasonId(realm, id)
        if(season && stages?.length > 0){
            setInfo(season)
            setData(stages)
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
                    style={{ width: width*0.55, height: (width*0.55)/2.5, justifyContent: "center", alignItems: "center" }}
                    imageStyle={{ resizeMode: "stretch" }}
                    resizeMode="stretch"
                >
                    <View style={{width:"100%", height:"100%", alignItems:'center', justifyContent:'center', paddingHorizontal:5, gap:5, paddingBottom:5}}>
                        <Text style={{fontFamily:Font.medium, color:colors.text.a1, fontSize:14}}>{`زبان ${stageGameLanguageName}`}</Text>
                        <Text style={{fontFamily:Font.medium, color:colors.text.a2, fontSize:12}}>{`فصل ${info?.season_number}  -  مرحله ${info?.stage_number_from} تا ${info?.stage_number_to}`}</Text>
                    </View>
                </ImageBackground>
            </View>
        )
    }

    const renderItem = ({item})=>(
        <StageNumber
            currently={item._id.toHexString() == lastStage?true:false}
            lock={item.stage_number_in_language > lastStageNumber?true:false}
            number={item.stage_number_in_language}
            onPress={()=>{
                if(item.stage_number_in_language > lastStageNumber)return
                props.navigation.navigate("WordToSlotStageGame", {stage:item?._id.toHexString()})
            }}
        />
    )
    const memoizedValue = useMemo(() => renderItem, [data, lastStage, lastStageNumber]);

    const keyExtractor = (item,index)=>index.toString()
    const FLATLIST_PADDING_TOP = 15
    return(
        <SafeAreaView>
            <StatusBar translucent={true} hidden={true} />
            <ImageBackground
                source={require("../../../assets/image/background.png")}
                style={{ width: width, height: height}}
                imageStyle={{ resizeMode: "cover" }}
                resizeMode="cover"
            >
                <View style={{flex:1, paddingTop:STATUS_BAR_HEIGHT}}>
                        <SeasonHeader/>
                        <View style={styles.container}>
                            <SeasonMediaSwiper
                                items={info?.media}
                                title={seasonName}
                                height={height - (STATUS_BAR_HEIGHT + 65 + ((width-20)*1.21) + (((width*0.55)/2.5)/3.2) + 40)}
                            />
                            <ImageBackground
                                source={require("../../../assets/image/frame_stages.png")}
                                style={{ width: width - 20, height: (width-20)*1.21, justifyContent: "center", alignItems: "center"}}
                                resizeMode="stretch"
                                imageStyle={{
                                    resizeMode: "stretch",
                                }}
                            >
                                <View style={{height:((width-20)*1.21)-32, borderRadius:23, overflow:'hidden'}}>
                                    <FlatList
                                        showsVerticalScrollIndicator={false}
                                        keyExtractor={keyExtractor}
                                        initialNumToRender={20}
                                        contentContainerStyle={{direction:'ltr', paddingTop:50, paddingBottom:20, paddingHorizontal:5}}
                                        renderItem={memoizedValue}
                                        data={data}
                                        numColumns={LIST_STAGE_CARD_NUMBER_COLUMN}
                                        onEndReachedThreshold={0.5}
                                        removeClippedSubviews={Platform.OS == 'ios' ? false : true}
                                        extraData={{lastStage, lastStageNumber}}
                                    />
                                </View>
                                <View style={{ position: 'absolute', top: -((width*0.55)/2.5)/3.2, alignSelf: 'center', zIndex: 50 }}>
                                    {listHeaderComponent()}
                                </View>
                            </ImageBackground>
                        </View>
                </View>
            </ImageBackground>
        </SafeAreaView>
    )
}
const styles = StyleSheet.create({
    container: {
      flex: 1,
      paddingTop:20,
      alignItems: 'center',
      justifyContent:'space-between',
      paddingBottom:10
    }
});
export default StagesStageGameSeason;