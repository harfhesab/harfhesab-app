import React, {memo} from 'react';
import {View} from 'react-native';
import Icon from '../../utils/Icon';
import Globals from '../../utils/Globals';

function GradeNumber({grade, size}){
    const ratingBarRender = (i)=>{
        return(
          <View key={i} style={{flexDirection:'column', alignItems:'center', marginHorizontal:size/10}}>
            {
                (i <= grade)?
                <Icon name='star' type='AntDesign' style={{fontSize:size, color:Globals.data.configs.colors.primary}} />
                :
                <Icon name='staro' type='AntDesign' style={{fontSize:size, color:Globals.data.configs.colors.primary}} />
            }
          </View>
        )
    }
    let ratingBar = [];
    for(let i = 1; i <= 5; i++) {
        ratingBar.push(ratingBarRender(i))
    }
    return (
        <View style={{flexDirection:'row', alignItems:'center', flexDirection:'row-reverse'}}>
            {ratingBar}
        </View>
    );
};
export default memo(GradeNumber)