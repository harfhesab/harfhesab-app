import {StyleSheet, View, Text, Dimensions} from 'react-native';
import Font from '../utils/Font';

const width = Dimensions.get('window').width;
const ToastConfig = {
    success: ({ text2, text1 }) => (
        <View style={[styles.box, {backgroundColor:'rgba(0, 126, 51, 0.95)'}]}>
            <Text style={styles.text1}>{text1}</Text>
            {
                text2&&
                <Text style={styles.text2}>{text2}</Text>
            }
        </View>
    ),
    error: ({ text2, text1 }) => (
        <View style={[styles.box, {backgroundColor:'rgba(204, 0, 0, 0.95)'}]}>
            <Text style={styles.text1}>{text1}</Text>
            {
                text2&&
                <Text style={styles.text2}>{text2}</Text>
            }
        </View>
    ),
    warning: ({ text2, text1 }) => (
        <View style={[styles.box, {backgroundColor:'rgba(255, 136, 0, 0.95)'}]}>
            <Text style={styles.text1}>{text1}</Text>
            {
                text2&&
                <Text style={styles.text2}>{text2}</Text>
            }
        </View>
    ),
    info: ({ text2, text1 }) => (
        <View style={[styles.box, {backgroundColor:'rgba(0, 153, 204, 0.95)'}]}>
            <Text style={styles.text1}>{text1}</Text>
            {
                text2&&
                <Text style={styles.text2}>{text2}</Text>
            }
        </View>
    ),
    toast:({ text2, text1 }) => (
        <View style={[styles.box, {backgroundColor:'rgba(0,0,0,0.85)'}]}>
            <Text style={styles.text1}>{text1}</Text>
            {
                text2&&
                <Text style={styles.text2}>{text2}</Text>
            }
        </View>
    ),
};
const styles = StyleSheet.create({
    box: {
        width: width - 60,
        borderRadius:5,
        alignItems:'center',
        justifyContent:'center',
        paddingVertical: 10,
    },
    text1: {
        fontFamily:Font.medium,
        fontSize:13,
        color:'#FFF',
        textAlign:'center',
        width:width - 80,
        lineHeight:24
    },
    text2: {
        fontFamily:Font.light,
        fontSize:11,
        color:'#FFF',
        textAlign:'center',
        width:width - 80,
        marginTop:5
    },
})
export default ToastConfig;