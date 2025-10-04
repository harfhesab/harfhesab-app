import React, { Component } from 'react';
import { View, TouchableOpacity, Text, TextInput, Dimensions, ToastAndroid} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Globals from '../../utils/Globals';
import Icon from 'react-native-vector-icons/FontAwesome';
import LinearGradient from 'react-native-linear-gradient';
import MyHeader from '../../components/MyHeader';
import CustomStyles from '../../utils/CustomStyles';
import MyTransCall from '../../utils/translations/MyTrans';
import MyLoading from '../../components/MyLoading';
import MyNothing from '../../components/MyNothing';
import Alert from '../../components/alert/AlertHelper';
import {RSA_PUBLIC_KEY} from '../../utils/MyConstants';
import MyUtilsCall from '../../utils/MyUtils';
import bazaar from '@cafebazaar/react-native-poolakey';
import MyFetchCall from '../../utils/MyFetch';
import RNFetchBlob from "rn-fetch-blob";
import MyFont from '../../utils/MyFont';

class BazaarOrder extends Component {

    constructor(props) {
        super(props);
        this.state = {
            opacityLoading: 0.0,
            Token: '',
            loadComplete: false,
            showNothing: false,
            typeNothing: 'empty',
            textNothing: '',
            bazaar_data : null,
            price : null ,
            title : null ,
            description : null,
            course_id : this.props.route.params.course_id,
            product_sku : this.props.route.params.product_sku,
            current_order_id : "",
            code : "",
            code_token : ""
        }

        this.SetLoggedIn = this.SetLoggedIn.bind(this);
    }

    componentDidMount() {
        this.didMount()
    }
    
    didMount = async ()=>{
        bazaar
        .connect(RSA_PUBLIC_KEY)
        .catch((e) => {
            console.log("connect_bazaar_error" ,  e);
        });
        await AsyncStorage.getItem('Token')
            .then((value) =>
                {
                    this.setState({Token: 'bearer ' + value} , () => {
                        this._course_call()
                    })
                });
    }

    componentWillUnmount() {
        bazaar.disconnect();
    }

    _course_call = async () => {
        this.Loading();
        MyFetchCall._call(
            Globals.data.configs.Routing.course.url.replace('${id}', this.state.course_id),
            Globals.data.configs.Routing.course.method,
            false,
            '',
            '',
            '',
            0,
            null,
            '?wstoken=' + Globals.WS_TOKEN,
            'application/json',
            this.state.Token,
            (responseJson) => {
                console.log('bazaar course call', responseJson)
                if (responseJson === 'Reload') {
                    this._course_call()
                } else if (responseJson === 'ServerReload') {
                    this._course_call()
                } else {
                    this._course_response(responseJson)
                }
            },
            (errorTitle, errorBody, pbtn, nbtn) => {
                this._course_error(errorTitle, errorBody, pbtn, nbtn)
            },
            true,
        );
    }

    _course_response = (responseJson) => {
        this.setState({ package_courses: responseJson.data.package_courses })
        let payment_enrollment = responseJson.data?.enrollments?.filter(enrollment => enrollment.enrollment_type === "payment")
        if(payment_enrollment.length > 0) {
            this.setState({ enrollments: responseJson.data.enrollments[5] })
            let id = this.state.product_sku
            let type = responseJson?.data?.type ? responseJson.data.type : "";
            this.setState({
                loadComplete: true,
            });
            this.getSubscriptionSkuDetails(id, type);   // call bazaar
        }
        else{
            this.Disloading();
            Alert.showAlert({
                body: MyTransCall.translate('bazaar_order', 'no_enrollment'),
                buttons: [
                    {
                        text: MyTransCall.translate('alert', 'info', 'back'), onPress: () => {
                            this.props.navigation.goBack()
                    }
                    }
                ],
                options : {
                    type: 'alert',
                    cancelable: false,
                },
            });
        }
    }

    _course_error = (error) => {
        console.log("error"  , error.errorBody)
        this.Disloading();
        this.setState({
            loadComplete: false,
            showNothing: true,
            typeNothing: 'retry',
        });
        Alert.showAlert({
            body: error.errorBody,
            buttons: [
                {
                    text: error.pbtn, onPress: () => {
                        this._course_call()
                    }
                },
                {
                    text: error.nbtn, onPress: () => {
                    }
                }
            ],
            options : {
                type: 'alert',
                cancelable: false,
            },
        });
    }

