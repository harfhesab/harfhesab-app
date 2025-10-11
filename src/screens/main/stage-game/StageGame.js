import React, {useMemo, useState, useEffect, useRef} from 'react';
import {StyleSheet, View, Text, Dimensions, TouchableOpacity, SafeAreaView, FlatList} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import AlertHelper from '../../../components/alert/AlertHelper';
import { checkStageGameContentVersion } from '../../../utils/api/StageGameApi';
import { useDispatch, useSelector } from "react-redux";
import { useQuery, useRealm } from '../../../realm';
import { getStageSeasonsByLanguage } from '../../../realm/repositories/stage-game/stage-season.repository';
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
import { BSON } from 'realm';
import { StageSeason } from '../../../realm/schemas/stage-game/StageSeasonSchema';
import { useIsFocused } from '@react-navigation/native';
import BottomDrawerGridHelper from '../../../components/bottom-drawer-grid/BottomDrawerGridHelper';
import BottomDrawerGrid from '../../../components/bottom-drawer-grid/BottomDrawerGrid';

const {width, height} = Dimensions.get("window")
const FLATLIST_PADDING_VERTICAL = 15
const itemHeight = STAGE_GAME_SEASON_CARD_HEIGHT
const rowGap = 25
const numColumns = IS_TABLET_CONDITION ? 2 : 1
const snapInterval = itemHeight + rowGap
function useStageSeasonsByLanguage(languageId) {
  const all = useQuery(StageSeason);

  if (!languageId) return [];

  const id = typeof languageId === 'string' ? new BSON.ObjectId(languageId) : languageId;

  return all.filtered("language_ref == $0 AND is_visible == true", id).sorted("season_number");
}
function StageGame(props){
    const isFocused = useIsFocused();
    const colors = useAppTheme()
    const state = useSelector((state) => state.stageGameDownload);
    const dispatch = useDispatch();
    const realm = useRealm();
    const flatListRef = useRef(null);
    const [activeIndexes, setActiveIndexes] = useState([]);
    const { stageGameLanguage, stageGameLanguageName, forceUpdate, versionCreatedContent, versionUpdatedContent, versionDeletedContent } = useSelector((state) => state.stageGamePersist);
    const { lastSeasonNumber } = useSelector((state) => state.stageGame);
    const [loading, setLoading] = useState(true)
    const data = useStageSeasonsByLanguage(stageGameLanguage)

    useEffect(() => {
        if(isFocused){
            startFirst()
        }
    }, [isFocused]);
    useEffect(()=>{
        getProgressOperation()
    }, [stageGameLanguage])
    useEffect(() => {
        setLoading(true)
        setTimeout(()=>{
            setLoading(false)
        }, 300)
        const targetIndex = Math.max(0, lastSeasonNumber - 1);
        if (targetIndex < data.length) {
            flatListRef.current?.scrollToIndex({
                index: targetIndex,
                animated: false,
                viewOffset: FLATLIST_PADDING_VERTICAL,
            });
        }
    }, [stageGameLanguage, lastSeasonNumber]);
    const getProgressOperation = async(selected)=>{
        const language = selected ?? stageGameLanguage
        const progress = await getCurrentLanguageLastStageAndLastSeason(realm, language)
        const data = {
            lastStage: progress?.last_stage,
            lastStageNumber: progress?.last_stage_number,
            lastSeason: progress?.last_season,
            lastSeasonNumber: progress?.last_season_number  
        }
        await dispatch(updateCurrentLanguageLastStageAndLastSeason(data))
    }
    const startFirst = async() =>{
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
                onPress : ({data})=>{
                    const selected = data._id[0]
                    const selectedName = data.text1[0]
                    dispatch(changeStageGameLanguage({
                        language:selected.toString(),
                        languageName:selectedName.toString(),
                    }))
                },
                text: 'انتخاب زبان',
                loading: false,
                type: "bold",
                selectRequired:true
            },
        ]
        if(stageGameLanguage){
            const cancelBtn = {
                onPress : ()=>{},
                text: 'لغو',
                loading: false,
                type: "border",
                selectRequired:false
            }
            btn.push(cancelBtn)
        }
        const previousSelected = stageGameLanguage?{
            _id: [stageGameLanguage],
            text1: [stageGameLanguageName],
        }:undefined;
        BottomDrawerGridHelper.showBottomDrawer({
            title:"زبان بازی مرحله‌ای را انتخاب کنید.",
            list: languages.map(item => ({
                _id: item._id,
                text1: item.name,
                image: item.icon_image
            })),
            buttons:btn,
            options:{
                numberSelectable: 1,
                previousSelected:previousSelected,
                cancelable: stageGameLanguage?true:false,
                selectRequired: stageGameLanguage?false:true,
            }
        })
    }
    const headerRigthComponent = ()=>{
        return(
            (stageGameLanguage)&&
            <View style={{height:'100%', alignItems:'center', justifyContent:'center'}}>
                <TouchableOpacity onPress={getLanguages} style={{ flexDirection:'row', alignItems:'center', justifyContent:'center', gap:10, borderColor:colors.border.a1, borderWidth:1, borderRadius:8, paddingHorizontal: 10, backgroundColor:`${colors.primary.a1}25`, height:40}}>
                    <Icon name={'layers-outline'} type={'Ionicons'} style={{fontSize:25, color:colors.text.a3}}/>
                    <Text style={{fontFamily:Font.medium, color:colors.text.a2, fontSize:14}}>{`زبان ${stageGameLanguageName}`}</Text>
                </TouchableOpacity>
            </View>
        )
    }

    const renderItem = ({item, index})=>{
        return(
            <StageGameSeasonCard
                lock={item.season_number > lastSeasonNumber?true:false}
                currentScroll={activeIndexes.includes(index)}
                title={item.title}
                description={item.description}
                image={item.media[0].path}
                isActive={item.is_active}
                numberStage={item.number_stage}
                seasonNumber={item.season_number}
                stageNumberFrom={item.stage_number_from}
                stageNumberTo={item.stage_number_to}
                onPress={()=>{
                    if(item.season_number > lastSeasonNumber)return
                    props.navigation.navigate("StagesStageGameSeason", {season:item._id.toString(), seasonName:item.title.toString()})
                }}
            />
        )
    }
    const memoizedValue = useMemo(() => renderItem, [data, activeIndexes, lastSeasonNumber]);
    const keyExtractor = (item,index)=>index.toString()
    

    

    // کانفیگ برای تشخیص آیتم‌های دیده‌شده
    const viewabilityConfig = {
        itemVisiblePercentThreshold: 90, // حداقل 90% آیتم دیده شود
    };

    // وقتی آیتم‌های دیده‌شده تغییر کنند
    const onViewableItemsChanged = useRef(({ viewableItems }) => {
        if (viewableItems.length > 0) {
            if (numColumns === 1) {
                // موبایل: فقط یک آیتم در مرکز فعال باشد
                const currentIndex = viewableItems[0].index;
                setActiveIndexes([currentIndex]);
            } else {
                // تبلت: هر ردیف شامل دو آیتم → هر دو فعال باشند
                const currentRow = Math.floor(viewableItems[0].index / 2);
                const firstIndex = currentRow * 2;
                const secondIndex = firstIndex + 1;
                setActiveIndexes([firstIndex, secondIndex]);
            }
        }
    }).current;
    const ListEmptyComponent = ()=>{
        <View style={{flex:1, alignItems:'center', justifyContent:'center'}}>
            <ScreenLoading
                loading={false}
                getError={false}
                noItem={true}
                tryAgain={()=>{}}
            />
        </View>
    }
    return(
        <View style={{flex:1, backgroundColor:colors.background.a1}}>
            <GeneralHeader
                paddingHorizontal={15}
                height={60}
                coin={true}
                RightComponent={headerRigthComponent}
            />
            <View style={styles.container}>
                <FlatList
                    ref={flatListRef}
                    key={stageGameLanguage}
                    showsVerticalScrollIndicator={false}
                    keyExtractor={keyExtractor}
                    initialNumToRender={3}
                    windowSize={5}
                    initialScrollIndex={
                        data.length > 0
                        ? Math.min(Math.max(0, lastSeasonNumber - 1), data.length - 1)
                        : 0
                    }
                    maxToRenderPerBatch={3}
                    contentContainerStyle={{alignItems:'center', rowGap:rowGap, paddingTop:FLATLIST_PADDING_VERTICAL, paddingBottom:FLATLIST_PADDING_VERTICAL}}
                    renderItem={memoizedValue}
                    data={data}
                    numColumns={numColumns}
                    onEndReachedThreshold={0.5}
                    removeClippedSubviews={Platform.OS == 'ios' ? false : true}
                    style={{width:width, paddingHorizontal:STAGE_GAME_SEASON_CARD_MARGIN}}
                    getItemLayout={(data, index) => {
                        const row = Math.floor(index / numColumns); // هر ردیف
                        return {
                            length: itemHeight,
                            offset: FLATLIST_PADDING_VERTICAL + row * snapInterval,
                            index,
                        };
                    }}
                    snapToInterval={snapInterval} // ارتفاع هر ردیف
                    snapToAlignment="start"       // آیتم از بالا چفت شود
                    decelerationRate="fast"       // سرعت کاهش سریع برای اسنپ بهتر
                    disableIntervalMomentum={true} // محدود کردن اسکرول به فقط یک interval در هر سوایپ
                    bounces={true}                // فنری بودن مانند iOS
                    viewabilityConfig={viewabilityConfig}
                    onViewableItemsChanged={onViewableItemsChanged}
                    ListEmptyComponent={ListEmptyComponent}
                    extraData={{ activeIndexes, lastSeasonNumber }}
                    onScrollToIndexFailed={(info) => {
                        console.warn("scrollToIndex failed", info);

                        // تلاش دوباره با نزدیک‌ترین ایندکس معتبر
                        flatListRef.current?.scrollToIndex({
                            index: Math.max(0, data.length - 1),
                            animated: false,
                            viewOffset: FLATLIST_PADDING_VERTICAL,
                        });
                    }}
                />
            </View>
            {
                loading == true&&
                <View style={{width:"100%", height:"100%", backgroundColor:colors.background.a1, alignItems:'center', justifyContent:'center', position:'absolute'}}>
                    <ScreenLoading
                        loading={true}
                        getError={false}
                        noItem={false}
                        tryAgain={()=>{}}
                    />
                </View>
            }
            <BottomDrawerGrid ref = {Ref => {BottomDrawerGridHelper.setRef(Ref)}}/>
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