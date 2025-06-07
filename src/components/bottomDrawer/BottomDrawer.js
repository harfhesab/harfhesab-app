import React, { Component } from 'react';
import { StyleSheet, View, TouchableOpacity, TouchableNativeFeedback, Dimensions, ScrollView, Text, StatusBar, FlatList} from 'react-native';
import Globals from '../../utils/Globals';
import Font from '../../utils/Font';
import {connect} from 'react-redux';
import Icon from '../../utils/Icon';
import Modal from "react-native-modal";
import Border from '../Border';
import RadioButton from '../RadioButton';
import CheckBox from '../CheckBox';
import ButtonLinear from '../ButtonLinear';
import FastImage from '@d11/react-native-fast-image';

const {width, height} = Dimensions.get('window');
class BottomDrawer extends Component {
    constructor(props) {
        super(props);
        this.state = {
            maxHeight:height*0.9 - 160,
            btn: null,
            title: null,
            buttons: [],
            cancelable: true,
            modalVisible: false,
            icon: false,
            image: false,
            closed: true,
            type: 'normal',
            loading: false,
            check_box:[],
            radio_select:null,
        };
        this.borderColor = props.darkMode?'#666':'#cecece';
        this.touchY = 0;
    }
    open = (dialog) => {
        this.setState({
            modalVisible: true,
            title:dialog.title !== undefined && dialog.title !== ''?dialog.title:null,
            cancelable:dialog.options?.cancelable !== undefined?dialog.options?.cancelable:true,
            icon:dialog.options?.icon !== undefined?dialog.options?.icon:false,
            image:dialog.options?.image?dialog.options?.image:false,
            closed:dialog.options?.closed !== undefined?dialog.options?.closed:true,
            type:dialog.options?.type !== undefined?dialog.options?.type:'normal',
            buttons:dialog?.buttons? dialog.buttons:[],
            btn: dialog.btn !== undefined?dialog.btn:null,
            loading: false
        });
        if(dialog.options.type == 'check_box'){
            let x = []
            for (let index = 0; index < dialog.buttons.length; index++) {
                const element = dialog.buttons[index];
                if(element.check !== undefined){
                    x.push(element.check)
                } else {
                    x.push(false)
                }
            }
            this.setState({check_box:x})
        }
        if(dialog.options.type == 'radio_button'){
            this.setState({radio_select:dialog.options?.selected !== undefined?dialog.options?.selected:null})
        }
    }

    close = () => {
        this.setState({
            btn: null,
            title: null,
            buttons: [],
            cancelable: true,
            modalVisible: false,
            icon: false,
            image: false,
            closed: true,
            type: 'normal',
            loading: false,
            check_box: [],
            radio_select: null
        });
        this.touchY = 0;
    }
    
