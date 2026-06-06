import React, {PureComponent} from "react";
import { Text, View} from 'react-native';
import BackgroundTimer from 'react-native-background-timer';
import Font from "../../utils/Font";
import { colors } from "../../hooks/theme/colors";

class Timer extends PureComponent{
    constructor(props){
        super(props)
        this.state={
            seconds : this.props.seconds,
            minutes : this.props.minutes,
            hours : this.props.hours,
            days : this.props.days
        }
    }

    componentDidMount(){
        this.intervalId = BackgroundTimer.setInterval(() => {
            if(this.state.seconds > 0){
                this.setState({seconds: this.state.seconds - 1})
            } else{
                if(this.state.minutes > 0){
                    this.setState({
                        seconds: 59,
                        minutes: this.state.minutes - 1
                    })
                } else if(this.state.minutes == 0 && this.state.hours > 0){
                    this.setState({
                        seconds: 59,
                        minutes: 59,
                        hours: this.state.hours - 1
                    })
                } else if(this.state.minutes == 0 && this.state.hours == 0 && this.state.days > 0){
                    this.setState({
                        seconds: 59,
                        minutes: 59,
                        hours: 23,
                        days: this.state.days - 1
                    })
                }
            }
        }, 1000);
    }
    componentWillUnmount(){
        BackgroundTimer.clearInterval(this.intervalId);
    }

    UNSAFE_componentWillReceiveProps(nextProps){
        if(nextProps.seconds !== this.props.seconds || nextProps.minutes !== this.props.minutes || nextProps.hours !== this.props.hours || nextProps.days !== this.props.days){
            this.setState({
                seconds : nextProps.seconds,
                minutes : nextProps.minutes,
                hours : nextProps.hours,
                days : nextProps.days
            })
        }
    }

    render(){
        return(
            <View style={{flexDirection:'row', alignItems:'center', justifyContent:'center'}}>
                <View style={{flexDirection:'column', alignItems:'center', width:this.props.style.fontSize * 2, marginHorizontal:2}}>
                    <Text style={this.props.style}>{this.state.seconds > 9?this.state.seconds:`0${this.state.seconds}`}</Text>
                    <Text style={[this.props.titleStyle, {fontSize:this.props.style.fontSize / 2}]}>{'ثانیه'}</Text>
                </View>
                <View style={{flexDirection:'column', alignItems:'center', width:this.props.style.fontSize * 2, marginHorizontal:2}}>
                    <Text style={this.props.style}>{this.state.minutes > 9?this.state.minutes:`0${this.state.minutes}`}</Text>
                    <Text style={[this.props.titleStyle, {fontSize:this.props.style.fontSize / 2}]}>{'دقیقه'}</Text>
                </View>
                {
                    (this.state.hours !== undefined && this.state.hours !== null) && (
                        <View style={{flexDirection:'column', alignItems:'center', width:this.props.style.fontSize * 2, marginHorizontal:2}}>
                            <Text style={this.props.style}>{this.state.hours > 9?this.state.hours:`0${this.state.hours}`}</Text>
                            <Text style={[this.props.titleStyle, {fontSize:this.props.style.fontSize / 2}]}>{'ساعت'}</Text>
                        </View>
                    )
                }
                {
                    (this.state.days !== undefined && this.state.days !== null) && (
                        <View style={{flexDirection:'column', alignItems:'center', width:this.props.style.fontSize * 2, marginHorizontal:2}}>
                            <Text style={this.props.style}>{this.state.days}</Text>
                            <Text style={[this.props.titleStyle, {fontSize:this.props.style.fontSize / 2}]}>{'روز'}</Text>
                        </View>
                    )
                }
            </View>
        )
    }
}
const areEqual = (prevProps, nextProps) => {
    if (prevProps.seconds !== nextProps.seconds) return false;
    if (prevProps.style !== nextProps.style) return false;
    return true;
};
export default React.memo(Timer, areEqual);