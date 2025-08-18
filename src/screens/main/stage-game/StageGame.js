import React, {useMemo, useState, useEffect} from 'react';
import {StyleSheet, View, Text, Dimensions, TouchableOpacity, SafeAreaView, FlatList} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import AlertHelper from '../../../components/alert/AlertHelper';
import { checkStageGameContentVersion } from '../../../utils/api/StageGameApi';
import { useDispatch, useSelector } from "react-redux";
import { useRealm } from '../../../realm';
import { getStageSeasonsByLanguage } from '../../../realm/repositories/stage-game/stage-season.repository';
import BottomDrawer from '../../../components/bottom-drawer/BottomDrawer';
import BottomDrawerHelper from '../../../components/bottom-drawer/BottomDrawerHelper';
import { getAllLanguages } from '../../../realm/repositories/general/language.repository';
import { changeStageGameLanguage } from '../../../redux/slices/stageGamePersistSlice';
import useAppTheme from '../../../hooks/theme/useAppTheme';
import Font from '../../../utils/Font';
import TextSkia from '../../../components/text-components/TextSkia';
import ScreenLoading from '../../../components/screen-loading/ScreenLoading';
import StageGameSeasonCard, { STAGE_GAME_SEASON_CARD_HEIGHT, STAGE_GAME_SEASON_CARD_MARGIN } from '../../../components/card/stage-game-card/StageGameSeasonCard';
import { IS_TABLET_CONDITION } from '../../../utils/constants/constants';
import GeneralHeader from '../../../components/header/GeneralHeader';
import Icon from '../../../utils/Icon';
import { getCurrentLanguageLastStageAndLastSeason } from '../../../realm/repositories/user/user-stage-game-progress.repository';
import { updateCurrentLanguageLastStageAndLastSeason } from '../../../redux/slices/stageGameSlice';

