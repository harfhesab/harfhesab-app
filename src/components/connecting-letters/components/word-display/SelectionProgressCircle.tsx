import React from 'react';
import Animated, { useAnimatedProps } from 'react-native-reanimated';
import Svg, { Rect } from 'react-native-svg';
import { useLetters } from '../../context/LettersContext';
import { BOUNDARY_WIDTH } from '../../constants/constants';
import { TouchableOpacity, View } from 'react-native';
import Icon from '../../../../utils/Icon';
import useAppTheme from '../../../../hooks/theme/useAppTheme';

const AnimatedRect = Animated.createAnimatedComponent(Rect);

const SelectionProgressCircle = () => {
  const colors = useAppTheme();
  const { selectionProgressRN, manualDeselectAll, manualStartProgressTimer } = useLetters();
  const animatedProps = useAnimatedProps(() => ({
    width: selectionProgressRN.value * (BOUNDARY_WIDTH - 60), // عرض نوار با progress تغییر می‌کنه
  }));

  return (
    <View style={{ width: BOUNDARY_WIDTH, height: 25, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
      <TouchableOpacity activeOpacity={0.7} onPress={manualStartProgressTimer} style={{width:25, height:25, alignItems:'center', justifyContent:'center'}}>
        <Icon name="refresh-ccw" type={"Feather"} style={{ fontSize:24, color:colors.primary.a1 }} />
      </TouchableOpacity>
      <Svg width={BOUNDARY_WIDTH - 60} height={12}>
        <Rect
          x={0}
          y={1}
          width={BOUNDARY_WIDTH - 60}
          height={10}
          fill="transparent"
          stroke="#0ea96090"
          strokeWidth={1}
          rx={5}
        />
        <AnimatedRect
          x={0}
          y={1}
          height={10}
          fill="#0099CC90"
          rx={5}
          animatedProps={animatedProps}
        />
      </Svg>
      <TouchableOpacity activeOpacity={0.7} onPress={manualDeselectAll} style={{width:25, height:25, alignItems:'center', justifyContent:'center'}}>
        <Icon name="refresh-cw" type={"Feather"} style={{ fontSize:24, color:colors.primary.a1 }} />
      </TouchableOpacity>
    </View>
    
  );
};

export default React.memo(SelectionProgressCircle);