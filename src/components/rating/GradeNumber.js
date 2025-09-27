import React, {memo} from 'react';
import {View} from 'react-native';
import Icon from '../../utils/Icon';
import Globals from '../../utils/Globals';
import useAppTheme from '../../hooks/theme/useAppTheme';

function GradeNumber({grade, size}){
    const colors = useAppTheme()
    const ratingBarRender = (i)=>{
        return(
          <View key={i} style={{flexDirection:'column', alignItems:'center', marginHorizontal:size/10}}>
            {
                (i <= grade)?
                <Icon name='star' type='AntDesign' style={{fontSize:size, color:colors.primary.a1}} />
                :
                <Icon name='staro' type='AntDesign' style={{fontSize:size, color:colors.primary.a1}} />
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