const {width, height} = Dimensions.get("window")
function StageGame(props){
    const colors = useAppTheme()
    const state = useSelector((state) => state.stageGameDownload);
    const dispatch = useDispatch();
    const realm = useRealm();
    const { stageGameLanguage, stageGameLanguageName, forceUpdate, versionCreatedContent, versionUpdatedContent, versionDeletedContent } = useSelector((state) => state.stageGamePersist);
    const [loading, setLoading] = useState(true)
    const [getError, setGetError] = useState(false)
    const [noItem, setNoItem] = useState(false)
    const [data, setData] = useState([])

    useEffect(() => {
        startFirst()
    }, []);
    const startFirst = async() =>{
        if(stageGameLanguage){
            getData()
        }
        if(versionCreatedContent == 0){
            AlertHelper.showAlert({
                body: "برای شروع بازی، محتوای بازی مرحله‌ای را دریافت کنید.",
                buttons: [
                    {
                        text: 'دریافت محتوا',
                        onPress: () => {
                            props.navigation.navigate("StageGameUpdateScreen")
                        },
                        type:'bold'
                    },
                ],
                options : {
                    type: 'warning',
                    cancelable: false,
                    bodyAlign:'center',
                    textAlign:'center',
                },
            });
        } else if(forceUpdate == true){
            AlertHelper.showAlert({
                body: "یک بروزرسانی اجباری برای محتوای بازی مرحله‌ای یافت شد. برای دریافت آن اقدام کنید.",
                buttons: [
                    {
                        text: 'دریافت بروزرسانی',
                        onPress: () => {
                            props.navigation.navigate("StageGameUpdateScreen")
                        },
                        type:'bold'
                    },
                ],
                options : {
                    type: 'warning',
                    cancelable: false,
                    bodyAlign:'flex-start',
                    textAlign:'flex-start'
                },
            });
        } else if(!stageGameLanguage){
            getLanguages()
        } else {
            const versionContent = { versionCreatedContent, versionUpdatedContent, versionDeletedContent }
            checkStageGameContentVersion({ dispatch, realm, state, versionContent });
        }
    }
    const getLanguages = ()=>{
        const languages = getAllLanguages(realm)
        const btn = [
            {
                onPress : ({radio})=>{
                    const selected = languages[radio]._id
                    const selectedName = languages[radio].name
                    dispatch(changeStageGameLanguage({
                        language:selected.toString(),
                        languageName:selectedName.toString(),
                    }))
                    getData(selected)
                },
                text: 'انتخاب زبان',
                loading: true,
                type: "bold"
            },
        ]
        if(stageGameLanguage){
            const cancelBtn = {
                onPress : ()=>{},
                text: 'لغو',
                loading: false,
                type: "border"
            }
            btn.push(cancelBtn)
        }
        BottomDrawerHelper.showBottomDrawer({
            title:"زبان بازی مرحله‌ای را انتخاب کنید.",
            list: languages.map(item => ({
                text1: item.name
            })),
            buttons:btn,
            options:{
                radioSelected: stageGameLanguage?languages.findIndex(i=>i._id == stageGameLanguage):undefined,
                listType: "radio-button",
                cancelable: stageGameLanguage?true:false,
                selectRequired: stageGameLanguage?false:true
            }
        })
    }
    const getData = async (selected)=>{
        if(data?.length > 0){
            setData([])
            setLoading(true)
            setGetError(false)
            setNoItem(false)
            const time = setTimeout(()=>{
                getDataOperation(selected)
            }, 100)
        } else {
            getDataOperation(selected)
        }
        
    }
    const getDataOperation = (selected)=>{
        const language = selected ?? stageGameLanguage
        const progress = getCurrentLanguageLastStageAndLastSeason(realm, language)
        if(progress){
            const data = {
                





                
            }
            dispatch(updateCurrentLanguageLastStageAndLastSeason(data))
        }
        const seasons = getStageSeasonsByLanguage(realm, language)
        if(seasons && seasons.length > 0){
            setData(seasons)
            setLoading(false)
        } else if(seasons?.length == 0){
            setNoItem(true)
        } else {
            setGetError(true)
        }
        BottomDrawerHelper.hideBottomDrawer()
    }
    const tryAgain = ()=>{
        setLoading(true)
        setGetError(false)
        getData()
    }

    const headerRigthComponent = ()=>{
        return(
            (stageGameLanguage)&&
            <View style={{height:'100%', alignItems:'center', justifyContent:'center'}}>
                <TouchableOpacity onPress={getLanguages} style={{ flexDirection:'row', alignItems:'center', justifyContent:'center', gap:10, borderColor:colors.border.a1, borderWidth:1, borderRadius:8, paddingHorizontal: 10, backgroundColor:`${colors.primary.a1}40`, height:40}}>
                    <Icon name={'layers-outline'} type={'Ionicons'} style={{fontSize:25, color:colors.text.a3}}/>
                    <Text style={{fontFamily:Font.medium, color:colors.text.a2, fontSize:14}}>{`زبان ${stageGameLanguageName}`}</Text>
                </TouchableOpacity>
            </View>
        )
    }

    const renderItem = ({item, index})=>{
        return(
            <StageGameSeasonCard
                title={item.title}
                description={item.description}
                image={item.media[0].path}
                isActive={item.is_active}
                numberStage={item.number_stage}
                seasonNumber={item.season_number}
                stageNumberFrom={item.stage_number_from}
                stageNumberTo={item.stage_number_to}
                onPress={()=>{props.navigation.navigate("StagesStageGameSeason", {season:item._id.toString(), seasonName:item.title.toString()})}}
            />
        )
    }
    const memoizedValue = useMemo(() => renderItem, [data]);
    const keyExtractor = (item,index)=>index.toString()
    const FLATLIST_PADDING_VERTICAL = 15
    const itemHeight = STAGE_GAME_SEASON_CARD_HEIGHT
    const rowGap = 25
    const numColumns = IS_TABLET_CONDITION ? 2 : 1
    const snapInterval = itemHeight + rowGap
    return(
        <View style={{flex:1}}>
            <GeneralHeader
                paddingHorizontal={15}
                height={60}
                coin={true}
                RightComponent={headerRigthComponent}
            />
            <LinearGradient colors={colors.background_gradient} style={{flex:1}}>
                <View style={styles.container}>
                    {
                        loading == true?
                        <ScreenLoading
                            loading={loading}
                            getError={getError}
                            noItem={noItem}
                            tryAgain={tryAgain}
                        />
                        :
                        <FlatList
                            showsVerticalScrollIndicator={false}
                            keyExtractor={keyExtractor}
                            initialNumToRender={3}
                            windowSize={5}
                            maxToRenderPerBatch={3}
                            contentContainerStyle={{alignItems:'center', rowGap:rowGap, columnGap:15, paddingTop:FLATLIST_PADDING_VERTICAL, paddingBottom:FLATLIST_PADDING_VERTICAL}}
                            renderItem={memoizedValue}
                            data={data}
                            numColumns={numColumns}
                            onEndReachedThreshold={0.5}
                            removeClippedSubviews={Platform.OS == 'ios' ? false : true}
                            style={{width:width, paddingHorizontal:STAGE_GAME_SEASON_CARD_MARGIN}}
                            getItemLayout={(data, index) => ({
                                length: itemHeight,
                                offset: FLATLIST_PADDING_VERTICAL + Math.floor(index / numColumns) * snapInterval,
                                index,
                            })}
                            snapToInterval={snapInterval} // ارتفاع هر ردیف
                            snapToAlignment="start"       // آیتم از بالا چفت شود
                            decelerationRate="fast"       // سرعت کاهش سریع برای اسنپ بهتر
                            disableIntervalMomentum={true} // محدود کردن اسکرول به فقط یک interval در هر سوایپ
                            bounces={true}                // فنری بودن مانند iOS
                        />
                    }
                </View>
            </LinearGradient>
            <BottomDrawer ref = {Ref => {BottomDrawerHelper.setRef(Ref)}}/>
        </View>
    )
}
const styles = StyleSheet.create({
    container: {
      flex: 1,
      alignItems: 'center',
    }
});
export default StageGame;