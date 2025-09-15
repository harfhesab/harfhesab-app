import React from 'react';
import {StyleSheet, View, Text, Dimensions} from 'react-native';
import {useTheme} from '@react-navigation/native';
import Icon from '../../utils/Icon';
import Font from '../../utils/Font';
import RatingGraph from './RatingGraph';

const width = Dimensions.get('window').width;
const RatingInfo = (props) => {
    const colors = useTheme().colors;
    const rating = []
    const ratingRender = (index)=>{
        return(
            <RatingGraph
                key={index}
                index = {5 - index}
                reviews = {props.reviews}
                number_rating = {props.rating_info[4 - index]}
            />
        )
    }
    for (let index = 0; index < 5; index++) {
        rating.push(ratingRender(index))
    }
    return (
        <View style={styles.container}>
            <View style={{flexDirection:'column', alignItems:'center', justifyContent:'space-between', height:100, width:width * 0.25}}>
                <View style={{height:50, alignItems:'center', alignSelf:'center', marginTop:5}}>
                    <Text style={{fontSize:8, color:colors.text4, fontFamily:Font.light}}>{'میانگین امتیاز'}</Text>
                    <Text style={{fontSize:18, color:colors.text, fontFamily:Font.black}}>{props.rating_average?`${props.rating_average.toFixed(1).toString().replace('.', '/')} `:''}<Icon name='staro' type='AntDesign' style={{color:colors.text, fontSize:18}}/></Text>
                </View>
                <View style={{height:40, alignItems:'center', alignSelf:'center'}}>
                    <Text style={{fontSize:8, color:colors.text4, fontFamily:Font.light}}>{'امتیاز ها و نظرات'}</Text>
                    <Text style={{fontSize:12, color:colors.text4, fontFamily:Font.bold}}>{`${props.reviews.toString()} مرتبه`}</Text>
                </View>
            </View>
            <View style={{flexDirection:'column', alignItems:'flex-end', width:width * 0.75}}>
                {rating}
            </View>
        </View>
    );
};
const styles = StyleSheet.create({
    container:{
        width:width,
        flexDirection:'row',
        alignItems:'center',
        justifyContent:'space-between'
    },
})
export default React.memo(RatingInfo)