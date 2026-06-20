import React, { useState, useEffect, useMemo, useRef} from 'react';
import {Platform, StyleSheet, View, Text, Dimensions, TouchableOpacity, SafeAreaView, FlatList, I18nManager, ImageBackground, StatusBar, TouchableNativeFeedback, ScrollView} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import AlertHelper from '../../../components/alert/AlertHelper';
import { checkStageGameContentVersion } from '../../../utils/api/StageGameApi';
import { useDispatch, useSelector } from "react-redux";
import { useRealm } from '../../../realm';
import { getStageSeasonById } from '../../../realm/repositories/stage-game/stage-season.repository';
import { changeStageGameLanguage } from '../../../redux/slices/stageGamePersistSlice';
import useAppTheme from '../../../hooks/theme/useAppTheme';
import Font from '../../../utils/Font';
import StageNumber, { STAGE_CARD_MARGIN, LIST_STAGE_CARD_NUMBER_COLUMN, STAGE_CARD_SIZE } from '../../../components/card/general/StageNumber';
import { getStagesBySeasonId } from '../../../realm/repositories/stage-game/stage.repository';
import GeneralHeader from '../../../components/header/GeneralHeader';
import MultiLineTextGradientSvg from '../../../components/text-components/MultiLineTextGradientSvg';
import SeasonHeader from '../../../components/header/SeasonHeader';
import { IS_TABLET_CONDITION, STATUS_BAR_HEIGHT } from '../../../utils/constants/constants';
import SimpleBorderText from '../../../components/text-components/SimpleBorderText';
import SeasonMediaSwiper from '../../../components/swiper/SeasonMediaSwiper';
import { useImmersiveMode } from '../../../hooks/useImmersiveMode';
import Icon from '../../../utils/Icon';
import ScreenLoading from '../../../components/screen-loading/ScreenLoading';
import StageInfo from '../../../components/card/general/StageInfo';
import { useStageListStageGameMusic } from '../../../utils/sound/MusicFunctions';

const {width, height} = Dimensions.get("screen");

