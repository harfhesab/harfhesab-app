import React, {memo} from 'react';
import {StyleSheet, View, Dimensions, Text, TouchableOpacity} from 'react-native';
import { DotIndicator, MaterialIndicator } from 'react-native-indicators';
import Font from '../../utils/Font';
import ButtonGradient from '../buttons/ButtonGradient';
import useAppTheme from '../../hooks/theme/useAppTheme';
import { colors } from '../../hooks/theme/colors';

const width = Dimensions.get('window').width;
function ScreenLoading({
    loading,
    textColor=colors.text.a1,
    loadingType,
    LoadingComponent,
    getError,
    GetErrorComponent,
    noItem,
    NoItemComponent,
    tryAgain
}){

    

    const renderLoading = ()=>(
        <View style={{width:'100%', height:120, alignItems:'center', justifyContent:'center'}}>
            {
                !loadingType?
                <DotIndicator color={textColor} count={3} size={8}/>:
                loadingType == "DotIndicator"?
                <DotIndicator color={textColor} count={3} size={8}/>:
                loadingType == "MaterialIndicator"&&
                <MaterialIndicator color={textColor} trackWidth={3} size={30}/>
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
                            <Text style={[styles.text1, {color:textColor??colors.text.a1}]}>{"ارتباط برقرار نشد"}</Text>
                            <Text style={[styles.text2, {color:textColor??colors.text.a3}]}>{"متأسفانه مشکلی پیش آمد. لطفا دوباره تلاش کنید."}</Text>
                            <ButtonGradient
                                text={"تلاش مجدد"}
                                textSize={14}
                                onPress={tryAgain}
                                width={"60%"}
                                height={45}
                                borderRadius={10}
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
                            <Text style={[styles.text1, {color:textColor??colors.text.a1}]}>{"موردی یافت نشد"}</Text>
                            <Text style={[styles.text2, {color:textColor??colors.text.a3}]}>{"آیتمی برای نمایش وجود ندارد."}</Text>
                            <ButtonGradient
                                text={"تلاش مجدد"}
                                textSize={14}
                                onPress={tryAgain}
                                width={"60%"}
                                height={45}
                                borderRadius={10}
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
        fontSize: 15,
        textAlign: 'center',
        maxWidth:"70%",
    },
    text2:{
        fontFamily: Font.medium,
        fontSize: 11,
        textAlign: 'center',
        maxWidth:"70%",
        lineHeight:24
    },
})
export default memo(ScreenLoading);