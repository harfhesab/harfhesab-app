import React, { memo } from 'react';
import {
  View,
  Text,
  Dimensions,
} from 'react-native';
import Icon from '../../../utils/Icon';
import Font from '../../../utils/Font';
import Globals from '../../../utils/Globals';
import useAppTheme from '../../../hooks/theme/useAppTheme';
import StageNumberCurrently from './StageNumberCurrently';
import { tabScreenSoundInOnClick } from '../../../utils/sound/SoundFunctions';
import { IS_TABLET_CONDITION } from '../../../utils/constants/constants';
import SimpleBorderText from '../../text-components/SimpleBorderText';
import { PacmanIndicator } from 'react-native-indicators';
import ExpandableText from '../../text-components/expandable-text';




const { width, height } = Dimensions.get('window');


function StageInfo({
  number,
  lock,
  currently,
  parts,
  stage_hint
}) {
  const colors = useAppTheme();
  
  return (
    <View style={{width:width-75, backgroundColor:`${colors.primary.a7}50`, borderRadius:15, paddingHorizontal:10, paddingVertical:15, alignSelf:'center'}}>
        <View style={{alignSelf:'center', backgroundColor:"#FFFFFF50", paddingHorizontal:30, paddingVertical:5, borderRadius:20, marginBottom:15, alignItems:'center', justifyContent:'center'}}>
            <Text style={{fontFamily:Font.bakh_black, color:colors.primary.a8, fontSize:18, textAlign:'center'}}>{`مرحلهٔ ${number}`}</Text>
        </View>
        {
            lock?
            <View style={{width:"100%", alignItems:'center', justifyContent:'center', paddingVertical:15}}>
                <Icon name={"locked"} type={"Fontisto"} style={{fontSize:50, color:colors.primary.a7}}/>
            </View>
            :currently? 
            <View style={{width:"100%"}}>
                <PacmanIndicator 
                    size={100}
                    color={colors.primary.a8}
                />
            </View>
            :
            <View style={{width:"100%"}}>
                {
                    parts?.map((item, index)=>{
                        return(
                            <View key={index.toString()} style={{marginTop:15}}>
                                <Text style={{fontFamily:Font.bakh_bold, color:colors.primary.a2, fontSize:15, lineHeight:25}}><Text style={{color:colors.primary.a8, fontFamily:Font.bakh_extra_bold, fontSize:18}}>{`${index + 1}_ `}</Text>{item?.sentence_display??item.sentence}</Text>
                                {item?.sentence_hint&&<Text style={{fontFamily:Font.bakh_bold, color:colors.primary.a7, fontSize:13, lineHeight:26}}><Text style={{color:`${colors.primary.a7}90`}}>{"معنی : "}</Text>{item?.sentence_hint}</Text>}
                            </View>
                        )
                    })
                }
                {stage_hint&&
                    <ExpandableText
                            text={stage_hint}
                            numberOfLines={2}
                            moreLabel={"بیشتر"}
                            lessLabel={"بستن"}
                            moreLabelColor={colors.primary.a8}
                            textStyle={{fontFamily:Font.bakh_semi_bold, color:`${colors.primary.a7}99`, fontSize:12, lineHeight:24}}
                            animationDuration={700}
                            containerStyle={{marginTop:15}}
                        />
                }
            </View>
        }
    </View>
  );
}

export default memo(StageInfo);

