import React, {memo} from 'react';
import {StyleSheet, View, Dimensions, TouchableOpacity, Text, ActivityIndicator} from 'react-native';
import Font from '../utils/Font';
import useAppTheme from '../hooks/theme/useAppTheme';

const width = Dimensions.get('window').width
function FooterPaginate({loading, tryAgain, tryOperation}){
    const colors = useAppTheme();
    return(
        tryAgain == true?
        <View style={styles.container}>
            <TouchableOpacity activeOpacity={0.7} onPress={tryOperation} style={{alignItems:'center', justifyContent:'center', borderRadius:5, borderWidth:1, borderColor:colors.color, width:(width-30)/2, height:35}}>
                <Text style={{color:colors.text4, fontSize:12, fontFamily:Font.bakh_semi_bold}}>{'تلاش دوباره'}</Text>
            </TouchableOpacity>
        </View>
        :loading == true?
        <View style={styles.container}>
            <ActivityIndicator color={colors.color} size={'large'}/>
        </View>
        :null
    )
}
const styles = StyleSheet.create({
    container:{
        height:60,
        width:width,
        alignItems: 'center',
        justifyContent: "center"
    },
})
export default memo(FooterPaginate);