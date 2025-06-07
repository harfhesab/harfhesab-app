import React, { PureComponent } from 'react';
import { View, Dimensions, ScrollView, Text, StatusBar, StyleSheet} from 'react-native';
import Globals from '../../utils/Globals';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/FontAwesome';
import LottieView from 'lottie-react-native';
import Font from '../../utils/Font';
import {connect} from 'react-redux';
import Modal from "react-native-modal";
import ButtonLinear from '../ButtonLinear';
import ButtonBorder from '../ButtonBorder';
import AsyncStorage from '@react-native-async-storage/async-storage';
import TcpSocket from 'react-native-tcp-socket';
import { BarIndicator } from 'react-native-indicators';
import * as Progress from 'react-native-progress';
import BackgroundTimer from 'react-native-background-timer';
import Toast from 'react-native-toast-message';

const {width, height} = Dimensions.get('window');
class TosanPosPayment extends PureComponent {
    constructor(props) {
        super(props);
        isConnected = false;
        currentComand = ""
        this.paymentWasSuccessful = null
        this.state = {
            modalVisible: false,
            cancelable: false,
            host: null,
            port: null,
            loading: true,
            time: null,
            second: 0,
            title: null,
            info: null,
            successfulResponse: null,
            colors:props.darkMode?{
                background : '#222222',
                background2 : '#151515',
                text : '#F6F9FC',
                text2 : '#F1F1F1',
            }:{
                background : '#F6F9FC',
                background2 : '#F1F1F1',
                text : '#434343',
                text2 : '#333',
            },
        };
    }
    open = async(dialog) => {
        this.setState({
            modalVisible: true,
            info: dialog.info
        });
        this.paymentWasSuccessful = dialog.func.paymentWasSuccessful
        const posIp = await AsyncStorage.getItem('tosan_pos_ip')
        const posPort = await AsyncStorage.getItem('tosan_pos_port')
        if(posIp && posPort){
            this.setState({
                host: posIp,
                port: posPort,
            }, ()=>{
                this.getRequestPayOrder()
                const timeOut = setTimeout(()=>{
                    if(this.state.loading == true && this.state.modalVisible == true){
                        Toast.show({
                            text1:"اتصال شبکه میسر نبود. لطفا دوباره تلاش کنید.",
                            type:'error',
                            visibilityTime:6000
                        })
                        this.setState({
                            modalVisible: false,
                        })
                    }
                    clearTimeout(timeOut)
                }, 15000)
            })
        } else {
            Toast.show({
                text1:"تنظیمات پیکربندی دستگاه کارتخوان صحیح نمی‌باشد",
                type:'error',
                visibilityTime:6000
            })
            this.setState({
                modalVisible: false,
            })
        }
    }
    close = () =>{
        // this.client.off()
        // this.client.end()
        this.client.destroy()
        if(this.intervalId){
            BackgroundTimer.clearInterval(this.intervalId);
        }
        this.setState({
            modalVisible: false,
        })
        const timeOut = setTimeout(()=>{
            this.setState({
                cancelable: false,
                host: null,
                port: null,
                loading: true,
                time: 0,
                second: null,
                title: null,
                info: null
            })
            clearTimeout(timeOut)
        },300)
    }
    operationPaymentWasSuccessful = () => {
        this.paymentWasSuccessful(this.state.successfulResponse)
        this.close()
    }
    getRequestPayOrder = () => {
        const firstMessage = { "STX": "02", "Message Len": "0072", "Message ID": "88", "ETX": "03", "LRC": "t" };
        const secondMessage = {
            "STX": "02",
            "Message Len": "0426",
            "Message ID": "89",
            "Request Type": "01",
            "Processing Code": "000000",
            "Code Page": "01",
            "Print Type": "02", 
            "Service Code": "01",
            "Spent Amount": `${this.state?.info?.amount}` || "",
            // "Spent Amount": "10000",
            "Discount Amount": "",
            "Invoice Count": "",
            "Invoice No": `${this.state?.info?.orderId}` || "",
            "Bill ID": "",
            "Payment ID": "",
            "Tel": `${this.state?.info?.phone}`|| "",
            "National ID": "",
            "Name": `${this.state?.info?.name}`|| "",
            "Acc NO": "",
            "Charge ID": "1141",
            "Other": "",
            "Print Description": "F1=Irancell,F2=10000,",
            "ETX": "03",
            "LRC": "j"
        }
        const firstMessageString = JSON.stringify(firstMessage)
        const secondMessageString = JSON.stringify(secondMessage)
        this.client = TcpSocket.createConnection({ port: this.state.port, host: this.state.host }, () => {
            this.isConnected = true
            this.currentComand = "getVerify"
            this.client.write(firstMessageString, "utf8", (err) => {
                if (err) {
                    this.close()
                    Toast.show({
                        text1:'مشکلی در اتصال دستگاه کارتخوان پیش آمد. لطفا دوباره تلاش کنید.',
                        type:'error',
                        visibilityTime:6000
                    })
                } else {
                    this.client.on('data', (data) => {
                        const ackChar = String.fromCharCode(6);
                        const nakChar = String.fromCharCode(21);
                        const dataByteArray = new Uint8Array(data);
                        const receivedData = data.toString();
                        if (ackChar == receivedData) {
                            if (this.currentComand == "getVerify") {
                                this.client.write(secondMessageString, 'utf8', (err) => {
                                    if (err) {
                                        this.close()
                                        Toast.show({
                                            text1:'مشکلی در اتصال دستگاه کارتخوان پیش آمد. لطفا دوباره تلاش کنید.',
                                            type:'error',
                                            visibilityTime:6000
                                        })
                                    } else {
                                        this.currentComand = "posResponse"
                                        this.setState({
                                            loading: false,
                                            time: 99,
                                            second: 99,
                                            title:"کارت بانکی خود را در دستگاه کارتخوان کیوسک کشیده و رمز کارت خود را وارد کنید."
                                        },()=>{
                                            this.intervalId = BackgroundTimer.setInterval(() => {
                                                if(this.state.second > 0){
                                                    this.setState({second: this.state.second - 1})
                                                } else {
                                                    Toast.show({
                                                        text1:"عملیات پرداخت از طریق دستگاه کارتخوان کیوسک لغو شد.",
                                                        type:'error',
                                                        visibilityTime:6000
                                                    })
                                                    this.close()
                                                }
                                            }, 1000);
                                        })
                                    }
                                });
                            }
                        } else if (nakChar == receivedData) {
                            Toast.show({
                                text1:"عملیات پرداخت از طریق دستگاه کارتخوان کیوسک لغو شد.",
                                type:'error',
                                visibilityTime:6000
                            })
                            this.client.end()
                        } else if (dataByteArray.includes(0x90) && this.currentComand == "posResponse") {
                            const jsonString = data.toString('utf-8');
                            const cleanString = jsonString
                            .replace(/[\u0000-\u001F]+/g, '')
                            .replace(/\\+"/g, '\\"')
                            .replace(`""""`,`"","`).trim();
                            const newDAta = JSON.parse(cleanString)
                            this.setState({successfulResponse:newDAta})
                            this.client.write("{6}", "utf8", (err) => {
                                if (err) {
                                    Toast.show({
                                        text1:'مشکلی در اتصال دستگاه کارتخوان پیش آمد. لطفا دوباره تلاش کنید.',
                                        type:'error',
                                        visibilityTime:6000
                                    })
                                    this.close()
                                } else {
                                    this.currentComand = "getResponseSuccess"
                                }
                            });
                        } else if (dataByteArray.includes(0x04) && this.currentComand == "getResponseSuccess") {
                            if(this.state.successfulResponse && this.state.successfulResponse["Response Code"] == "00" && this.state.successfulResponse["RRN"]?.length > 1){
                                this.operationPaymentWasSuccessful()
                            } else if(this.state.successfulResponse && this.state.successfulResponse["Response Code"] == "51"){
                                this.close()
                                Toast.show({
                                    text1:"موجودی کارت بانکی شما کافی نمی‌باشد.",
                                    type:'error',
                                    visibilityTime:6000
                                })
                            } else if(this.state.successfulResponse && this.state.successfulResponse["Response Code"] == "55"){
                                this.close()
                                Toast.show({
                                    text1:"رمز کارت بانکی خود را اشتباه وارد کردید. دوباره تلاش کنید.",
                                    type:'error',
                                    visibilityTime:6000
                                })
                            } else if(this.state.successfulResponse && this.state.successfulResponse["Response Code"] == "33"){
                                this.close()
                                Toast.show({
                                    text1:"تاريخ انقضای کارت بانکی شما سپری شده است. از کارت دیگری استفاده کنید.",
                                    type:'error',
                                    visibilityTime:6000
                                })
                            } else if(this.state.successfulResponse && (this.state.successfulResponse["Response Code"] == "38" || this.state.successfulResponse["Response Code"] == "75")){
                                this.close()
                                Toast.show({
                                    text1:"تعداد دفعات ورود رمز غلط بیش از حدمجاز است. از کارت دیگری استفاده کنید.",
                                    type:'error',
                                    visibilityTime:6000
                                })
                            } else if(this.state.successfulResponse && this.state.successfulResponse["Response Code"] == "78"){
                                this.close()
                                Toast.show({
                                    text1:"کارت بانکی شما فعال نیست. از کارت دیگری استفاده کنید.",
                                    type:'error',
                                    visibilityTime:6000
                                })
                            } else {
                                this.close()
                                Toast.show({
                                    text1:"عملیات پرداخت از طریق دستگاه کارتخوان کیوسک لغو شد.",
                                    type:'error',
                                    visibilityTime:6000
                                })
                            }
                        } else {
                            this.close()
                            Toast.show({
                                text1:"عملیات پرداخت از طریق دستگاه کارتخوان کیوسک لغو شد.",
                                type:'error',
                                visibilityTime:6000
                            })
                        }

                    });
                }

            });
            
        });
        this.client.on('error', (error) => {
            Toast.show({
                text1:'مشکلی در اتصال دستگاه کارتخوان پیش آمد. لطفا دوباره تلاش کنید.',
                type:'error',
                visibilityTime:6000
            })
            this.close()
        });
        this.client.on('close', () => {
            this.isConnected = false
            this.close()
        });
        this.client.on('timeout', () => {
            this.isConnected = false
            Toast.show({
                text1:'اتصال شبکه قطع شد. لطفا دوباره تلاش کنید.',
                type:'error',
                visibilityTime:6000
            })
            this.close()
        });
    }
    renderLoading = ()=>{
        return(
            <View style={{width:'100%', height:'100%', alignItems:'center', justifyContent:'center'}}>
                <BarIndicator color={Globals.data.configs.colors.primary} count={5} size={40}/>
            </View>
        )
    }
    renderLoading2 = ()=>{
        return(
            <View style={{width:'100%', height:'100%', alignItems:'center', justifyContent:'center'}}>
                <BarIndicator color={Globals.data.configs.colors.rgba2} count={5} size={width*0.25}/>
            </View>
        )
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
                <View style={{flex:1, alignItems:'center', justifyContent:'center'}}>
                    <View style={[styles.modalContainer, {backgroundColor:this.state.colors.background, borderRadius:15}]}>
                        {
                            (this.state.loading == true || (this.state.title == null && this.state.second == null))?
                            this.renderLoading()
                            :
                            <View style={{width:'100%', height:'100%', alignItems:'center', justifyContent:'center'}}>
                                {this.renderLoading2()}
                                <View style={{width:'100%', height:'100%', alignItems:'center', justifyContent:'space-between', paddingVertical:50, position:'absolute'}}>
                                    <View style={{width:'100%', alignItems:'center', rowGap:20}}>
                                        {
                                            (this.state?.info?.orderId)&&
                                            <Text style={{color:this.state.colors.text, fontSize:20, fontFamily:Font.bold, textAlign:'center'}}>{`شناسه خرید : ${this.state?.info?.orderId}`}</Text>
                                        }
                                        <View style={{width:'100%', alignItems:'center', paddingBottom:20}}>
                                            <Progress.Circle
                                                progress={(((this.state.time-this.state.second)*100)/this.state.time)/100}
                                                indeterminateAnimationDuration={this.state.time*1000}
                                                size={80}
                                                indeterminate={false}
                                                thickness={5}
                                                showsText={true}
                                                formatText={()=>{
                                                    return(
                                                        this.state.second
                                                    )
                                                }}
                                                strokeCap={"round"}
                                                borderWidth={1}
                                                borderColor={Globals.data.configs.colors.red}
                                                color={Globals.data.configs.colors.green}
                                                textStyle={{fontFamily:Font.black, color:Globals.data.configs.colors.green, fontSize:35}}
                                            />
                                        </View>
                                    </View>
                                    <View style={{width:'100%', alignItems:'center', paddingHorizontal:20, paddingBottom:20}}>
                                    {
                                        (this.state.title && this.state.title?.length > 0)&&
                                        <Text style={{color:this.state.colors.text, fontSize:17, fontFamily:Font.bold, textAlign:'center'}}>{this.state.title}</Text>
                                    }
                                    </View>
                                </View>
                            </View>
                        }
                    </View>
                </View>
            </Modal>
        );
    }
}
const styles = StyleSheet.create({
    modalContainer:{
        alignItems:'center',
        flexDirection:'column',
        justifyContent:'center',
        width:width*0.8,
        height:height*0.65
    },
})
const mapStateToProps = (state) => {
    return {
        darkMode: state.main.darkMode,
    }
}
export default connect(mapStateToProps, null, null, {forwardRef:true})(TosanPosPayment)
