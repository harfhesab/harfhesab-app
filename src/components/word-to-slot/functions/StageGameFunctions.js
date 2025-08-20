import axios from "axios";
import AlertHelper from "../../alert/AlertHelper";
import { goBack } from "../../../main/navigationService";
import { getCurrentLanguageNextStageInformation } from "../../../realm/repositories/user/user-stage-game-progress.repository";


export const endOfAStageInStageGame = async({realm, language})=>{
    const next = getCurrentLanguageNextStageInformation({realm, language})
    AlertHelper.showAlert({
        body: `تبریک! مرحله ${stageNumber} با موفقیت کامل شد.`,
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