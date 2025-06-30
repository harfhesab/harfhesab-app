import React, {useEffect, useState, memo} from 'react';
import { View, Dimensions} from 'react-native';
import {useTheme} from '@react-navigation/native';
import TimerOTP from './TimerOTP';
import Font from '../../utils/Font';

const width = Dimensions.get('window').width;
function TimerShowOTP ({minutes, seconds, endOfTime, fontSize, fontFamily, color}) {
  const {colors} = useTheme().colors;
  const [minutesState, setMinutesState] = useState(minutes)
  const [secondsState, setSecondsState] = useState(seconds)
  
  useEffect(()=>{
    if(seconds){
      setSecondsState(seconds)
    }
  }, [seconds])
  useEffect(()=>{
    if(minutes){
      setMinutesState(minutes)
    }
  }, [minutes])

  const timer = {
    fontSize: fontSize??16,
    fontFamily: fontFamily??Font.medium,
    color: color??colors.text.a1,
  }
 
  return (
    <View style={{flexDirection:'row', alignItems:'center', justifyContent:'center'}}>
          <TimerOTP
            style={timer}
            minutes={minutesState}
            seconds={secondsState}
            endOfTime={endOfTime}
          />
      </View>
  );
}


export default memo(TimerShowOTP)