import React, {useEffect, useState, memo, useRef} from 'react';
import { View, Dimensions, ScrollView} from 'react-native';
import {useTheme} from '@react-navigation/native';
import Font from '../../utils/Font';
import {
    LineChart,
    BarChart,
} from "react-native-chart-kit";
import {convertRtl} from 'react-native-rtl-reshaper';
import Globals from '../../utils/Globals';
import GraphLoading from '../GraphLoading';

const {width} = Dimensions.get('window');
function Chart1(props) {
    const colors = useTheme().colors;
    const [data1, setData1] = useState(props.data1)
    const [loading, setLoading] = useState(true)
    let list = []
    for (let index = 0; index < props.data2.length; index++) {
        const element = props.data2[index];
        const elem = convertRtl(element)
        list.push(elem)
    }
    const [data2, setData2] = useState(list)
    const scrollViewRef = useRef()

    useEffect(()=>{
        const time = setTimeout(()=>{
            setLoading(false)
            clearTimeout(time)
        }, 700)
        const time2 = setTimeout(()=>{
            scrollViewRef.current?.scrollTo({
                x: 0,
                animated: true,
            });
            clearTimeout(time2)
        }, 1200)
    }, [])
    useEffect(()=>{
        if(data1 !== props.data1){
            setData1(props.data1)
        }
    }, [props.data1])
    useEffect(()=>{
        if(data2 !== props.data2){
            let list = []
            for (let index = 0; index < props.data2.length; index++) {
                const element = props.data2[index];
                const elem = convertRtl(element)
                list.push(elem)
            }
            setData2(list)
        }
    }, [props.data2])
    return (
        loading == true?
        <GraphLoading/>
        :
        <View style={{width:width - 100, alignSelf:'center', backgroundColor:colors.background5, borderRadius:10, paddingVertical:10, borderWidth:1, borderColor:colors.border, borderStyle:'dashed'}}>
            <ScrollView 
                ref={scrollViewRef}
                horizontal 
                style={{flexDirection:'row'}}
            >
                {
                    props.type == 'line'?
                    <LineChart
                        data={{
                            labels: data2,
                            datasets: [
                                {
                                  data: data1,
                                  color: () => `rgba(204, 0, 0, 0.85)`,
                                  strokeWidth: 2,
                                }
                            ],
                        }}
                        withOuterLines={false}
                        segments={5}
                        width={data1.length * 90} // from react-native
                        height={350}
                        fromZero={true}
                        yAxisInterval={1} // optional, defaults to 1
                        chartConfig={{
                            propsForLabels:{fontFamily:Font.medium, color:colors.text, fontSize:10},
                            backgroundGradientFrom: colors.background5,
                            backgroundGradientTo: colors.background5,
                            decimalPlaces: 0, // optional, defaults to 2dp
                            color: () => Globals.data.configs.colors.rgba0,
                            labelColor: () => colors.text,
                            fillShadowGradientOpacity:0.95,
                            propsForDots: {
                                r: "4",
                                strokeWidth: "3",
                                stroke: colors.color
                            }
                        }}
                        bezier
                    />
                    :props.type == 'bar'&&
                    <BarChart
                        data={{
                            labels: data2,
                            datasets: [
                                {
                                  data: data1,
                                }
                            ],
                        }}
                        showValuesOnTopOfBars={true}
                        segments={5}
                        width={data1.length * 100} // from react-native
                        height={350}
                        fromZero={true}
                        yAxisInterval={1} // optional, defaults to 1
                        chartConfig={{
                            propsForLabels:{fontFamily:Font.medium, color:colors.text, fontSize:10},
                            backgroundGradientFrom: colors.background5,
                            backgroundGradientTo: colors.background5,
                            decimalPlaces: 0, // optional, defaults to 2dp
                            color: () => Globals.data.configs.colors.rgba0,
                            labelColor: () => colors.text,
                            fillShadowGradientOpacity:0.95,
                            barRadius:3,
                        }}
                    />
                }
            </ScrollView>
        </View>
    );
}
export default memo(Chart1)