    getSubscriptionSkuDetails = async (id , type) => {
        try {
            const Detail = await bazaar.getSubscriptionSkuDetails([this.state.product_sku.toString()]);
            this.Disloading();
            if(Detail[0]){
                let price = Detail[0] && Detail[0].price.replace("ریال", "").replace(",", "").replace(",", "")
                let numberPrice = price && Math.floor(parseInt(MyUtilsCall.convertToEnglishNumber(price))/10)
                this.setState({price : numberPrice , title :  Detail[0].title , description :  Detail[0].description ? Detail[0].description  : MyTransCall.translate('bazaar_order', 'no_description')})
                let data = {
                    price : numberPrice,
                    title : Detail[0].title ,
                    sku : Detail[0].sku
                }
                this.setBazaarData(data)
            }
        } catch (e) {
            this.Disloading();
            let message = MyTransCall.translate('bazaar_order', 'bazaar_call_error' , "msg_default")
            if (e.message === 'Item not found') {
                message =  MyTransCall.translate('bazaar_order', 'bazaar_call_error' , "msg1")
            }
            else if (
                e.message === "We can't communicate with Bazaar: Service is disconnected"
            ) {
                message = MyTransCall.translate('bazaar_order', 'bazaar_call_error' , "msg2")
            }

            else if (e.message === 'Bazaar is not installed') {
                message = MyTransCall.translate('bazaar_order', 'bazaar_call_error' , "msg3")
            }
            Alert.showAlert({
                body: message,
                buttons: [
                    {
                        text: MyTransCall.translate('alert', 'info', 'pbtn'), onPress: () => {
                    }
                    }
                ],
                options : {
                    type: 'alert',
                    cancelable: false,
                },
            });
            console.log(e);
        }
    };

    setBazaarData = (data) =>{
        this.setState({bazaar_data : data})
    }

    Loading() {
        this.setState({
            opacityLoading: 1.0,
        });
    }

    Disloading() {
        this.setState({
            opacityLoading: 0.0,
        });
    }

    SetLoggedIn =async() =>{
        await AsyncStorage.getItem('LoggedIn').then((value) => (value) ? this.setState({ LoggedIn: value }) : this.setState({ LoggedIn: '0' }));
    }

    _Bazaar_shop = async() => {
        await AsyncStorage.getItem('LoggedIn').then((value) => {
            if (value === '1') {
                if(this.state.bazaar_data){
                    this.create_bazaar_order();
                }
            } else {
                Alert.showAlert({
                    body: MyTransCall.translate('basket', 'need_login', 'body'),
                    buttons: [
                        {
                            text: MyTransCall.translate('basket', 'need_login', 'pbtn'), onPress: () => {
                                Globals.App_Type === 'org' ?
                                    this.props.navigation.navigate('ManageAccounts', { ComeFromHome: true })
                                    :
                                    this.props.navigation.navigate('Login', { loggedin: this.SetLoggedIn })
                            }
                        },
                        { text: MyTransCall.translate('basket', 'need_login', 'nbtn'), onPress: () => { } }
                    ],
                    options : {
                        type: 'warn',
                        cancelable: false,
                    },
                });
            }
        })
    }

    create_bazaar_order = () => {
        this.Loading()
        let data = {
            "currency_id": 2,
            "order": {
                "items": [
                    {
                        "item_type": "course",
                        "item_id": this.state.course_id,
                        "qty": 1,
                        "sale_price": this.state.bazaar_data.price,
                        "has_shipment": 0,
                        "cafebazaar_sub_sku": this.state.bazaar_data.sku,
                        "cafebazaar_sub_title": this.state.bazaar_data.title
                    }
                ],
                "shipment": null,
                "amount": this.state.bazaar_data.price,
                "payable_amount": this.state.bazaar_data.price
            },
            "code": this.state.code
        }
        MyFetchCall._call(
            Globals.data.configs.Routing.create_bazaar_order.url,
            Globals.data.configs.Routing.create_bazaar_order.method,
            false,
            '',
            '',
            '',
            0,
            JSON.stringify(data),
            '?wstoken=' + Globals.WS_TOKEN,
            'application/json',
            this.state.Token,
            (responseJson) => {
                console.log('5555555555555555555555555', responseJson)
                console.log('bazaar create order', responseJson)

                this.create_bazaar_order_response(responseJson)
            },
            (errorTitle, errorBody, pbtn, nbtn) => { 
                this.create_bazaar_order_error(errorTitle, errorBody, pbtn, nbtn)
             },
            false,
        );
    }

