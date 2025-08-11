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
import StageGameSeasonCard, { STAGE_GAME_CARD_MARGIN } from '../../../components/card/stage-game-card/StageGameSeasonCard';
import { IS_TABLET_CONDITION } from '../../../utils/constants/constants';

const {width, height} = Dimensions.get("window")
function StageGame(props){
    const colors = useAppTheme()
    const state = useSelector((state) => state.stageGameDownload);
    const dispatch = useDispatch();
    const realm = useRealm();
    const { stageGameLanguage, forceUpdate, versionCreatedContent, versionUpdatedContent, versionDeletedContent } = useSelector((state) => state.stageGamePersist);
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
        BottomDrawerHelper.showBottomDrawer({
            title:"برای شروع بازی مرحله‌ای یکی از زبان های زیر را انتخاب کنید.",
            list: languages.map(item => ({
                text1: item.name
            })),
            buttons:[
                {
                    onPress : ({radio})=>{
                        const selected = languages[radio]._id
                        dispatch(changeStageGameLanguage({language:selected}))
                        getData(selected)
                    },
                    text: 'انتخاب زبان',
                    loading: true,
                    type: "bold"
                },
            ],
            options:{
                listType: "radio-button",
                cancelable: false,
                selectRequired: true
            }
        })
    }
    const getData = async (selected)=>{
        const language = selected ?? stageGameLanguage
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
                onPress={()=>{props.navigation.navigate("StagesStageGameSeason", {season:item._id.toString()})}}
            />
        )
    }
    const memoizedValue = useMemo(() => renderItem, [data]);
    const keyExtractor = (item,index)=>index.toString()
    const FLATLIST_PADDING_TOP = 15
    return(
        <SafeAreaView>
            <LinearGradient colors={colors.background_gradient} style={{width:width, height:height}}>
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
                            initialNumToRender={1}
                            contentContainerStyle={{alignItems:'center', rowGap:25, columnGap:15, paddingTop:FLATLIST_PADDING_TOP, paddingBottom:90}}
                            renderItem={memoizedValue}
                            data={data}
                            numColumns={IS_TABLET_CONDITION ? 2 : 1}
                            onEndReachedThreshold={0.5}
                            removeClippedSubviews={Platform.OS == 'ios' ? false : true}
                            style={{width:width, paddingHorizontal:STAGE_GAME_CARD_MARGIN}}
                            getItemLayout={(data, index) => ({
                                length: height-200,
                                offset: FLATLIST_PADDING_TOP + (height-200) * index,  // 15 پدینگ بالای کل لیست
                                index,
                            })}
                        />
                    }
                </View>
            </LinearGradient>
            <BottomDrawer ref = {Ref => {BottomDrawerHelper.setRef(Ref)}}/>
        </SafeAreaView>
    )
}
const styles = StyleSheet.create({
    container: {
      flex: 1,
      alignItems: 'center',
    }
});
export default StageGame;