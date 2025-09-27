import React,{useEffect, useState} from 'react';
import {StyleSheet, View, Text, Animated, Dimensions} from 'react-native';
import Icon from '../../utils/Icon';
import Font from '../../utils/Font';
import Globals from '../../utils/Globals';
import useAppTheme from '../../hooks/theme/useAppTheme';

const width = Dimensions.get('window').width;
const RatingGraph = (props) => {
    const colors = useAppTheme()
    const [numberRating, setNumberRating] = useState(props.number_rating)
    const [reviews, setReviews] = useState(props.reviews)
    const [Animation, setAnimation] = useState(new Animated.Value(0))
    useEffect(() => {
        setReviews(props.reviews)
    }, [props.reviews])
    useEffect(() => {
        setNumberRating(props.number_rating)
    }, [props.number_rating])
    const ShowScorse = ()=>{
        const output = numberRating / reviews * (width * 0.57) 
        const Animation_Interpolate = Animation.interpolate({
            inputRange:[0, 1], 
            outputRange: [-(width * 0.57),output - width * 0.57]
        })
        Animated.timing(
            Animation,
            {
                toValue:1,
                duration:1200,
                useNativeDriver: true
            }
        ).start()
        return(
            <Animated.View style={[ styles.Root_Sliding_Drawer_Container,{ transform :[{ translateX: Animation_Interpolate }],width:output, height:7}]}>
                <View style={[{borderRadius:2},{width:output, height:7, backgroundColor:colors.primary.a1, alignSelf:'flex-start'}]}/>
            </Animated.View>
        )
    }
    return (
        <View style={{ height:20, width:width * 0.75 -20, flexDirection:'row', justifyContent:'flex-end', alignItems:'center', paddingEnd:width * 0.11}}>
            <Text style={{fontSize:10, color:colors.text.a4, fontFamily:Font.medium, height:20, textAlignVertical:'center', marginEnd:5}}>{numberRating}</Text>
            <View style={[{borderRadius:2},{width:width * 0.57, height:7, backgroundColor:colors.border.a1}]}>
            {
                reviews > 0?
                ShowScorse()
                :null
            }
            </View>
            <View style={{width:width * 0.11, height:20 ,position:'absolute', flexDirection:'row', alignItems:'center', justifyContent:'flex-end'}}>
                <Icon name='star' type='AntDesign' style={{fontSize:10, color:colors.text.a4}}/>
                <Text style={{fontSize:10, color:colors.text.a4, fontFamily:Font.medium, textAlign:'right', width:width*0.025, textAlignVertical:'center', marginEnd:20}}>{props.index}</Text>
            </View>
        </View>
    );
};
const styles = StyleSheet.create({
    Root_Sliding_Drawer_Container:{
        position:'absolute',
        zIndex:-1,
        left:0
    },
})
export default React.memo(RatingGraph)