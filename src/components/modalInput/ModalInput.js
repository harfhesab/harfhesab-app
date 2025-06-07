import React, { Component } from 'react';
import { StyleSheet, View, TouchableOpacity, TextInput, KeyboardAvoidingView, Dimensions, Text} from 'react-native';
import Globals from '../../utils/Globals';
import Font from '../../utils/Font';
import {connect} from 'react-redux';
import Modal from "react-native-modal";
import { priceDigitSeperator } from '../../utils/PriceDigitSeperator';

const {width} = Dimensions.get('window');
class ModalInput extends Component {
    constructor(props) {
        super(props);
        this.state = {
            modalVisible: false,
            input: '',
            title: null,
            description: null,
            buttons: [],
            keyboardType: 'default',
            placeholder: null,
            multiline:false,
            numberOfLines:1,
            maxLength:undefined,
        };
    }
    open = (dialog) => {
        this.setState({
            modalVisible: true,
            title:dialog.title !== undefined && dialog.title !== ''?dialog.title:null,
            description:dialog.description !== undefined && dialog.description !== ''?dialog.description:null,
            buttons: dialog.buttons,
            keyboardType: dialog.options.keyboardType,
            placeholder: dialog.options.placeholder,
            multiline: dialog.options.multiline,
            numberOfLines: dialog.options.numberOfLines,
            maxLength: dialog.options.maxLength,
            input: dialog.options.value == null?'':dialog.options.value,
        });
    }

    close = () => {
        this.setState({
            modalVisible: false,
            input: '',
            title: null,
            description: null,
            buttons: [],
            keyboardType: 'default',
            placeholder: null,
            multiline:false,
            numberOfLines:1,
            maxLength:undefined,
        });
    }
    changeInput = (text)=>{
        if(this.state.keyboardType !== 'number-pad'){
            this.setState({input:text})
        } else {
            this.setState({input:text.replace(/[^0-9]/g, '')})
        }
    }
    render() {
        return (
            <Modal 
                animationIn={'fadeIn'}
                animationOut={'fadeOut'}
                backdropOpacity={0}
                statusBarTranslucent={true}
                onBackButtonPress={()=>{
                    this.close()
                }}
                isVisible={this.state.modalVisible}
                onBackdropPress={()=>{
                    this.close()
                }}
                style={{flex:1, justifyContent:'center', alignItems:'center', margin: 0}}
            >
                <View pointerEvents='box-none' style={{flex:1, width:width, alignItems:'center', justifyContent:'center', backgroundColor:'rgba(0,0,0,0.5)'}}>
                <KeyboardAvoidingView behavior='position'>
                    <View style={[styles.modalContainer, {backgroundColor:this.props.darkMode?'#222222':'#F6F9FC'}]}>
                        <View style={{width:'100%', alignItems:'flex-start', paddingHorizontal:20, marginTop:30}}>
                        {
                            this.state.title == null?null:
                            <Text style={{fontFamily:Font.bold, color:this.props.darkMode?'#F6F9FC':'#434343', fontSize:18}}>{this.state.title}</Text>
                        }
                        {
                            this.state.description == null?null:
                            <Text style={{fontFamily:Font.medium, color:this.props.darkMode?'#999':'#666', fontSize:14, textAlign:'justify'}}>{this.state.description}</Text>
                        }
                        </View>
                        <TextInput
                            placeholder={this.state.placeholder}
                            placeholderTextColor={this.props.darkMode?'#666':'#cecece'}
                            multiline={this.state.multiline}
                            numberOfLines={this.state.numberOfLines}
                            selectionColor={Globals.data.configs.colors.rgba1}
                            cursorColor={Globals.data.configs.colors.primary}
                            autoFocus={true}
                            value={this.state.keyboardType !== 'number-pad'?this.state.input:priceDigitSeperator(this.state.input)}
                            maxLength={this.state.maxLength}
                            onChangeText={this.changeInput}
                            keyboardType={this.state.keyboardType}
                            style={{width:width- 100, backgroundColor:this.props.darkMode?'#333333':'#FFF', color:this.props.darkMode?'#F6F9FC':'#434343', fontFamily:Font.medium, fontSize:16, paddingHorizontal:10, marginTop:30, borderWidth:1, borderColor:this.props.darkMode?'#666':'#cecece', borderRadius:5, textAlignVertical:'top', maxHeight:200}}
                        />
                        <View style={{width:'100%', flexDirection:'row', alignItems:'center', justifyContent:'flex-end', marginVertical:30, gap:10}}> 
                            {
                                this.state.buttons.map((p, i)=>{
                                    return(
                                        <TouchableOpacity key={i.toString()} activeOpacity={0.5} onPress={()=>{
                                            p.onPress(this.state.input)
                                            this.close()
                                        }}>
                                            <Text style={{fontFamily:Font.medium, marginEnd:20, fontSize:16, color:Globals.data.configs.colors.primary}}>
                                                {p.text}
                                            </Text>
                                        </TouchableOpacity>
                                    )
                                })
                            }
                        </View>
                    </View>
                </KeyboardAvoidingView>
                </View>
            </Modal>
        );
    }
}
const styles = StyleSheet.create({
    modalContainer:{
      width:width - 60,
      borderRadius:10,
      alignSelf:'center',
      verticalAlign:'center',
      alignItems:'center', 
      justifyContent:'center'
    },
});
const mapStateToProps = (state) => {
    return {
        darkMode: state.main.darkMode,
    }
}
export default connect(mapStateToProps, null, null, {forwardRef:true})(ModalInput)
// ModalInput.showInput({
//     title: "title",
//     description: "description",
//     buttons: [
//         {
//             text: 'تأیید',
//             onPress: (call) => {console.log(call)},
//         },
//         {
//             text: 'انصراف',
//             onPress: () => {},
//         },
//     ],
//     options : {
//       value: p.title == undefined || p.title == null?null:p.title,
//       keyboardType: 'default',
//       placeholder: null,
//       multiline: false,
//       numberOfLines: 1,
//       maxLength: 30,
//     },
// })