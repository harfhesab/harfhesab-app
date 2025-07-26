import React, {useState, useEffect} from 'react';
import {StyleSheet, View, Text, Dimensions, TouchableOpacity, SafeAreaView} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import AlertHelper from '../../../components/alert/AlertHelper';
import { checkStageGameContentVersion } from '../../../utils/api/StageGameApi';
import { useDispatch, useSelector } from "react-redux";
import { useRealm } from '../../../realm';
import { getStageSeasonsByLanguage } from '../../../realm/repositories/stage-game/stage-season.repository';
import BottomDrawer from '../../../components/bottom-drawer/BottomDrawer';
import BottomDrawerHelper from '../../../components/bottom-drawer/BottomDrawerHelper';
import { getAllLanguages } from '../../../realm/repositories/general/language.repository';
import { changeStageGameLanguage } from '../../../redux/slices/stageGamePersistSlice';
import useAppTheme from '../../../hooks/theme/useAppTheme';

const {width, height} = Dimensions.get("window")
function StageGame(props){
    const colors = useAppTheme()
    const state = useSelector((state) => state.stageGameDownload);
    const dispatch = useDispatch();
    const realm = useRealm();
    const { stageGameLanguage, forceUpdate, versionCreatedContent, versionUpdatedContent, versionDeletedContent } = useSelector((state) => state.stageGamePersist);
    const [loading, setLoading] = useState(true)
    const [getError, setGetError] = useState(false)
    const [page, setPage] = useState(1)

    useEffect(() => {
        props.navigation.navigate("ConnectingLetters")
        startFirst()
    }, []);
    const startFirst = async() =>{
        if(stageGameLanguage){
            getData()
        }
        if(versionCreatedContent == 0){
            AlertHelper.showAlert({
                body: "برای شروع بازی، محتوای بازی مرحله‌ای را دریافت کنید.",
                buttons: [
                    {
                        text: 'دریافت محتوا',
                        onPress: () => {
                            props.navigation.navigate("StageGameUpdateScreen")
                        },
                        type:'bold'
                    },
                ],
                options : {
                    type: 'warning',
                    cancelable: false,
                    bodyAlign:'center',
                    textAlign:'center',
                },
            });
        } else if(forceUpdate == true){
            AlertHelper.showAlert({
                body: "یک بروزرسانی اجباری برای محتوای بازی مرحله‌ای یافت شد. برای دریافت آن اقدام کنید.",
                buttons: [
                    {
                        text: 'دریافت بروزرسانی',
                        onPress: () => {
                            props.navigation.navigate("StageGameUpdateScreen")
                        },
                        type:'bold'
                    },
                ],
                options : {
                    type: 'warning',
                    cancelable: false,
                    bodyAlign:'flex-start',
                    textAlign:'flex-start'
                },
            });
        } else if(!stageGameLanguage){
            getLanguages()
        } else {
            const versionContent = { versionCreatedContent, versionUpdatedContent, versionDeletedContent }
            checkStageGameContentVersion({ dispatch, realm, state, versionContent });
        }
    }
    const getLanguages = ()=>{
        const languages = getAllLanguages(realm)
        BottomDrawerHelper.showBottomDrawer({
            title:"برای شروع بازی مرحله‌ای یکی از زبان های زیر را انتخاب کنید.",
            list: languages.map(item => ({
                text1: item.name
            })),
            buttons:[
                {
                    onPress : ({radio})=>{
                        const selected = languages[radio]._id
                        dispatch(changeStageGameLanguage({language:selected}))
                        getData(selected)
                    },
                    text: 'انتخاب زبان',
                    loading: true,
                    type: "bold"
                },
            ],
            options:{
                listType: "radio-button",
                cancelable: false,
                selectRequired: true
            }
        })
    }
    const getData = async (selected)=>{
       const language = selected ?? stageGameLanguage
       const seasons = getStageSeasonsByLanguage(realm, language)
       console.log(seasons[0])
       BottomDrawerHelper.hideBottomDrawer()
    }
    const tryAgain = ()=>{
        setLoading(true)
        setGetError(false)
        getData()
    }
    
    return(
        <SafeAreaView>
            <LinearGradient colors={colors.background_gradient} style={{width:width, height:height}}>
                <View style={styles.container}>
                    
                </View>
            </LinearGradient>
            <BottomDrawer ref = {Ref => {BottomDrawerHelper.setRef(Ref)}}/>
        </SafeAreaView>
    )
}
const styles = StyleSheet.create({
    container: {
      flex: 1,
      alignItems: 'center',
    }
});
export default StageGame;