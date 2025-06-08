import React, {useState, useEffect} from "react";
import {View, TouchableOpacity} from 'react-native';
import Icon from "../utils/Icon";

function CheckBox(props){
    const [check, setCheck] = useState(props.check)

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
            <View style={{borderRadius:props.size*0.15, borderWidth:props.size*0.075, borderColor:props.color, alignItems:'center', justifyContent:'center', width:props.size, height:props.size, backgroundColor:check == true?props.color:"transparent"}}>
                {
                    check == true?
                    <Icon name={'check'} type={'Feather'} style={{color:'#FFF', fontSize:props.size*0.8}} />
                    :null
                }
            </View>
        </TouchableOpacity>
    )
}
export default React.memo(CheckBox)