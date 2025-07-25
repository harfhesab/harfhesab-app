import {StyleSheet, View, Text, Dimensions} from 'react-native';
import Font from '../utils/Font';
import Icon from '../utils/Icon';
import useAppTheme from '../hooks/theme/useAppTheme';

const width = Dimensions.get('window').width;
const ToastConfig = {
    success: ({ text1, text2 }) => (
        Toast({ text1, text2, type:"success" })
    ),
    error: ({ text1, text2 }) => (
        Toast({ text1, text2, type:"error" })
    ),
    info: ({ text1, text2 }) => (
        Toast({ text1, text2, type:"info" })
    ),
};
const Toast = ({text1, text2, type})=>{
    const colors = useAppTheme();
    const iconName = type == "success"?"sticker-check":type == "error"?"sticker-alert":type == "info"&&"sticker-text"
    return(
        <View style={[styles.box, {backgroundColor:colors.toast.background, borderStartColor:colors.toast[type], shadowColor:colors.shadow.a1}]}>
            {   
                text1&&
                <View style={{flexDirection:text2?'row':'column', alignItems:text2?'center':'flex-start', justifyContent:text2?'flex-start':'center', gap:10}}>
                    <Icon name={iconName} type={"MaterialCommunityIcons"} style={{fontSize:22, color:colors.toast[type]}}/>
                    <Text style={[styles.text1, {color:colors.toast.text1, fontSize:text2?16:14, fontFamily:text2?Font.bold:Font.medium}]}>{text1}</Text>
                </View>
            }
            {
                text2&&
                <Text style={[styles.text2, {color:text1?colors.toast.text2:colors.toast.text1}]}>{text2}</Text>
            }
        </View>
    )
}
const styles = StyleSheet.create({
    box: {
        width: width - 40,
        borderRadius:7,
        borderStartWidth:7,
        alignItems:'flex-start',
        justifyContent:'center',
        paddingVertical: 15,
        paddingHorizontal:15,
        gap:5,
        elevation:5
    },
    text1: {
        textAlign:'justify',
        lineHeight:23,
        maxWidth: width - 100
    },
    text2: {
        fontFamily:Font.medium,
        fontSize:14,
        textAlign:'justify',
        lineHeight:23,
    },
})
export default ToastConfig;