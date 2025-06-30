import React, {useState, useEffect} from 'react';
import {StyleSheet, View, Text, Dimensions, TouchableOpacity, SafeAreaView} from 'react-native';
import {useTheme} from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import AlertHelper from '../../../components/alert/AlertHelper';
import { checkStageGameContentVersion } from '../../../utils/api/StageGameApi';
import { useDispatch, useSelector } from "react-redux";
import { useRealm } from '../../../realm';

const {width, height} = Dimensions.get("window")
function StageGame(props){
    const {colors} = useTheme().colors;
    const state = useSelector((state) => state.stageGameDownload);
    const dispatch = useDispatch();
    const realm = useRealm();
    const { forceUpdate, versionCreatedContent, versionUpdatedContent, versionDeletedContent } = useSelector((state) => state.stageGamePersist);
    const [loading, setLoading] = useState(true)
    const [getError, setGetError] = useState(false)

    useEffect(() => {
        if(forceUpdate == true){
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
        } else {
            const versionContent = { versionCreatedContent, versionUpdatedContent, versionDeletedContent }
            checkStageGameContentVersion({ dispatch, realm, state, versionContent });
        }
    }, []);
    const getData = async ()=>{
       
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