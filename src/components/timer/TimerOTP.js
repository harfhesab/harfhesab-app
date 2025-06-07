import React, {PureComponent} from "react";
import {Text, View} from 'react-native';
import BackgroundTimer from 'react-native-background-timer';

class TimerOTP extends PureComponent{
    constructor(props){
        super(props)
        this.state={
            seconds : this.props.seconds,
            minutes : this.props.minutes,
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
                } else if(this.state.seconds == 0 && this.state.minutes == 0){
                    this.props.endOfTime()
                }
            }
        }, 1000);
    }
    componentWillUnmount(){
        BackgroundTimer.clearInterval(this.intervalId);
    }

    UNSAFE_componentWillReceiveProps(nextProps){
        if(nextProps.seconds !== this.props.seconds || nextProps.minutes !== this.props.minutes){
            this.setState({
                seconds : nextProps.seconds,
                minutes : nextProps.minutes,
            })
        }
    }

    render(){
        return(
            <View style={{flexDirection:'row', alignItems:'center', justifyContent:'center'}}>
                <View style={{flexDirection:'column', alignItems:'center', width:this.props.style.fontSize * 2}}>
                    <Text style={this.props.style}>{this.state.seconds > 9?this.state.seconds:`0${this.state.seconds}`}</Text>
                </View>
                <Text style={this.props.style}>{':'}</Text>
                <View style={{flexDirection:'column', alignItems:'center', width:this.props.style.fontSize * 2}}>
                    <Text style={this.props.style}>{this.state.minutes > 9?this.state.minutes:`0${this.state.minutes}`}</Text>
                </View>
            </View>
        )
    }
}

export default React.memo(TimerOTP);