    create_bazaar_order_response = (responseJson) => {
        this.Disloading()
        if (responseJson) {
            if (!responseJson.has_error) {
                if(responseJson.result){
                    let order_id = responseJson.result.order_id
                    if(order_id){
                        this.setState({current_order_id : order_id, code_token:responseJson.result.dynamic_price_token} , () => {
                            if(responseJson.result.items.amount === responseJson.result.items.discount_amount){
                                Alert.showAlert({
                                    body: 'ثبت نام شما در این دوره با موفقیت انجام شد',
                                    buttons: [
                                        {
                                            text: MyTransCall.translate('alert', 'info', 'pbtn'), onPress: () => {
                                                this.props.navigation.navigate('MyCourse')
                                            }
                                        }
                                    ],
                                    options : {
                                        type: 'success',
                                        cancelable: false,
                                    },
                                });
                            } else {
                                this.subscribeProduct(); 
                                if(this.state.code.length>0 && responseJson.result.items.discount_amount == 0){
                                    ToastAndroid.showWithGravity (
                                        "کد تخفیف وارد شده اشتباه میباشد",
                                        ToastAndroid.LONG,
                                        ToastAndroid.TOP,
                                    )
                                }
                            }       //payment in bazaar
                        })
                    }
                }
            } else {
                this.Disloading()
                throw new Error(responseJson.message ? responseJson.message : MyTransCall.translate('fetch', 'response_invalid', 'false_body'))
            }
        } else {
            this.Disloading()
            throw new Error(responseJson.message ? responseJson.message : MyTransCall.translate('fetch', 'response_invalid', 'nodata_body'))
        }
    }

    create_bazaar_order_error = (errorTitle, errorBody, pbtn, nbtn) => {
        this.Disloading()
        Alert.showAlert({
            body: errorBody,
            buttons: [
                {
                    text: MyTransCall.translate('alert', 'info', 'pbtn'), onPress: () => {
                }
                }
            ],
            options : {
                type: 'alert',
                cancelable: false,
            },
        });
    }


    subscribeProduct = async () => {
        let id =  this.state.bazaar_data?.sku?.toString()
        let code_token = this.state.code_token;
        let developerPayload = this.state.current_order_id?.toString()
        try {
          const purchaseResult = await bazaar.subscribeProduct(id , developerPayload, code_token);
          //if succeed
          // return {
            //"orderId": "hoRbzhNqILxIv0Cd",
           // "packageName": "ir.rahpooyan.hero",
            //"productId": "test-sub-365d-2591",
            //"purchaseTime": "2021-09-07T10:10:51.973Z",
            //"purchaseState": 0,
            //"developerPayload": "",
           // "purchaseToken": "hoRbzhNqILxIv0Cd"
          //}
          //if failed
          // return null
          if(purchaseResult){
              this.complete_bazaar_order(purchaseResult)
          }
        } catch (e) {
          console.log(e.message);
        }
      };

      complete_bazaar_order = (purchaseResult) => {
        this.Loading();
        let data = {
                "order_id": this.state.current_order_id,
                "cb_order_id": purchaseResult.orderId ,
                "cb_package_name": purchaseResult.packageName ,
                "cb_product_id": purchaseResult.productId,
                "cb_purchase_time": purchaseResult.purchaseTime,
                "cb_purchase_state": purchaseResult.purchaseState ,
                "cb_developer_payload": purchaseResult.developerPayload,
                "cb_purchase_token": purchaseResult.purchaseToken
        }
        console.log(data)
        console.log(Globals.WS_TOKEN)
        console.log(this.state.Token)

        MyFetchCall._call(
            Globals.data.configs.Routing.complete_bazaar_order.url,
            Globals.data.configs.Routing.complete_bazaar_order.method,
            false,
            '',
            '',
            '',
            0,
            JSON.stringify(data),
            '?wstoken=' + Globals.WS_TOKEN,
            'application/json',
            this.state.Token,
            (responseJson) => {
                this.complete_bazaar_order_response(responseJson)
            },
            (errorTitle, errorBody, pbtn, nbtn) => { 
                this.complete_bazaar_order_error(errorTitle, errorBody, pbtn, nbtn)
             },
            false,
        );
    }

