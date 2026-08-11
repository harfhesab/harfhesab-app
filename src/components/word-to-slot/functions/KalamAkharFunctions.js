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
import { updateSubscriptionStatus } from "../../../redux/slices/subscriptionSlice";
import { increaseNumberCoins } from "../../../redux/slices/coinSlice";


export const endOfAChallengeInKalamAkhar = async({dispatch, title, session, challengeId, sentences, stageHint, rewardCoins, rewardSubscription})=>{
    GameAlertHelper.showAlertGame({
        title:`پایان چالش`,
        admiration: "احسنت، عالی بود!",
        description: `چالش ${title} در بازی آنلاین کلام آخر با موفقیت به پایان رسید.`,
        completedSentences: sentences,
        stageHint: stageHint,
        buttons: [
            {
                text: (rewardCoins > 0 || rewardSubscription > 0)?"دریافت جایزه":"پایان چالش",
                onPress: () => {
                    GameAlertHelper.changeLoading({
                        loadingValue:true,
                        loadingMessage:"در حال دریافت و اعمال جایزه..."
                    })
                    completedSessionOfKalamAkharChallenge(dispatch, session, challengeId)
                },
                type:'bold',
                preventClose:true
            },
        ],
        options : {
            lottie: 'success',
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
const completedSessionOfKalamAkharChallenge = async(dispatch, session, challengeId)=>{
    const state = store.getState()
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
                "session" : session,
                "challenge" : challengeId,
            }
        }
    }).then(async(response)=>{
        const dataReceived = response.data.data?.completedSessionOfKalamAkharChallenge
        if(dataReceived.status == 200){
            GameAlertHelper.changeLoading({
                loadingValue:false,
                loadingMessage:(dataReceived?.number_coins > 0 || dataReceived?.subscription_days > 0)?"جایزهٔ چالش با موفقیت دریافت شد.":"چالش با موفقیت به اتمام رسید."
            })
            if(dataReceived?.number_coins > 0){
                dispatch(increaseNumberCoins({ number: dataReceived.number_coins }));
            }
            if(dataReceived?.subscription_days > 0 && dataReceived?.user_subscription_status){
                const activeSubscription = dataReceived.user_subscription_status?.active_subscription;
                const subscriptionExpiration = dataReceived.user_subscription_status?.subscription_expiration;
                dispatch(updateSubscriptionStatus({activeSubscription, subscriptionExpiration}))
            }
            GameAlertHelper.changeButtons({
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
                        type:'ads',
                        reward: state.constants.free_coin_view_ads,
                        adsPosition: "kalam_akhar_challenge"
                    }
                ],
            })
        }
    }).catch((e)=>{
        GameAlertHelper.changeLoading({
            loadingValue:false,
            loadingMessage:"مشکلی در دریافت جایزه پیش آمد. اتصال اینترنت خود را بررسی کرده و دوباره تلاش کنید."
        })
    })
}