function StagesStageGameSeason(props){
    useImmersiveMode()
    useStageListStageGameMusic();
    const colors = useAppTheme()
    const tabRef = useRef()
    const realm = useRealm();
    const { stageGameLanguage, stageGameLanguageName } = useSelector((state) => state.stageGamePersist);
    const { lastStageNumber, lastStage } = useSelector((state) => state.stageGame);
    const [loading, setLoading] = useState(true)
    const [getError, setGetError] = useState(false)
    const [noItem, setNoItem] = useState(false)
    const [info, setInfo] = useState(null)
    const [data, setData] = useState([])
    const seasonName = props?.route?.params?.seasonName
    const [topTab, setTopTab] = useState(2)
    const tabWidth = (width - 20)*0.9

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
            setLoading(false)
        } else if(stages?.length == 0){
            setNoItem(true)
        } else {
            setGetError(true)
        }
    }
    const tryAgain = ()=>{
        setLoading(true)
        setGetError(false)
        setNoItem(false)
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
                        <Text style={{fontFamily:Font.medium, color:colors.text.a2, fontSize:12}}>{`فصل ${info?.season_number??""}  -  مرحله ${info?.stage_number_from??""} تا ${info?.stage_number_to??""}`}</Text>
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

    const renderItem2 = ({item})=>(
        <StageInfo
            currently={item._id.toHexString() == lastStage?true:false}
            lock={item.stage_number_in_language > lastStageNumber?true:false}
            number={item.stage_number_in_language}
            parts={item?.parts}
            stage_hint={item?.stage_hint}
        />
    )
    const memoizedValue2 = useMemo(() => renderItem2, [data, lastStage, lastStageNumber]);

    const keyExtractor = (item,index)=>index.toString()
    const FLATLIST_PADDING_TOP = 15
    const changeTab = (index)=>{
        setTopTab(index)
        tabRef.current.scrollTo({x: index*tabWidth, animated: true});
    }
    const ListEmptyComponent = ()=>(
        <View style={{width: tabWidth, height:(width-20)*0.75, alignItems:'center', justifyContent:'center'}}>
            <ScreenLoading
                loading={loading}
                getError={getError}
                noItem={noItem}
                tryAgain={tryAgain}
                loadingType={"MaterialIndicator"}
                textColor={colors.primary.a8}
            />
        </View>
    )
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
                                    <View style={{width:width-65, flexDirection:'row', alignSelf:"center", alignItems:'flex-end', justifyContent:'space-between', paddingTop:"11%"}}>
                                        <TouchableNativeFeedback onPress={()=>changeTab(2)} background={TouchableNativeFeedback.Ripple(colors.border.a1,false)}>
                                            <View style={{width:"33.3%", flexDirection:'row', alignItems:'center', justifyContent:'center', gap:4, borderBottomColor:topTab == 2?colors.primary.a8:colors.shadow.a3, borderBottomWidth:topTab == 2?3:1, paddingTop:8, paddingBottom:topTab == 2?6:8}}>
                                                <Icon name={"game-controller"} type={"Ionicons"} style={{color:topTab == 2?colors.primary.a8:colors.primary.a2, fontSize:20}}/>
                                                <Text style={{fontFamily:Font.iran_yekan_bold, fontSize:13, color:topTab == 2?colors.primary.a8:colors.primary.a2}}>{"بازی"}</Text>
                                            </View>
                                        </TouchableNativeFeedback>
                                        <TouchableNativeFeedback onPress={()=>changeTab(1)} background={TouchableNativeFeedback.Ripple(colors.border.a1,false)}>
                                            <View style={{width:"33.3%", flexDirection:'row', alignItems:'center', justifyContent:'center', gap:4, borderBottomColor:topTab == 1?colors.primary.a8:colors.shadow.a3, borderBottomWidth:topTab == 1?3:1, paddingTop:8, paddingBottom:topTab == 1?6:8}}>
                                                <Icon name={"pencil"} type={"Entypo"} style={{color:topTab == 1?colors.primary.a8:colors.primary.a2, fontSize:18}}/>
                                                <Text style={{fontFamily:Font.iran_yekan_bold, fontSize:13, color:topTab == 1?colors.primary.a8:colors.primary.a2}}>{"دربارهٔ فصل"}</Text>
                                            </View>
                                        </TouchableNativeFeedback>
                                        <TouchableNativeFeedback onPress={()=>changeTab(0)} background={TouchableNativeFeedback.Ripple(colors.border.a1,false)}>
                                            <View style={{width:"33.3%", flexDirection:'row', alignItems:'center', justifyContent:'center', gap:4, borderBottomColor:topTab == 0?colors.primary.a8:colors.shadow.a3, borderBottomWidth:topTab == 0?3:1, paddingTop:8, paddingBottom:topTab == 0?6:8}}>
                                                <Icon name={"list-alt"} type={"FontAwesome"} style={{color:topTab == 0?colors.primary.a8:colors.primary.a2, fontSize:18}}/>
                                                <Text style={{fontFamily:Font.iran_yekan_bold, fontSize:13, color:topTab == 0?colors.primary.a8:colors.primary.a2}}>{"مراحل"}</Text>
                                            </View>
                                        </TouchableNativeFeedback>
                                    </View>
                                    <ScrollView
                                        ref={tabRef}
                                        showsHorizontalScrollIndicator={false}
                                        horizontal={true}
                                        style={{width:tabWidth, alignSelf:'center'}}
                                        contentContainerStyle={{alignItems:'flex-start'}}
                                        alwaysBounceHorizontal={true}
                                        snapToAlignment='start'
                                        decelerationRate={'fast'}
                                        snapToInterval={tabWidth}
                                        bounces={true}
                                        bouncesZoom={true}
                                        tabIndex={topTab}
                                        onMomentumScrollEnd={(e)=>{
                                            const contentOffset = e.nativeEvent.contentOffset.x
                                            const tabIndex = contentOffset/tabWidth.toFixed()
                                            setTopTab(tabIndex)
                                        }}
                                        hitSlop={100}
                                        directionalLockEnabled={true}
                                        disableIntervalMomentum={true}
                                        disableScrollViewPanResponder={true}
                                    >
                                        <View style={{width:tabWidth, alignItems:'center'}}>
                                            <FlatList
                                                showsVerticalScrollIndicator={false}
                                                keyExtractor={keyExtractor}
                                                initialNumToRender={20}
                                                contentContainerStyle={{direction:'ltr', paddingTop:5, paddingBottom:20, paddingHorizontal:5}}
                                                renderItem={memoizedValue}
                                                data={data}
                                                numColumns={LIST_STAGE_CARD_NUMBER_COLUMN}
                                                onEndReachedThreshold={0.5}
                                                removeClippedSubviews={Platform.OS == 'ios' ? false : true}
                                                extraData={{lastStage, lastStageNumber}}
                                                ListEmptyComponent={ListEmptyComponent}
                                            />
                                        </View>
                                        <View style={{width:tabWidth, alignItems:'center', paddingTop:5, paddingBottom:10}}>
                                            <View style={{width:width-65, height:"100%", backgroundColor:`${colors.primary.a7}50`, alignSelf:"center", borderRadius:15, overflow:'hidden'}}>
                                                <ScrollView
                                                    contentContainerStyle={{paddingTop:20, paddingBottom:100, paddingHorizontal:7}} 
                                                >
                                                    <Text style={{fontFamily:Font.bakh_black, color:colors.primary.a8, fontSize:18, lineHeight:25, textAlign:'center'}}>{"توضیحاتی دربارهٔ این فصل"}</Text>
                                                    <Text style={{fontFamily:Font.bakh_bold, color:colors.primary.a7, fontSize:14, lineHeight:25, marginTop:20}}>{info?.description}</Text>
                                                </ScrollView>
                                            </View>
                                        </View>
                                        <View style={{width:tabWidth, alignItems:'center'}}>
                                            
                                                <FlatList
                                                    showsVerticalScrollIndicator={false}
                                                    keyExtractor={keyExtractor}
                                                    initialNumToRender={20}
                                                    contentContainerStyle={{gap:15, paddingBottom:50}}
                                                    ListHeaderComponent={()=>(
                                                        <Text style={{fontFamily:Font.bakh_black, color:colors.primary.a8, fontSize:18, lineHeight:25, textAlign:'center', marginTop:20, marginBottom:5}}>{"مراحل تمام شدهٔ این فصل"}</Text>
                                                    )}
                                                    renderItem={memoizedValue2}
                                                    data={topTab == 0?data:[]}
                                                    numColumns={1}
                                                    onEndReachedThreshold={0.5}
                                                    removeClippedSubviews={Platform.OS == 'ios' ? false : true}
                                                    extraData={{lastStage, lastStageNumber}}
                                                    ListEmptyComponent={ListEmptyComponent}
                                                />
                                           
                                        </View>
                                    </ScrollView>
                                </View>
                                <View style={{ position: 'absolute', top: -((width*0.55)/2.5)/3, alignSelf: 'center', zIndex: 50 }}>
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