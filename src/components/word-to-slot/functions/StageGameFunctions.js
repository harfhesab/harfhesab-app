import axios from "axios";
import { Dimensions, InteractionManager, View } from 'react-native';
import { goBack, navigate } from "../../../main/navigationService";
import { getCurrentLanguageNextStageInformation, updateUserStageGameProgress, makingStageContentReplayableInStageGame } from "../../../realm/repositories/user/user-stage-game-progress.repository";
import { updateCurrentLanguageLastStageAndLastSeason } from "../../../redux/slices/stageGameSlice";
import GameAlertHelper from "../../game-alert/GameAlertHelper";
import { successfulCompletionOfSeasonSound, successfulCompletionOfStageSound } from "../../../utils/sound/SoundFunctions";
import { store } from "../../../redux/store/Store";
import { colors } from "../../../hooks/theme/colors";
import LocalImageComponent from "../../image-components/LocalImageComponent";
import AlertBottomDrawerHelper from "../../alert-bottom-drawer/AlertBottomDrawerHelper";
import Font from "../../../utils/Font";


export const endOfAStageInStageGame = async({dispatch, realm, language_ref, stageId, currentStageId, stageNumber, sentences, stageHint})=>{
    const state = store.getState()
    if(stageId.toString() === currentStageId.toString()){
        const next = getCurrentLanguageNextStageInformation(realm, language_ref)
        if(next.endAllStage == true){
            const languageName = state.stageGamePersist.stageGameLanguageName
            GameAlertHelper.showAlertGame({
                title:`پایان مرحله ${stageNumber}`,
                admiration: "احسنت، عالی بود!",
                description: `جملات مرحله ${stageNumber} زبان ${languageName} با موفقیت ساخته شد.`,
                completedSentences: sentences,
                stageHint: stageHint,
                buttons: [
                    {
                        text: 'ادامه',
                        onPress: () => {
                            goBack()
                            goBack()
                            setTimeout(()=>{
                                endAllStageAlert({stageNumber, languageName})
                            }, 800)
                        },
                        type:'bold'
                    },
                    {
                        type:'ads',
                        reward: state.constants.coins_reward_from_play_video_ads_previous_stage,
                        adsPosition: "stage_game_completed_stage"
                    }
                ],
                options : {
                    type: 'completed-stage',
                    cancelable: false,
                },
            });
        } else {
            const last_season = next?.nextSeason;
            const last_season_number = next?.nextSeasonNumber;
            const last_stage = next?.nextStage;
            const last_stage_number = next?.nextStageNumber;
            const updateProgress = await updateUserStageGameProgress(realm, language_ref, last_season, last_season_number, last_stage, last_stage_number)
            if(updateProgress == true){
                const data = {
                    lastStage: last_stage,
                    lastStageNumber: last_stage_number,
                    lastSeason: last_season,
                    lastSeasonNumber: last_season_number  
                }
                const numberCoins = state.coins.numberCoins;
                const coinsReward = state.constants.coins_reward_from_stage_completed_stage_game
                const totalCoins = numberCoins + coinsReward
                await dispatch(updateCurrentLanguageLastStageAndLastSeason(data))
                GameAlertHelper.showAlertGame({
                    title:`پایان مرحله ${stageNumber}`,
                    admiration: "احسنت، عالی بود!",
                    description: `جملات مرحله ${stageNumber} زبان ${state.stageGamePersist.stageGameLanguageName} با موفقیت ساخته شد.`,
                    completedSentences: sentences,
                    stageHint: stageHint,
                    buttons: [
                        {
                            text: 'ادامه',
                            onPress: () => {
                                goBack()
                                if(next.endCurrentSeason == true){
                                    setTimeout(()=>{
                                        endOfASeasonInStageGame({seasonNumber:last_season_number-1})
                                    }, 500)
                                }
                            },
                            type:'bold'
                        },
                        {
                            type:'ads',
                            reward: state.constants.coins_reward_from_play_video_ads_current_stage,
                            adsPosition: "stage_game_completed_stage"
                        }
                    ],
                    options : {
                        type: 'completed-stage',
                        reward : coinsReward,
                        cancelable: false,
                    },
                });
                setTimeout(()=>{
                    updateUserStageGameProgressInServer(data, language_ref, totalCoins)
                }, 1000)
            }
        }
    } else {
        GameAlertHelper.showAlertGame({
            title:`پایان مرحله ${stageNumber}`,
            admiration: "احسنت، عالی بود!",
            description: `جملات مرحله ${stageNumber} زبان ${state.stageGamePersist.stageGameLanguageName} مجددا، با موفقیت ساخته شد.`,
            completedSentences: sentences,
            stageHint: stageHint,
            buttons: [
                {
                    text: 'ادامه',
                    onPress: () => {
                        goBack()
                    },
                    type:'bold'
                },
                {
                    type:'ads',
                    reward: state.constants.coins_reward_from_play_video_ads_previous_stage,
                    adsPosition: "stage_game_completed_stage"
                }
            ],
            options : {
                type: 'completed-stage',
                cancelable: false,
            },
        });
    }
    makingStageContentReplayableInStageGame(realm, stageId)
    setTimeout(()=>{
        successfulCompletionOfStageSound()
    }, 1000)
}
const endOfASeasonInStageGame = ({seasonNumber})=>{
    const state = store.getState()
    GameAlertHelper.showAlertGame({
        title:`پایان فصل ${seasonNumber}`,
        admiration: "تبریک!",
        description: `مراحل فصل ${seasonNumber} زبان ${state.stageGamePersist.stageGameLanguageName} با موفقیت به اتمام رسید.`,
        buttons: [
            {
                text: "شروع فصل جدید",
                onPress: () => {
                    goBack()
                },
                type:'bold'
            }
        ],
        options : {
            type: 'completed-season',
            reward : state.constants.coins_reward_from_season_completed_stage_game,
            cancelable: false,
        },
    });
    setTimeout(()=>{
        successfulCompletionOfSeasonSound()
    }, 1000)
}
const updateUserStageGameProgressInServer = (data, language_ref, totalCoins)=>{
    InteractionManager.runAfterInteractions(()=>{
        const run = async ()=>{
            await axios({
                url:'/',
                method:'post',
                data: {
                    query : `
                    mutation updateUserStageGameProgress(
                        $number_coin : Int,
                        $language_ref : ID!,
                        $last_season : ID!,
                        $last_season_number : Int!,
                        $last_stage : ID!,
                        $last_stage_number : Int!,
                    ){
                        updateUserStageGameProgress(
                            number_coin : $number_coin,
                            language_ref : $language_ref,
                            last_season : $last_season,
                            last_season_number : $last_season_number,
                            last_stage : $last_stage,
                            last_stage_number : $last_stage_number,
                        ) {
                            status,
                        }
                    }
                    `,
                    variables : {
                        "number_coin" : totalCoins,
                        "language_ref" : language_ref,
                        "last_season" : data.lastSeason,
                        "last_season_number" : data.lastSeasonNumber,
                        "last_stage" : data.lastStage,
                        "last_stage_number" : data.lastStageNumber,
                    }
                }
            })
        }
        run()
    })
}
const endAllStageAlert = ({stageNumber, languageName})=>{
    const {width} = Dimensions.get("window")
    const btn = [
        {
            onPress : ()=>{
                navigate("StageGameUpdateScreen")
            },
            text: "بروزرسانی محتوا",
            loading: false,
            type: "bold",
        },
        {
            onPress : ()=>{},
            text: "متوجه شدم",
            loading: false,
            type: "border",
        },
    ]
    const msg = [
        {
            text:"مرحلهٔ بعدی یافت نشد!",
            style:{ maxWidth:width-65, fontFamily:Font.bold, fontSize:20, color:colors.alert.a1, alignSelf:'flex-start', textAlign:'justify', lineHeight:30},
        },
        {
            text:`مراحل جدید زبان ${languageName} یافت نشد. از قسمت بروزرسانی بازی مرحله‌ای، محتوای جدید بازی مرحله‌ای را دریافت کنید.`,
            style:{ maxWidth:width-30, fontFamily:Font.medium, fontSize:14, color:colors.text.a6, alignSelf:'flex-start', textAlign:'justify', lineHeight:28},
        },
        {
            text:`توجه کنید، بعد از دریافت محتوای جدید، دوباره مرحله ${stageNumber} زبان ${languageName} را بازی کنید تا مرحله ${stageNumber + 1} باز شود.`,
            style:{ maxWidth:width-30, fontFamily:Font.medium, fontSize:14, color:colors.text.a6, alignSelf:'flex-start', textAlign:'justify', lineHeight:28},
        },
    ]
    AlertBottomDrawerHelper.showAlert({
        title:"بروزرسانی بازی مرحله‌ای",
        message: msg,
        buttons:btn,
        options:{
            cancelable: true,
            icon:{
                Icon:()=>(
                    <View style={{width:width, alignItems:'center'}}>
                        <LocalImageComponent
                            path={require('../../../assets/image/download.png')}
                            width={40}
                            height={40}
                            resizeMode={'stretch'}
                            blank_background={true}
                        />
                    </View>
                )
            }
        }
    })
}
