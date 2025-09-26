import React from 'react';
import {StyleSheet, View, Text, Dimensions} from 'react-native';
import Icon from '../../utils/Icon';
import Font from '../../utils/Font';
import RatingGraph from './RatingGraph';
import useAppTheme from '../../hooks/theme/useAppTheme';

const width = Dimensions.get('window').width;
const RatingInfo = ({reviews, rating_info, rating_average}) => {
    const colors = useAppTheme()
    const rating = []
    const ratingRender = (index)=>{
        return(
            <RatingGraph
                key={index}
                index = {5 - index}
                reviews = {reviews}
                number_rating = {rating_info[4 - index]}
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
                    <Text style={{fontSize:8, color:colors.text.a2, fontFamily:Font.light}}>{'میانگین امتیاز'}</Text>
                    <Text style={{fontSize:18, color:colors.text.a2, fontFamily:Font.black}}>{rating_average?`${rating_average.toFixed(1).toString().replace('.', '/')} `:''}<Icon name='staro' type='AntDesign' style={{color:colors.text.a2, fontSize:18}}/></Text>
                </View>
                <View style={{height:40, alignItems:'center', alignSelf:'center'}}>
                    <Text style={{fontSize:8, color:colors.text.a2, fontFamily:Font.light}}>{'امتیاز ها و نظرات'}</Text>
                    <Text style={{fontSize:12, color:colors.text.a3, fontFamily:Font.bold}}>{`${reviews.toString()} مرتبه`}</Text>
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