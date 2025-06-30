import React, {memo} from 'react';
import {StyleSheet, View, Dimensions, Text, TouchableOpacity} from 'react-native';
import {useTheme} from '@react-navigation/native';
import { DotIndicator, MaterialIndicator, BallIndicator } from 'react-native-indicators';
import Font from '../../utils/Font';
import ButtonGradient from '../buttons/ButtonGradient';

const width = Dimensions.get('window').width;
function ScreenLoading({loading, loadingType, LoadingComponent, getError, GetErrorComponent, noItem, NoItemComponent, tryAgain}){
    const {colors} = useTheme().colors;
    

    const renderLoading = ()=>(
        <View style={{width:'100%', height:120, alignItems:'center', justifyContent:'center'}}>
            {
                !loadingType?
                <DotIndicator color={colors.text.a1} count={3} size={8}/>:
                loadingType == "DotIndicator"?
                <DotIndicator color={colors.text.a1} count={3} size={8}/>:
                loadingType == "MaterialIndicator"&&
                <MaterialIndicator color={colors.text.a1} trackWidth={3} size={30}/>
            }
        </View>
    )

    return(
        <View style={styles.container}>
            {
                getError == true?
                (<>
                    {
                        GetErrorComponent?
                        <GetErrorComponent/>
                        :
                        <View style={{ width:"100%", height:"100%", flexDirection:'column', alignItems:'center', justifyContent:'center', gap:10}}>
                            <Text style={[styles.text1, {color:colors.text.a1}]}>{"ارتباط برقرار نشد"}</Text>
                            <Text style={[styles.text2, {color:colors.text.a3}]}>{"متأسفانه مشکلی پیش آمد. لطفا دوباره تلاش کنید."}</Text>
                            <ButtonGradient
                                text={"تلاش مجدد"}
                                textSize={16}
                                onPress={tryAgain}
                                width={"60%"}
                                height={45}
                                borderRadius={5}
                            />
                        </View>
                    }
                </>)
                :noItem == true?
                (<>
                    {
                        NoItemComponent?
                        <NoItemComponent/>
                        :
                        <View style={{ width:"100%", height:"100%", flexDirection:'column', alignItems:'center', justifyContent:'center', gap:10}}>
                            <Text style={[styles.text1, {color:colors.text.a1}]}>{"موردی یافت نشد"}</Text>
                            <Text style={[styles.text2, {color:colors.text.a3}]}>{"موردی برای نمایش یافت نشد."}</Text>
                            <ButtonGradient
                                text={"تلاش مجدد"}
                                textSize={16}
                                onPress={tryAgain}
                                width={"60%"}
                                height={45}
                                borderRadius={5}
                            />
                        </View>
                    }
                </>)
                :loading == true&&
                <>
                    {
                        LoadingComponent?
                        <LoadingComponent/>
                        :
                        (renderLoading())
                    }
                </>
            }
        </View>
    )
}
const styles = StyleSheet.create({
    container:{
        width: '100%',
        height: '100%',
        alignItems: 'center',
        justifyContent: 'center'
    },
    text1:{
        fontFamily: Font.bold,
        fontSize: 20,
        textAlign: 'center',
        maxWidth:"60%",
    },
    text2:{
        fontFamily: Font.medium,
        fontSize: 16,
        textAlign: 'center',
        maxWidth:"60%",
        lineHeight:28
    },
})
export default memo(ScreenLoading);