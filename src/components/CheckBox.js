import React, {useState, useEffect} from "react";
import {View, TouchableOpacity} from 'react-native';
import Icon from "../utils/Icon";
import {connect} from 'react-redux';

function CheckBox(props){
    const [check, setCheck] = useState(props.check)
    const back = props.darkMode == true?'rgba(60,60,60,0.5)':'rgba(255,255,255,0.5)';

    useEffect(() => {
        setCheck(props.check)
    }, [props.check]);
    
    const change = ()=>{
        setCheck(!check)
        const time = setTimeout(()=>{
            props.onPress()
            setCheck(props.check)
            clearTimeout(time)
        }, 100)
    }
    
    return(
        <TouchableOpacity onPress={change} activeOpacity={0.7} >
            <View style={{borderRadius:props.size*0.15, borderWidth:props.size*0.075, borderColor:props.color, alignItems:'center', justifyContent:'center', width:props.size, height:props.size, backgroundColor:check == true?props.color:back}}>
                {
                    check == true?
                    <Icon name={'check'} type={'Feather'} style={{color:'#FFF', fontSize:props.size*0.8}} />
                    :null
                }
            </View>
        </TouchableOpacity>
    )
}
const mapStateToProps = (state) => {
    return {
        darkMode: state.main.darkMode,
    }
}
export default connect(mapStateToProps)(React.memo(CheckBox))