import axios from "axios";
import { goBack } from "../../../main/navigationService";
import { getCurrentLanguageNextStageInformation, updateUserStageGameProgress, makingStageContentReplayableInStageGame } from "../../../realm/repositories/user/user-stage-game-progress.repository";
import { updateCurrentLanguageLastStageAndLastSeason } from "../../../redux/slices/stageGameSlice";
import GameAlertHelper from "../../game-alert/GameAlertHelper";
import { successfulCompletionOfStageSound } from "../../../utils/sound/SoundFunctions";
import { store } from "../../../redux/store/Store";


export const endOfAStageInStageGame = async({dispatch, realm, language_ref, stageId, currentStageId, stageNumber, sentences})=>{
    const state = store.getState()
    if(stageId.toString() === currentStageId.toString()){
        const next = getCurrentLanguageNextStageInformation(realm, language_ref)
        if(next.endAllStage == true){
            
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
                    admiration: "درود بر شما!",
                    description: `جملات مرحله ${stageNumber} با موفقیت ساخته شد.`,
                    completedSentences: sentences,
                    buttons: [
                        {
                            text: 'ادامه',
                            onPress: () => {
                                goBack()
                                if(next.endCurrentSeason == true){
                                    endOfASeasonInStageGame({seasonNumber:last_season-1})
                                }
                            },
                            type:'bold'
                        },
                        {
                            onPress: () => {
                                goBack()
                                if(next.endCurrentSeason == true){
                                    setTimeout(()=>{
                                        endOfASeasonInStageGame({seasonNumber:last_season-1})
                                    }, 400)
                                }
                            },
                            type:'ads',
                            reward: state.constants.coins_reward_from_play_video_ads_current_stage,
                        }
                    ],
                    options : {
                        type: 'success',
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
            admiration: "درود بر شما!",
            description: `جملات مرحله ${stageNumber} مجددا، با موفقیت ساخته شد.`,
            completedSentences: sentences,
            buttons: [
                {
                    text: 'ادامه',
                    onPress: () => {
                        goBack()
                    },
                    type:'bold'
                },
                {
                    onPress: () => {
                        goBack()
                    },
                    type:'ads',
                    reward: state.constants.coins_reward_from_play_video_ads_previous_stage,
                }
            ],
            options : {
                type: 'success',
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
        description: `مراحل فصل ${seasonNumber} با موفقیت به اتمام رسید.`,
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
            type: 'unlocked',
            reward : state.constants.coins_reward_from_season_completed_stage_game,
            cancelable: false,
        },
    });
}
const updateUserStageGameProgressInServer = async(data, language_ref, totalCoins)=>{
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
                    message,
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
    }).then(async(response)=>{
        null
    }).catch(()=>{
        null
    })
}
