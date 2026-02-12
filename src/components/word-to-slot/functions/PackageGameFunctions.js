import axios from "axios";
import { InteractionManager } from 'react-native';
import { goBack } from "../../../main/navigationService";
import GameAlertHelper from "../../game-alert/GameAlertHelper";
import { successfulCompletionOfSeasonSound, successfulCompletionOfStageSound } from "../../../utils/sound/SoundFunctions";
import { store } from "../../../redux/store/Store";
import { getCurrentPackageNextStageInformation, makingStageContentReplayableInPackageGame, updateUserPackageGameProgress } from "../../../realm/repositories/user/user-package-game-progress.repository";


export const endOfAStageInPackageGame = async({ realm, packageRef, userPackage, packageName, stageId, currentStageId, stageNumber, sentences, stageHint})=>{
    const state = store.getState()
    if(stageId.toString() === currentStageId.toString()){
        const next = getCurrentPackageNextStageInformation(realm, packageRef, userPackage)
        if(next.endAllStage == true){
            GameAlertHelper.showAlertGame({
                title:`پایان مرحله ${stageNumber}`,
                admiration: "احسنت، عالی بود!",
                description: `جملات مرحله ${stageNumber} بستهٔ ${packageName} با موفقیت ساخته شد.`,
                completedSentences: sentences,
                stageHint: stageHint,
                buttons: [
                    {
                        text: 'ادامه',
                        onPress: () => {
                            goBack()
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
                    type: 'completed-stage',
                    cancelable: false,
                },
            });
        } else {
            const last_season = next?.nextSeason;
            const last_season_number = next?.nextSeasonNumber;
            const last_stage = next?.nextStage;
            const last_stage_number = next?.nextStageNumber;
            const updateProgress = await updateUserPackageGameProgress(realm, userPackage, last_season, last_season_number, last_stage, last_stage_number)
            if(updateProgress == true){
                const data = {
                    lastStage: last_stage,
                    lastStageNumber: last_stage_number,
                    lastSeason: last_season,
                    lastSeasonNumber: last_season_number  
                }
                const numberCoins = state.coins.numberCoins;
                const coinsReward = state.constants.coins_reward_from_stage_completed_package_game
                const totalCoins = numberCoins + coinsReward
                GameAlertHelper.showAlertGame({
                    title:`پایان مرحله ${stageNumber}`,
                    admiration: "احسنت، عالی بود!",
                    description: `جملات مرحله ${stageNumber} بستهٔ ${packageName} با موفقیت ساخته شد.`,
                    completedSentences: sentences,
                    stageHint: stageHint,
                    buttons: [
                        {
                            text: 'ادامه',
                            onPress: () => {
                                goBack()
                                if(next.endCurrentSeason == true){
                                    setTimeout(()=>{
                                        endOfASeasonInStageGame({seasonNumber:last_season_number-1, packageName})
                                    }, 500)
                                }
                            },
                            type:'bold'
                        },
                        {
                            onPress: () => {
                                goBack()
                                if(next.endCurrentSeason == true){
                                    setTimeout(()=>{
                                        endOfASeasonInStageGame({seasonNumber:last_season_number-1, packageName})
                                    }, 500)
                                }
                            },
                            type:'ads',
                            reward: state.constants.coins_reward_from_play_video_ads_current_stage,
                        }
                    ],
                    options : {
                        type: 'completed-stage',
                        reward : coinsReward,
                        cancelable: false,
                    },
                });
                setTimeout(()=>{
                    updateUserPackageGameProgressInServer(data, userPackage, totalCoins)
                }, 1000)
            }
        }
    } else {
        GameAlertHelper.showAlertGame({
            title:`پایان مرحله ${stageNumber}`,
            admiration: "احسنت، عالی بود!",
            description: `جملات مرحله ${stageNumber} بستهٔ ${packageName} مجددا، با موفقیت ساخته شد.`,
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
                    onPress: () => {
                        goBack()
                    },
                    type:'ads',
                    reward: state.constants.coins_reward_from_play_video_ads_previous_stage,
                }
            ],
            options : {
                type: 'completed-stage',
                cancelable: false,
            },
        });
    }
    makingStageContentReplayableInPackageGame(realm, stageId)
    setTimeout(()=>{
        successfulCompletionOfStageSound()
    }, 1000)
}
const endOfASeasonInStageGame = ({seasonNumber, packageName})=>{
    const state = store.getState()
    GameAlertHelper.showAlertGame({
        title:`پایان فصل ${seasonNumber}`,
        admiration: "تبریک!",
        description: `مراحل فصل ${seasonNumber} بستهٔ ${packageName} با موفقیت به اتمام رسید.`,
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
            reward : state.constants.coins_reward_from_season_completed_package_game,
            cancelable: false,
        },
    });
    setTimeout(()=>{
        successfulCompletionOfSeasonSound()
    }, 1000)
}
const updateUserPackageGameProgressInServer = (data, userPackage, totalCoins)=>{
    InteractionManager.runAfterInteractions(()=>{
        const run = async ()=>{
            await axios({
                url:'/',
                method:'post',
                data: {
                    query : `
                    mutation updateUserPackageGameProgress(
                        $number_coin : Int,
                        $user_package : ID!,
                        $last_season : ID!,
                        $last_season_number : Int!,
                        $last_stage : ID!,
                        $last_stage_number : Int!,
                    ){
                        updateUserPackageGameProgress(
                            number_coin : $number_coin,
                            user_package : $user_package,
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
                        "user_package" : userPackage,
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
