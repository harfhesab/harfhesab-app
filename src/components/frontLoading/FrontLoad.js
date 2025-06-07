import React, { PureComponent } from 'react';
import { View, Dimensions, Text} from 'react-native';
import Globals from '../../utils/Globals';
import Font from '../../utils/Font';
import {connect} from 'react-redux';
import { DotIndicator } from 'react-native-indicators';
import Modal from "react-native-modal";

const width = Dimensions.get('window').width;
class FrontLoad extends PureComponent {

    constructor(props) {
        super(props);
        this.state = {
            modalVisible: false,
            width: width/2.3,
            cancelable: false,
            text:null
        };
    }
    open = (dialog) => {
        if(dialog == undefined){
            this.setState({
                modalVisible: true,
                text:null,
                cancelable:false,
            });
        } else {
            this.setState({
                modalVisible: true,
                text:dialog.text !== undefined && dialog.text !== ''?dialog.text:null,
                cancelable:dialog.options?.cancelable !== undefined?dialog.options?.cancelable:false,
            });
        }
    }

    close = () => {
        this.setState({
            modalVisible: false,
            cancelable: false,
            text:null,
        });
    }

    render() {
        return (
            <Modal
                animationIn={'fadeIn'}
                animationOut={'fadeOut'}
                statusBarTranslucent={true}
                onBackButtonPress={()=>{
                    if (this.state.cancelable == true) {
                        this.setState({
                            modalVisible: false,
                            text: null
                        })
                    }
                }}
                isVisible={this.state.modalVisible}
                onBackdropPress={()=>{
                    if (this.state.cancelable == true) {
                        this.setState({
                            modalVisible: false,
                            text: null
                        })
                    }
                }}
                backdropOpacity={0}
                style={{flex:1, justifyContent:'center', alignItems:'center', margin: 0}}
            >
                <View pointerEvents='box-none' style={{flex:1, width:width, alignItems:'center', justifyContent:'center', backgroundColor:'rgba(0,0,0,0.5)'}}>
                    <View
                        style={{
                            alignItems: "center",
                            justifyContent: "center",
                            padding: 40,
                        }}>
                        <View
                            style={{
                                width: this.state.width,
                                height: this.state.width * 2 /3,
                                paddingHorizontal:20,
                                backgroundColor: this.props.darkMode == true?'#000':'#FFF',
                                borderRadius: 10,
                                alignItems: "center",
                                justifyContent: "center"
                            }}>
                            {
                                this.state.modalVisible == true?
                                <View style={{height:40, alignItems:'center'}}>
                                    <DotIndicator color={Globals.data.configs.colors.primary} count={3} size={8}/>
                                </View>
                                :null
                            }
                            {
                                this.state.text !== null && this.state.text !== undefined && this.state.text !== ''?
                                <Text style={{fontFamily:Font.medium, fontSize:12, color:this.props.darkMode == true?'#F6F9FC':'#434343'}}>{this.state.text}</Text>
                                :null
                            }
                        </View>
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
export default connect(mapStateToProps, null, null, {forwardRef:true})(FrontLoad)
// Loading.showLoading({
//     text: 'در حال بارگذاری',
//     options:{
//       cancelable: false
//     }
// })

