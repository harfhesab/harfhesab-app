import axios from "axios";
import { goBack } from "../../../main/navigationService";
import { getCurrentLanguageNextStageInformation, updateUserStageGameProgress, makingStageContentReplayableInStageGame } from "../../../realm/repositories/user/user-stage-game-progress.repository";
import { updateCurrentLanguageLastStageAndLastSeason } from "../../../redux/slices/stageGameSlice";
import GameAlertHelper from "../../game-alert/GameAlertHelper";
import { successfulCompletionOfStageSound } from "../../../utils/sound/SoundFunctions";


export const endOfAStageInStageGame = async({dispatch, realm, language_ref, stageId, currentStageId, stageNumber, sentences})=>{
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
                                    goBack()
                                }
                            },
                            type:'bold'
                        },
                        {
                            onPress: () => {
                                goBack()
                                if(next.endCurrentSeason == true){
                                    goBack()
                                }
                            },
                            type:'ads'
                        }
                    ],
                    options : {
                        type: 'success',
                        cancelable: false,
                    },
                });
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
                    type:'ads'
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