    complete_bazaar_order_response = (responseJson) => {
        console.log(responseJson)
        this.Disloading();
        if (responseJson) {
            if (!responseJson.has_error) {
                RNFetchBlob.session('has_expire').dispose().catch(e => console.log(e));
                Alert.showAlert({
                    body: MyTransCall.translate('bazaar_order', 'success_bazaar_order'),
                    buttons: [
                        {
                            text: MyTransCall.translate('alert', 'info', 'pbtn'), onPress: () => {
                                this.props.navigation.navigate('MyCourse')
                        }
                        }
                    ],
                    options : {
                        type: 'success',
                        cancelable: false,
                    },
                });
            } else {
                this.Disloading();
                throw new Error(responseJson.message ? responseJson.message : MyTransCall.translate('fetch', 'response_invalid', 'false_body'))
            }
        } else {
            this.Disloading();
            throw new Error(responseJson.message ? responseJson.message : MyTransCall.translate('fetch', 'response_invalid', 'nodata_body'))
        }
    }

    complete_bazaar_order_error = (errorTitle, errorBody, pbtn, nbtn) => {
        this.Disloading();
        Alert.showAlert({
            body: errorBody,
            buttons: [
                {
                    text: MyTransCall.translate('alert', 'info', 'pbtn'), onPress: () => {
                }
                }
            ],
            options : {
                type: 'alert',
                cancelable: false,
            },
        });
    }

    changeCode = (text)=>{
        this.setState({code : text})
    }


