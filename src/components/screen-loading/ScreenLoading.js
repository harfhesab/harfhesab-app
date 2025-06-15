import React, {memo} from 'react';
import {StyleSheet, View, Dimensions, Text, TouchableOpacity} from 'react-native';
import {useTheme} from '@react-navigation/native';
import { DotIndicator, UIActivityIndicator } from 'react-native-indicators';
import Font from '../../utils/Font';
import ButtonGradient from '../buttons/ButtonGradient';

const width = Dimensions.get('window').width;
function ScreenLoading({loading, loadingType, getError, getErrorComponent, noItem, noItemComponent, tryAgain}){
    const {colors} = useTheme().colors;
    

    const renderLoading = ()=>(
        <View style={{width:'100%', height:120, alignItems:'center', justifyContent:'center'}}>
            {
                !loadingType?
                <DotIndicator color={colors.button_gradient.content_1} count={3} size={7}/>:
                loadingType == "DotIndicator"?
                <DotIndicator color={colors.button_gradient.content_1} count={3} size={7}/>:
                loadingType == "UIActivityIndicator"&&
                <UIActivityIndicator color={colors.button_gradient.content_1} count={12} size={15}/>
            }
        </View>
    )

    return(
        <View style={styles.container}>
            {
                getError == true?
                (<>
                    {
                        getErrorComponent?
                        <getErrorComponent/>
                        :
                        <View style={{ width:"100%", height:"100%", flexDirection:'column', alignItems:'center', justifyContent:'center', gap:10}}>
                            <Text style={[styles.text1, {color:colors.text.a1}]}>{"ارتباط برقرار نشد"}</Text>
                            <Text style={[styles.text2, {color:colors.text.a3}]}>{"متأسفانه مشکلی پیش آمد. لطفا دوباره تلاش کنید."}</Text>
                            <ButtonGradient
                                text={"تلاش مجدد"}
                                textSize={14}
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
                        noItemComponent?
                        <noItemComponent/>
                        :
                        <View style={{ width:"100%", height:"100%", flexDirection:'column', alignItems:'center', justifyContent:'center', gap:10}}>
                            <Text style={[styles.text1, {color:colors.text.a1}]}>{"موردی یافت نشد"}</Text>
                            <Text style={[styles.text2, {color:colors.text.a3}]}>{"موردی برای نمایش یافت نشد."}</Text>
                            <ButtonGradient
                                text={"تلاش مجدد"}
                                textSize={14}
                                onPress={tryAgain}
                                width={"60%"}
                                height={45}
                                borderRadius={5}
                            />
                        </View>
                    }
                </>)
                :loading == true&&
                (renderLoading())
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
        fontFamily: Font.medium,
        fontSize: 17,
        textAlign: 'center',
        maxWidth:"60%",
    },
    text2:{
        fontFamily: Font.medium,
        fontSize: 13,
        textAlign: 'center',
        maxWidth:"60%",
    },
})
export default memo(ScreenLoading);