import axios from "axios";
import { goBack } from "../../../main/navigationService";
import GameAlertHelper from "../../game-alert/GameAlertHelper";
import { successfulCompletionOfConnectingLetterSound } from "../../../utils/sound/SoundFunctions";
import { store } from "../../../redux/store/Store";



export const unknownWordCompletedInPackageGame = async()=>{
    const state = store.getState()
    GameAlertHelper.showAlertGame({
        title: "کشف واژهٔ نامعلوم",
        admiration: "احسنت، عالی بود!",
        description: `کلمه نامعلوم با موفقیت ساخته شد.`,
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
                reward: state.constants.coins_reward_from_play_video_ads_unknown_word,
                adsPosition: "package_game_completed_word",
            }
        ],
        options : {
            type: 'completed-word',
            cancelable: false,
        },
    });
    setTimeout(()=>{
        successfulCompletionOfConnectingLetterSound()
    }, 1000)
}