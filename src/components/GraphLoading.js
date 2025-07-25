import React from 'react';
import {StyleSheet, View, Dimensions} from 'react-native';
import { BarIndicator } from 'react-native-indicators';
import useAppTheme from '../hooks/theme/useAppTheme';

const width = Dimensions.get('window').width;
function GraphLoading(props){
    const colors = useAppTheme();
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