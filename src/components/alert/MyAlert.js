import React, { PureComponent } from 'react';
import { View, Dimensions, ScrollView, Text, StatusBar} from 'react-native';
import Globals from '../../utils/Globals';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/FontAwesome';
import LottieView from 'lottie-react-native';
import Font from '../../utils/Font';
import {connect} from 'react-redux';
import Modal from "react-native-modal";
import ButtonLinear from '../ButtonLinear';
import ButtonBorder from '../ButtonBorder';

const width = Dimensions.get('window').width;
class MyAlert extends PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            modalVisible: false,
            body: '',
            width: Math.floor((width * 3) / 4),
            button_width: Math.floor((Math.floor((width * 3) / 4) - 40) / 2),
            gradient_start: '#ffffff',
            icon: '',
            type: 'info',
            buttons: [],
            cancelable: true,
            icon_type: Globals.data.configs.alert.icon_type,
        };
    }
    open = (dialog) => {
        this.setState({
            modalVisible: true,
            body:dialog.body,
            buttons: dialog.buttons,
            type: dialog.options.type,
            cancelable: dialog.options.cancelable,
        });
        if (dialog.options.type === 'success') {
            this.setState({
                gradient_start: Globals.data.configs.alert.success.gradient_start,
                gradient_end: Globals.data.configs.alert.success.gradient_end,
                icon: Globals.data.configs.alert.success.icon,
            });
        }
        if (dialog.options.type === 'alert') {
            this.setState({
                gradient_start: Globals.data.configs.alert.alert.gradient_start,
                gradient_end: Globals.data.configs.alert.alert.gradient_end,
                icon: Globals.data.configs.alert.alert.icon,
            });
        }
        if (dialog.options.type === 'info') {
            this.setState({
                gradient_start: Globals.data.configs.alert.info.gradient_start,
                gradient_end: Globals.data.configs.alert.info.gradient_end,
                icon: Globals.data.configs.alert.info.icon,
            });
        }
        if (dialog.options.type === 'warn') {
            this.setState({
                gradient_start: Globals.data.configs.alert.warn.gradient_start,
                gradient_end: Globals.data.configs.alert.warn.gradient_end,
                icon: Globals.data.configs.alert.warn.icon,
            });
        }
        if (dialog.options.type === 'question') {
            this.setState({
                gradient_start: Globals.data.configs.alert.question.gradient_start,
                gradient_end: Globals.data.configs.alert.question.gradient_end,
                icon: Globals.data.configs.alert.question.icon,
            });
        }
    }
    close = () =>{
        this.setState({
            modalVisible: false,
        })
    }

    render() {
        return (
            <Modal
                animationIn={'fadeIn'}
                animationOut={'fadeOut'}
                backdropOpacity={0.7}
                isVisible={this.state.modalVisible}
                onBackdropPress={()=>{
                    if(this.state.cancelable == true){
                        this.close()
                    }
                }}
                useNativeDriverForBackdrop={true}
                onBackButtonPress={()=>{
                    if(this.state.cancelable == true){
                        this.close()
                    }
                }}
            >
            <StatusBar backgroundColor={this.props.darkMode?"#000000":"#00000005"} barStyle={"light-content"}/>
                <View
                    style={{
                        flex: 1,
                        alignItems: "center",
                        justifyContent: "center",
                        padding: 40,
                    }}>
                    <View
                        style={{
                            width: this.state.width,
                            margin: 20,
                            backgroundColor: this.props.darkMode == true?'#222222':'#F6F9FC',
                            borderRadius: 10,
                            alignItems: "center",
                        }}>
                        <View
                            style={{
                                width: this.state.width,
                                height: 100,
                                backgroundColor: this.props.darkMode == true?'#222222':'#F6F9FC',
                                borderTopLeftRadius: 10,
                                borderTopRightRadius: 10,
                                shadowColor: '#00000070', // IOS
                                shadowOffset: { height: 1, width: 1 }, // IOS
                                shadowOpacity: 1, // IOS
                                shadowRadius: 2, //IOS
                                elevation: 5, // Android
                            }}>
                            <LinearGradient
                                style={{
                                    width: this.state.width,
                                    height: 100,
                                    borderTopLeftRadius: 10,
                                    borderTopRightRadius: 10,
                                }}
                                colors={[
                                    Globals.data.configs.colors.primary_gradient_start,
                                    Globals.data.configs.colors.primary_gradient_end,
                                ]}
                            />
                        </View>
                        <View
                            style={{
                                width: 100,
                                height: 100,
                                borderRadius: 50,
                                backgroundColor: this.props.darkMode == true?'#222222':'#F6F9FC',
                                marginTop: 20,
                                alignItems: "center",
                                justifyContent: "center",
                                position: 'absolute',
                                shadowColor: '#00000070', // IOS
                                shadowOffset: { height: 1, width: 1 }, // IOS
                                shadowOpacity: 1, // IOS
                                shadowRadius: 2, //IOS
                                elevation: 5, // Android
                                borderWidth:3,
                                borderColor:this.state.gradient_start
                            }}
                        >
                            {this.state.icon_type === 'lottie' ?
                                <LottieView
                                    source={this.state.type === 'success' ?
                                        require('../../assets/lottie/success.json')
                                        :
                                        this.state.type === 'alert' ?
                                            require('../../assets/lottie/alert.json')
                                            :
                                            this.state.type === 'info' ?
                                                require('../../assets/lottie/info.json')
                                                :
                                                this.state.type === 'warn' ?
                                                    require('../../assets/lottie/warn.json')
                                                    :
                                                    this.state.type === 'question' ?
                                                        require('../../assets/lottie/question.json')
                                                        :
                                                        require('../../assets/lottie/info.json')
                                    }
                                    autoPlay
                                    loop={false}
                                />
                                :
                                <Icon
                                    name={this.state.icon}
                                    size={60}
                                    color={this.state.gradient_start}
                                />
                            }
                        </View>
                        <View style={{ maxHeight: 300, justifyContent: 'center', alignItems: 'center', padding: 15, marginTop: 15}}>
                            <ScrollView
                                style={{ flexGrow: 0 }}
                            >
                                <Text style={{fontSize:16, fontFamily:Font.medium, color:this.props.darkMode == true?'#F6F9FC':'#434343', textAlign:'center', marginVertical:10, lineHeight:28}}>{this.state.body}</Text>
                            </ScrollView>
                        </View>
                        {this.state.buttons ?
                            <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginHorizontal: 10, marginBottom: 10}}>
                            {this.state.buttons[0] && this.state.buttons[0].text &&
                                <View style={{flex: 1, justifyContent: 'flex-end', alignItems: 'center'}}>
                                    <View style={{ width: this.state.button_width, height: 45}}>
                                        {
                                            this.state.buttons[0]?.type && this.state.buttons[0]?.type == 'border'?
                                            <ButtonBorder
                                                text={this.state.buttons[0].text}
                                                onPress={() => {
                                                    this.close()
                                                    this.state.buttons[0].onPress()
                                                }}
                                                loading={false}
                                                textSize={14}
                                                width={this.state.button_width}
                                                height={40}
                                                borderRadius={5}
                                            />
                                            :
                                            <ButtonLinear
                                                text={this.state.buttons[0].text}
                                                onPress={() => {
                                                    this.close()
                                                    this.state.buttons[0].onPress()
                                                }}
                                                loading={false}
                                                textSize={14}
                                                width={this.state.button_width}
                                                height={40}
                                                borderRadius={5}
                                            />
                                        }
                                    </View>
                                </View>
                            }
                                {this.state.buttons.length == 2 ?
                                    <View style={{flex: 1, justifyContent: 'flex-end', alignItems: 'center'}}>
                                        <View style={{width: this.state.button_width, height: 45}}>
                                            {
                                                this.state.buttons[1]?.type && this.state.buttons[1]?.type == 'border'?
                                                <ButtonBorder
                                                    text={this.state.buttons[1].text}
                                                    onPress={() => {
                                                        this.close()
                                                        this.state.buttons[1].onPress()
                                                    }}
                                                    loading={false}
                                                    textSize={12}
                                                    width={this.state.button_width}
                                                    height={40}
                                                    borderRadius={5}
                                                />
                                                :
                                                <ButtonLinear
                                                    text={this.state.buttons[1].text}
                                                    onPress={() => {
                                                        this.close()
                                                        this.state.buttons[1].onPress()
                                                    }}
                                                    loading={false}
                                                    textSize={12}
                                                    width={this.state.button_width}
                                                    height={40}
                                                    borderRadius={5}
                                                />
                                            }
                                        </View>
                                    </View>
                                    :
                                    <View />
                                }
                            </View>
                            :
                            <View />
                        }
                    </View>
                </View>
            </Modal>
        );
    }
}
const mapStateToProps = (state) => {
    return {
        darkMode: state.main.darkMode,
    }
}
export default connect(mapStateToProps, null, null, {forwardRef:true})(MyAlert)