    render() {
        return (
            <View style={this.state.showNothing ?
                {
                    flex: 1,
                    backgroundColor: '#ffffff',
                    justifyContent: 'center',
                    alignItems: 'center',
                }
                :
                {
                    flex: 1,
                    backgroundColor: '#ffffff',
                }}>
                {/* loading */}
                <MyLoading
                    opacityLoading={this.state.opacityLoading}
                />
                {/* header */}
                <MyHeader
                    ishome={Globals.data.configs.basket.header.ishome}
                    right1={Globals.data.configs.basket.header.right1}
                    right2={Globals.data.configs.basket.header.right2}
                    center={Globals.data.configs.basket.header.center}
                    left2={Globals.data.configs.basket.header.left2}
                    left1={Globals.data.configs.basket.header.left1}
                    title={MyTransCall.translate('bazaar_order', 'header' , 'title')}
                    navigation={this.props.navigation}
                />
                {/* nothing */}
                {this.state.showNothing ?
                    <MyNothing
                        type={this.state.typeNothing}
                        text={this.state.textNothing}
                        callMethod={() => {}}
                    />
                    :
                    <View />
                }
                {(this.state.loadComplete) ? (
                    <View
                        style={{
                            flex: 1,
                        }}
                    >

                        <View
                            style={{
                                flexDirection: 'column',
                                // shadowColor: '#00000070', // IOS
                                // shadowOffset: { height: 1, width: 1 }, // IOS
                                // shadowOpacity: 1, // IOS
                                // shadowRadius: 2, //IOS
                                // elevation: 5, // Android
                                // backgroundColor: '#f2f2f2',
                            }}
                        >
                        {this.state.title ? (
                                <View
                                    style={{
                                        flexDirection: 'row',
                                    }}
                                >
                                    <View
                                        style={{
                                            // flex: 1,
                                            marginHorizontal: 10,
                                            marginVertical: 2,
                                            justifyContent: 'center',
                                            alignItems: 'flex-end',
                                        }}
                                    >
                                        <Text style={{fontFamily:MyFont.font.medium, color:'#5e5e5e', fontSize:14, width:80}}>{MyTransCall.translate('bazaar_order', 'title')}</Text>
                                    </View>
                                    <View
                                        style={{
                                            flex: 1,
                                            marginHorizontal: 10,
                                            justifyContent: 'center',
                                            // alignItems: 'flex-start',
                                        }}
                                    >
                                        <Text style={{fontFamily:MyFont.font.medium, color:'#5e5e5e', fontSize:12}}>{this.state.title}</Text>
                                    </View>
                                </View>
                            ) : (
                                    <View />
                                )}

                            {this.state.price ? (
                                <View
                                    style={{
                                        flexDirection: 'row',
                                    }}
                                >
                                    <View
                                        style={{
                                            // flex: 1,
                                            marginHorizontal: 10,
                                            marginVertical: 2,
                                            justifyContent: 'center',
                                            alignItems: 'flex-end',
                                        }}
                                    >
                                        <Text style={{fontFamily:MyFont.font.medium, color:'#5e5e5e', fontSize:14, width:80}}>{MyTransCall.translate('bazaar_order', 'price')}</Text>
                                    </View>
                                    <View
                                        style={{
                                            flex: 1,
                                            marginHorizontal: 10,
                                            justifyContent: 'center',
                                            // alignItems: 'flex-start',
                                        }}
                                    >
                                        <Text style={{fontFamily:MyFont.font.medium, color:'#5e5e5e', fontSize:12}}>{this.state.price.toLocaleString() + " " + "تومان"}</Text>
                                    </View>
                                </View>
                            ) : (
                                    <View />
                                )}

                            {this.state.description ? (
                                <View
                                    style={{
                                        flexDirection: 'row',
                                    }}
                                >
                                    <View
                                        style={{
                                            // flex: 1,
                                            marginHorizontal: 10,
                                            marginVertical: 2,
                                            justifyContent: 'center',
                                            alignItems: 'flex-end',
                                        }}
                                    >
                                        <Text style={{fontFamily:MyFont.font.medium, color:'#5e5e5e', fontSize:14, width:80}}>{MyTransCall.translate('bazaar_order', 'description')}</Text>
                                    </View>
                                    <View
                                        style={{
                                            flex: 1,
                                            marginHorizontal: 10,
                                            justifyContent: 'center',
                                            // alignItems: 'flex-start',
                                        }}
                                    >
                                        <Text style={{fontFamily:MyFont.font.medium, color:'#5e5e5e', fontSize:12}}>{this.state.description}</Text>
                                    </View>
                                </View>
                            ) : (
                                    <View />
                                )}

                        </View>
                    </View>
                ) : (
                        <View />
                    )}
                {(this.state.loadComplete) && (       
                    <View>
                        
                        <View style={{width:Dimensions.get('window').width, alignItems:'center', marginBottom:30}}>
                                <Text style={{fontFamily:MyFont.font.medium, color:'#666', fontSize:10}}>{'اگر کد تخفیف فعال دارید ابتدا کد را وارد کنید'}</Text>
                                <TextInput
                                    value={this.state.code}
                                    placeholder={'کد تخفیف ...'}
                                    placeholderTextColor={'#666'}
                                    onChangeText={(text)=>{this.changeCode(text)}}
                                    style={{height:40, width:Dimensions.get('window').width * 0.8, borderColor:'#666', borderWidth:1, borderRadius:5, backgroundColor:'#f2f2f2', paddingHorizontal:10, color:'#666'}}
                                />
                            </View>             
                    <View
                            style={[
                                CustomStyles.safeAreaBottomHeight,
                                {
                                    shadowColor: '#00000070', // IOS
                                    shadowOffset: { height: 1, width: 1 }, // IOS
                                    shadowOpacity: 1, // IOS
                                    shadowRadius: 2, //IOS
                                    elevation: 5, // Android
                                    backgroundColor: '#ffffff',
                                    zIndex: 2,
                                }]}
                        >
                            <TouchableOpacity
                                style={{
                                    flex: 1,
                                }}
                                activeOpacity={0.5}
                                onPress={ this._Bazaar_shop }
                            >
                                <LinearGradient
                                    style={[
                                        CustomStyles.safeAreaBottomPadding,
                                        {
                                            flex: 1,
                                            flexDirection: 'row',
                                        }]}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 0 }}
                                    colors={[
                                        Globals.data.configs.colors.secondary_gradient_start,
                                        Globals.data.configs.colors.secondary_gradient_end
                                    ]}
                                >
                                    <View
                                        style={{
                                            position: 'absolute',
                                            width: 50,
                                            height: 50,
                                            justifyContent: 'center',
                                            alignItems: 'center',
                                        }}
                                    >
                                        <Icon
                                            name='shopping-cart'
                                            size={25}
                                            color={Globals.data.configs.colors.secondary_text}
                                        />
                                    </View>
                                    <View
                                        style={{
                                            flex: 1,
                                            width: 50,
                                            height: 50,
                                            marginHorizontal: 10,
                                            justifyContent: 'center',
                                            alignItems: 'center',
                                        }}
                                    >
                                        <Text style={{fontFamily:MyFont.font.medium, color:Globals.data.configs.colors.secondary_text, fontSize:14}}>{MyTransCall.translate('bazaar_order', 'buy_btn')}</Text>
                                    </View>
                                </LinearGradient>
                            </TouchableOpacity>
                        </View>
                    </View>    
                        )}
            </View>
        );
    }
}
export default BazaarOrder;
