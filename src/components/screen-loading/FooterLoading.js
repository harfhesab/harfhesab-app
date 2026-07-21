import React, {memo} from 'react';
import {StyleSheet, View, Dimensions, TouchableOpacity, Text, ActivityIndicator} from 'react-native';
import Font from '../../utils/Font';
import useAppTheme from '../../hooks/theme/useAppTheme';

const width = Dimensions.get('window').width
function FooterLoading({loading, tryAgain, tryOperation}){
    const colors = useAppTheme();
    return(
        tryAgain == true?
        (<View style={styles.container}>
            <TouchableOpacity activeOpacity={0.7} onPress={tryOperation} style={{alignItems:'center', justifyContent:'center', borderRadius:5, borderWidth:1, borderColor:colors.border.a1, width:(width-30)/2, height:35}}>
                <Text style={{color:colors.text.a2, fontSize:12, fontFamily:Font.medium}}>{'تلاش دوباره'}</Text>
            </TouchableOpacity>
        </View>)
        :loading == true?
        (<View style={styles.container}>
            <ActivityIndicator color={colors.primary.a3} size={'large'}/>
        </View>)
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
export default memo(FooterLoading);