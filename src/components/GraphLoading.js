import React from 'react';
import {StyleSheet, View, Dimensions} from 'react-native';
import {useTheme} from '@react-navigation/native';
import { BarIndicator } from 'react-native-indicators';

const width = Dimensions.get('window').width;
function GraphLoading(props){
    const {colors} = useTheme().colors;
    return(
        <View style={styles.container}>
            <BarIndicator color={colors.color} count={5} size={40}/>
        </View>
    )
}
const styles = StyleSheet.create({
    container:{
        height:370,
        width:width,
        alignItems: 'center',
        justifyContent: 'center'
    }
})
export default React.memo(GraphLoading);