    checkBoxPress = ({item, index})=>{
        if(this.state.check_box[index] == false) {
            if(item.onPress() == false) {
                this.state.check_box[index] = !this.state.check_box[index]
                this.setState({check_box:this.state.check_box});
            }
        } else {
            item.onPress2()
        }
        this.state.check_box[index] = !this.state.check_box[index]
        this.setState({check_box:this.state.check_box});
    }
    render() {
        return (
            <Modal 
                swipeDirection={this.state.cancelable == true?['down']:null}
                swipeThreshold={180}
                backdropOpacity={0.75}
                onBackButtonPress={()=>{
                    if(this.state.cancelable == true && this.state.loading == false){
                        this.close()
                    }
                }}
                onSwipeComplete={()=>{
                    if(this.state.cancelable == true && this.state.loading == false){
                        this.close()
                    }
                }}
                isVisible={this.state.modalVisible}
                onBackdropPress={()=>{
                    if(this.state.cancelable == true && this.state.loading == false){
                        this.close()
                    }
                }}
                useNativeDriverForBackdrop={true}
                style={{justifyContent:'flex-end', alignItems:'center', margin: 0}}
            >
                <StatusBar backgroundColor={this.props.darkMode?"#000000":"#00000005"} barStyle={"light-content"}/>
                <TouchableOpacity activeOpacity={1} style={[styles.modalContainer, {backgroundColor:this.props.darkMode?'#222222':'#F6F9FC'}]}>
                    <View
                        // onTouchStart={e=> this.touchY = e.nativeEvent.pageY}
                        // onTouchEnd={e => {
                        // if (this.touchY - e.nativeEvent.pageY > 20)
                        //     this.setState({maxHeight:height *0.85 - 160})
                        // }}
                    >
                        <View style={{width:width * 0.18, height:4, backgroundColor:this.borderColor, marginTop:30, marginBottom:15, alignSelf:'center', borderRadius:2}}/>                  
                        {
                            this.state.title !== null && this.state.title !== undefined && this.state.title !== ''?
                            <View style={{width:width, marginBottom:15}}>
                                <Text style={{fontFamily:Font.medium, fontSize:13, textAlign:'center', color:this.props.darkMode?'#999':'#666', marginHorizontal:20}}>{this.state.title}</Text>
                                <Border
                                    height={1}
                                    horizontal={0}
                                    top={5}
                                    bottom={0}
                                />
                            </View>
                            :null
                        }
                    </View>
                    <ScrollView style={{maxHeight:this.state.maxHeight}}>
                    {
                        this.state.buttons?.map((item, index)=>(
                            <View key={index.toString()}>
                                <TouchableNativeFeedback
                                    onPress={()=>{
                                        if(this.state.type == 'check_box'){
                                            this.checkBoxPress({item, index})
                                        } else {
                                            item.onPress()
                                            if(this.state.type=='radio_button'){
                                                this.setState({radio_select:index})
                                            }
                                            if(this.state.closed == true){
                                                this.setState({modalVisible:false})
                                            }
                                        }
                                    }} 
                                    background={TouchableNativeFeedback.Ripple(this.borderColor,false)}
                                >
                                    {
                                        this.state.type == 'center'?
                                        <View style={styles.modalItemCenter}>
                                            <Text numberOfLines={1} style={[styles.modalItemTxtCenter, {color:this.props.darkMode?'#F6F9FC':'#434343'}]}>{item.text}</Text>
                                        </View>
                                        :
                                        <View style={styles.modalItem}>
                                            <View style={{flexDirection:'row', alignItems:'center'}}>
                                                {
                                                    this.state.icon == true && item.icon_name && item.icon_type?
                                                    <Icon name={item.icon_name} type={item.icon_type} style={{fontSize:item?.icon_size || 25, color:this.props.darkMode?'#D8D8D8':'#5d5d5d', marginEnd:15}}/>
                                                    :this.state.image == true && item.image_url?
                                                    <FastImage
                                                        style={{width:item?.icon_size || 30, height:item?.icon_size || 30, borderRadius:5, marginEnd:15}}
                                                        source={{
                                                            uri: `${Globals.uri}${item.image_url}`,
                                                            priority: FastImage.priority.normal,
                                                        }}
                                                        resizeMode={FastImage.resizeMode.cover}
                                                    />
                                                    :this.state.image == true && item.local_img?
                                                    <FastImage
                                                        style={{width:item?.icon_size || 30, height:item?.icon_size || 30, borderRadius:5, marginEnd:15}}
                                                        source={item.local_img}
                                                    />
                                                    :null
                                                }
                                                <View>
                                                    <Text numberOfLines={2} style={[styles.modalItemTxt, {color:this.props.darkMode?'#F6F9FC':'#434343', maxWidth:((this.state.icon == true && item.icon_name && item.icon_type) || (this.state.image == true && item.image_url))?width-150:width - 110}]}>{item.text}</Text>
                                                    {
                                                        item?.text2&&
                                                        <Text numberOfLines={1} style={[styles.modalItemTxt2, {color:this.props.darkMode?'#999':'#666', maxWidth:((this.state.icon == true && item.icon_name && item.icon_type) || (this.state.image == true && item.image_url))?width-150:width - 110}]}>{item.text2}</Text>
                                                    }
                                                </View>
                                            </View>
                                            <View style={{flexDirection:'row', alignItems:'center'}}>
                                                {
                                                    item?.value&&
                                                    <View style={{ backgroundColor:Globals.data.configs.colors.red_error, alignItems:'center', justifyContent:'center', borderRadius:20, height:20, minWidth:20, marginEnd:15}}>
                                                        <Text style={{color:"#FFFFFF", fontFamily:Font.medium, fontSize:14}}>{item.value}</Text>
                                                    </View>
                                                }
                                                {
                                                    this.state.type == 'normal'?null:
                                                    this.state.type == 'radio_button'?
                                                    <RadioButton 
                                                        color={Globals.data.configs.colors.primary}
                                                        size={20}
                                                        selected={this.state.radio_select == index?true:false}
                                                    />
                                                    :this.state.type == 'check_box'?
                                                    <CheckBox
                                                        check={this.state.check_box[index]}
                                                        color={Globals.data.configs.colors.primary}
                                                        size={25}
                                                        onPress={()=>this.checkBoxPress({item, index})}
                                                    />:this.state.type == 'arrow_left'?
                                                    <Icon name={'angle-left'} type={'Fontisto'} style={{color:this.props.darkMode == true?'#999':'#666', fontSize:14}}/>
                                                    :null
                                                }
                                            </View>
                                        </View>
                                    }
                                </TouchableNativeFeedback>
                            </View>
                        ))
                    }
                    </ScrollView>
                    {
                        this.state.btn == null?null:
                        <View 
                            style={{marginVertical:20, width:width, alignItems:'center'}}
                        >
                            <ButtonLinear
                                text={this.state.btn.text}
                                onPress={()=>{
                                    if(this.state.loading == false){
                                        this.state.btn.onPress(this.state.radio_select)
                                        if(this.state.btn.load == true){
                                            this.setState({loading:true})
                                        }
                                    }
                                }}
                                loading={this.state.loading}
                                textSize={14}
                                width={width - 40}
                                height={50}
                                borderRadius={5}
                            />
                        </View>
                    }
                </TouchableOpacity>
            </Modal>
        );
    }
}
const styles = StyleSheet.create({
    modalContainer:{
      width:width,
      borderRadius:5,
      alignSelf:'center',
      verticalAlign:'flex-end',
      borderTopLeftRadius:20,
      borderTopRightRadius:20,
    },
    modalItem:{
      flexDirection:'row',
      alignItems:'center',
      justifyContent:'space-between',
      width:width,
      height:65,
      paddingHorizontal:20,
      alignSelf:'center',
    },
    modalItemCenter:{
        alignItems:'center',
        justifyContent:'center',
        width:width,
        height:65,
        paddingHorizontal:20,
        alignSelf:'center',
    },
    modalItemTxt: {
      fontSize: 14,
      fontFamily: Font.medium,
    },
    modalItemTxt2: {
      fontSize: 12,
      fontFamily: Font.medium,
    },
    modalItemTxtCenter: {
        fontSize: 14,
        fontFamily: Font.medium,
        maxWidth:width-40,
        textAlign:'center'
    },
});
const mapStateToProps = (state) => {
    return {
        darkMode: state.main.darkMode,
    }
}
export default connect(mapStateToProps, null, null, {forwardRef:true})(BottomDrawer)
// BottomDrawer.showDrawer({
//     title: 'message',
//     buttons: [
//         {
//             text: 'تست اول',
//             text2: 'تست اول',
//             icon_name: 'heart-half',
//             icon_type: 'Ionicons',
//             icon_size : width*0.055,
//             onPress: () => {console.log('push')},
//             onPress2: () => {console.log('pop')},
//             check: true,
//         },
//         {
//             text: 'تست دوم',
//             text2: 'تست اول',
//             icon_name: 'heart-outline',
//             icon_type: 'Ionicons',
//             icon_size : width*0.055,
//             onPress: () => {console.log('push')},
//             onPress2: () => {console.log('pop')},
//             check: false,
//         },
//     ],
//     btn:{
//         text: 'تایید موارد',
//         onPress: () => {},
//         load: true,
//     },
//     options : {
//         type: 'normal', 'check_box', 'radio_button', 'arrow_left',
//         icon: true,
//         image: false,
//         cancelable: true,
//         closed: false,
//         selected: null,
//     },
// })