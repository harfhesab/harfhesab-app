import axios from "axios";
import AlertHelper from "../../alert/AlertHelper";
import { goBack } from "../../../main/navigationService";
import { getCurrentLanguageNextStageInformation, updateUserStageGameProgress } from "../../../realm/repositories/user/user-stage-game-progress.repository";
import { updateCurrentLanguageLastStageAndLastSeason } from "../../../redux/slices/stageGameSlice";


export const endOfAStageInStageGame = async({dispatch, realm, language_ref, stageId, currentStageId})=>{
    if(stageId.toString() === currentStageId.toString()){
        const next = getCurrentLanguageNextStageInformation(realm, language_ref)
        if(next.endAllStage == true){
            
        } else {
            const last_season = next?.nextSeason;
            const last_season_number = next?.nextSeasonNumber;
            const last_stage = next?.nextStage;
            const last_stage_number = next?.nextStageNumber;
            const updateProgress = await updateUserStageGameProgress(realm, language_ref, last_season, last_season_number, last_stage, last_stage_number)
            console.log("111111111111111111", updateProgress)
            if(updateProgress == true){
                const data = {
                    lastStage: last_stage,
                    lastStageNumber: last_stage_number,
                    lastSeason: last_season,
                    lastSeasonNumber: last_season_number  
                }
                await dispatch(updateCurrentLanguageLastStageAndLastSeason(data))
                AlertHelper.showAlert({
                    body: `تبریک! مرحله ${next?.nextStage - 1} با موفقیت کامل شد.`,
                    buttons: [
                        {
                            text: 'ادامه',
                            onPress: () => {
                                goBack()
                            },
                            type:'bold'
                        },
                    ],
                    options : {
                        type: 'success',
                        cancelable: false,
                        bodyAlign:'center',
                        textAlign:'center'
                    },
                });
            }
        }
    } else {
        
    }
}