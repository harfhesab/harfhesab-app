import React, {useEffect, useState, memo} from 'react';
import { View, Dimensions} from 'react-native';
import {useTheme} from '@react-navigation/native';
import TimerOTP from './TimerOTP';
import Font from '../../utils/Font';

const width = Dimensions.get('window').width;
function TimerShowOTP (props) {
  const colors = useTheme().colors;
  const [minutes, setMinutes] = useState(props.minutes)
  const [seconds, setSeconds] = useState(props.seconds)
  
  useEffect(()=>{
    if(props){
      setMinutes(props.minutes)
      setSeconds(props.seconds)
    }
  }, [props])

  const timer = {
    fontSize: width * 0.04,
    fontFamily: Font.medium,
    color: colors.text,
  }
 
  return (
    <View style={{flexDirection:'row', alignItems:'center', justifyContent:'center'}}>
          <TimerOTP
            style={timer}
            minutes={minutes}
            seconds={seconds}
            endOfTime={props.endOfTime}
          />
      </View>
  );
}


export default memo(TimerShowOTP)