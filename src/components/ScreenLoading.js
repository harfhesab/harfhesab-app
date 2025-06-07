import React from 'react';
import {StyleSheet, View, Dimensions, Text, TouchableOpacity} from 'react-native';
import {useTheme} from '@react-navigation/native';
import { DotIndicator } from 'react-native-indicators';
import Font from '../utils/Font';
import MyTransCall from '../utils/translations/MyTrans';
import LinearGradient from 'react-native-linear-gradient';
import Globals from '../utils/Globals';

const width = Dimensions.get('window').width;
function ScreenLoading(props){
    const colors = useTheme().colors;
    
    return(
        <View style={styles.container}>
            {
                props.getError == true?
                <View style={{ width:width, height:120, alignItems:'center', justifyContent:'center'}}>
                    <Text style={[styles.txt1, {color:colors.text}]}>{MyTransCall.translate('screen_loading', 'get_error1')}</Text>
                    <Text style={[styles.txt2, {color:colors.text4, marginTop:5}]}>{MyTransCall.translate('screen_loading', 'get_error2')}</Text>
                    <TouchableOpacity activeOpacity={0.7} onPress={props.tryAgain} style={{marginTop:25}}>
                        <LinearGradient colors={[Globals.data.configs.colors.primary_gradient_start, Globals.data.configs.colors.primary_gradient_end]} style={{borderRadius:5, width:width*0.6, alignSelf:'center'}}>
                            <View style={styles.tryAgainBtn}>
                                <Text style={[styles.txt2, {color:colors.white}]}>{MyTransCall.translate('screen_loading', 'try_again')}</Text>
                            </View>
                        </LinearGradient>
                    </TouchableOpacity>
                </View>
                :props.notItem == true?
                <>
                {
                    props.notItemComponent?
                    props.notItemComponent()
                    :
                    <View style={{ width:width, height:120, alignItems:'center', justifyContent:'center'}}>
                        <Text style={[styles.txt1, {color:colors.text}]}>{MyTransCall.translate('screen_loading', 'not_item1')}</Text>
                        <Text style={[styles.txt2, {color:colors.text4, marginTop:5}]}>{MyTransCall.translate('screen_loading', 'not_item2')}</Text>
                        <TouchableOpacity activeOpacity={0.7} onPress={props.tryAgain} style={{marginTop:25}}>
                            <LinearGradient colors={[Globals.data.configs.colors.primary_gradient_start, Globals.data.configs.colors.primary_gradient_end]} style={{borderRadius:5, width:width*0.6, alignSelf:'center'}}>
                                <View style={styles.tryAgainBtn}>
                                    <Text style={[styles.txt2, {color:colors.white}]}>{MyTransCall.translate('screen_loading', 'try_again')}</Text>
                                </View>
                            </LinearGradient>
                        </TouchableOpacity>
                    </View>
                }
                </>
                :
                <DotIndicator color={colors.color} count={3} size={8}/>
            }
        </View>
    )
}
const styles = StyleSheet.create({
    container:{
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center'
    },
    txt1:{
        fontFamily: Font.medium,
        fontSize: 17,
        textAlign: 'center',
        width:width*0.6,
    },
    txt2:{
        fontFamily: Font.medium,
        fontSize: 13,
        textAlign: 'center',
        width:width*0.6,
    },
    tryAgainBtn: {
        borderRadius:5,
        width:width*0.6,
        alignSelf:'center',
        height:45,
        alignItems:'center',
        justifyContent:'center'
    }
})
export default React.memo(ScreenLoading);