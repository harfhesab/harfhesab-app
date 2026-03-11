import axios from "axios";
import { Dimensions, InteractionManager, NativeModules, StatusBar, View } from 'react-native';
import { goBack, navigate } from "../../../main/navigationService";
import GameAlertHelper from "../../game-alert/GameAlertHelper";
import { successfulCompletionOfSeasonSound, successfulCompletionOfStageSound } from "../../../utils/sound/SoundFunctions";
import { store } from "../../../redux/store/Store";
import {
    endedUserPackageGameProgress,
    getCurrentPackageNextStageInformation,
    makingStageContentReplayableInPackageGame,
    updateUserPackageGameProgress
} from "../../../realm/repositories/user/user-package-game-progress.repository";
import AlertBottomDrawerHelper from "../../alert-bottom-drawer/AlertBottomDrawerHelper";
import LocalImageComponent from "../../image-components/LocalImageComponent";
import Font from "../../../utils/Font";
import { colors } from "../../../hooks/theme/colors";


export const endOfAStageInPackageGame = async({ realm, packageRef, userPackage, packageName, stageId, currentStageId, stageNumber, sentences, stageHint})=>{
    const state = store.getState()
    if(stageId.toString() === currentStageId.toString()){
        const next = getCurrentPackageNextStageInformation(realm, packageRef, userPackage)
        if(next.endAllStage == true){
            if(next?.endPackageAllStage == true && next?.previusEnded == false){
                const updateProgress = await endedUserPackageGameProgress(realm, packageRef, userPackage, stageNumber)
                if(updateProgress == true){
                    const numberCoins = state.coins.numberCoins;
                    const coinsRewardStage = state.constants.coins_reward_from_stage_completed_package_game
                    const coinsRewardSeason = state.constants.coins_reward_from_season_completed_package_game
                    const coinsRewardPackage = coinsRewardSeason*2
                    const totalCoins = numberCoins + coinsRewardStage + coinsRewardPackage
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
                                    setTimeout(()=>{
                                        endedUserPackageGameAlert(packageName, packageRef, coinsRewardPackage)
                                    }, 800)
                                },
                                type:'bold'
                            },
                        ],
                        options : {
                            type: 'completed-stage',
                            reward : coinsRewardStage,
                            cancelable: false,
                        },
                    });
                    setTimeout(()=>{
                        endedUserPackageGameProgressInServer(userPackage, totalCoins)
                    }, 1000)
                }
            } else if(next?.endPackageAllStage == true && next?.previusEnded == true) {
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
                                goBack()
                            },
                            type:'bold'
                        },
                        {
                            onPress: () => {
                                goBack()
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
                                setTimeout(()=>{
                                    endAllStageAlert({stageNumber, packageName, packageRef})
                                }, 800)
                            },
                            type:'bold'
                        },
                    ],
                    options : {
                        type: 'completed-stage',
                        cancelable: false,
                    },
                });
            }
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
const endedUserPackageGameProgressInServer = (userPackage, totalCoins)=>{
    InteractionManager.runAfterInteractions(()=>{
        const run = async ()=>{
            await axios({
                url:'/',
                method:'post',
                data: {
                    query : `
                    mutation endedUserPackageGameProgress(
                        $number_coin : Int,
                        $user_package : ID!,
                    ){
                        endedUserPackageGameProgress(
                            number_coin : $number_coin,
                            user_package : $user_package,
                        ) {
                            status,
                        }
                    }
                    `,
                    variables : {
                        "number_coin" : totalCoins,
                        "user_package" : userPackage,
                    }
                }
            })
        }
        run()
    })
}
const endAllStageAlert = ({stageNumber, packageName, packageRef})=>{
    const {width} = Dimensions.get("window")
    const { ImmersiveMode } = NativeModules;
    const btn = [
        {
            onPress : ()=>{
                ImmersiveMode.exitImmersiveMode()
                navigate("PackageInformation", {_id:packageRef});
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
            text:`مراحل جدید بستهٔ "${packageName}" یافت نشد. از صفحهٔ مربوط به بستهٔ بازی، بررسی کنید که در صورت وجود بروزرسانی، محتوای جدید بستهٔ بازی را دریافت کنید.`,
            style:{ maxWidth:width-30, fontFamily:Font.medium, fontSize:14, color:colors.text.a6, alignSelf:'flex-start', textAlign:'justify', lineHeight:28},
        },
        {
            text:`توجه کنید، بعد از دریافت محتوای جدید، دوباره مرحله ${stageNumber} را بازی کنید تا مرحله ${stageNumber + 1} باز شود.`,
            style:{ maxWidth:width-30, fontFamily:Font.medium, fontSize:14, color:colors.text.a6, alignSelf:'flex-start', textAlign:'justify', lineHeight:28},
        },
    ]
    AlertBottomDrawerHelper.showAlert({
        title:`بروزرسانی بستهٔ بازی "${packageName}"`,
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
const endedUserPackageGameAlert = (packageName, packageRef, coinsRewardPackage)=>{
    const { ImmersiveMode } = NativeModules;
    GameAlertHelper.showAlertGame({
        title:`پایان بستهٔ بازی`,
        admiration: "تبریک!",
        description: `تمام مراحل بستهٔ ${packageName} با موفقیت به اتمام رسید.`,
        moreDescription: `بازخوردتان را نسبت به محتوای این بستهٔ بازی، با دادن یک نظر و امتیاز به اشتراک بگذارید.`,
        buttons: [
            {
                text: 'ثبت نظر و امتیاز',
                onPress: () => {
                    ImmersiveMode.exitImmersiveMode()
                    navigate("PackageInformation", {_id:packageRef});
                },
                type:'bold'
            },
        ],
        options : {
            type: 'completed-package',
            reward : coinsRewardPackage,
            cancelable: true,
        },
    });
    setTimeout(()=>{
        successfulCompletionOfSeasonSound()
    }, 1000)
}

