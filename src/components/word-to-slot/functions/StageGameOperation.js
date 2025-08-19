import axios from "axios";
import AlertHelper from "../../alert/AlertHelper";
import { goBack } from "../../../main/navigationService";


export const complatedOneStageInStageGmae = async({})=>{
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