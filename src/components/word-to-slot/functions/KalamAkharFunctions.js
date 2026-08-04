import axios from "axios";
import { Dimensions, InteractionManager, NativeModules, StatusBar, View } from 'react-native';
import { goBack, navigate } from "../../../main/navigationService";
import GameAlertHelper from "../../game-alert/GameAlertHelper";
import { successfulCompletionOfStageSound } from "../../../utils/sound/SoundFunctions";
import { store } from "../../../redux/store/Store";
import AlertBottomDrawerHelper from "../../alert-bottom-drawer/AlertBottomDrawerHelper";
import LocalImageComponent from "../../image-components/LocalImageComponent";
import Font from "../../../utils/Font";
import { colors } from "../../../hooks/theme/colors";


export const endOfAChallengeInKalamAkhar = async({title, session, challenge, sentences, stageHint, rewardCoins, rewardSubscription})=>{
    GameAlertHelper.showAlertGame({
        title:`پایان چالش`,
        admiration: "احسنت، عالی بود!",
        description: `چالش ${title} در بازی آنلاین کلام آخر با موفقیت به پایان رسید.`,
        completedSentences: sentences,
        stageHint: stageHint,
        buttons: [
            {
                text: (rewardCoins > 0 || rewardSubscription > 0)?"دریافت جایزه":"ادامه",
                onPress: () => {
                    completedSessionOfKalamAkharChallenge()
                },
                type:'bold'
            },
        ],
        options : {
            type: 'completed-kalam-akhar',
            reward : rewardCoins,
            subscription : rewardSubscription,
            cancelable: false,
            isRewardDisabled: true
        },
    });
    setTimeout(()=>{
        successfulCompletionOfStageSound()
    }, 1000)
}
const completedSessionOfKalamAkharChallenge = async( session, challenge)=>{
    await axios({
        url:'/',
        method:'post',
        data: {
            query : `
            mutation completedSessionOfKalamAkharChallenge(
                $session: ID!
                $challenge: ID!
            ){
                completedSessionOfKalamAkharChallenge(
                    session : $session
                    challenge : $challenge
                ) {
                    status
                    message
                    number_coins
                    subscription_days
                    user_subscription_status{active_subscription, subscription_expiration}
                }
            }
            `,
            variables : {
                "session" : totalCoins,
                "challenge" : challenge,
            }
        }
    }).then(async(response)=>{
        const dataReceived = response.data.data?.completedSessionOfKalamAkharChallenge
        if(dataReceived.status == 200){
            
        }
    }).catch((e)=>{
        
    })
}

