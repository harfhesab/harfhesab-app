import React, {useState} from 'react';
import {StyleSheet, View, Text, TouchableOpacity, Dimensions, SafeAreaView} from 'react-native';
import { connect } from 'react-redux';
import Font from '../../utils/Font';
import {
    CodeField,
    Cursor,
    useBlurOnFulfill,
    useClearByFocusCell,
} from 'react-native-confirmation-code-field';
import useAppTheme from '../../hooks/theme/useAppTheme';
  
  
const {width} = Dimensions.get('window');
function InputCodeField({value,  cellCount, setValue, onSubmitEditing}){
    const colors = useAppTheme();
    const ref = useBlurOnFulfill({value, cellCount});
    const [prop, getCellOnLayoutHandler] = useClearByFocusCell({
        value,
        setValue,
    });

    const FIELD_SIZE_CALCU_CALCULATION = (width - 100)/cellCount
    const FIELD_SIZE = FIELD_SIZE_CALCU_CALCULATION > 45?45:FIELD_SIZE_CALCU_CALCULATION
    return(
        <SafeAreaView>
            <CodeField
                ref={ref}
                {...prop}
                // Use `caretHidden={false}` when users can't paste a text value, because context menu doesn't appear
                value={value}
                onChangeText={setValue}
                cellCount={cellCount}
                rootStyle={styles.codeFieldRoot}
                onSubmitEditing={onSubmitEditing}
                autoFocus={true}
                keyboardType="number-pad"
                textContentType="oneTimeCode"
                renderCell={({index, symbol, isFocused}) => (
                    <Text
                        key={index}
                        style={[styles.cell, {width:FIELD_SIZE, height:FIELD_SIZE, fontSize:FIELD_SIZE/2, borderColor:isFocused?colors.primary.a1:colors.border.a1, backgroundColor:`${colors.primary.a1}50`, color:colors.text.a1}]}
                        onLayout={getCellOnLayoutHandler(index)}>
                        {symbol || (isFocused ? <Cursor /> : null)}
                    </Text>
                )}
            />
        </SafeAreaView>
    )
}
const styles = StyleSheet.create({
    codeFieldRoot: {flexDirection:'row-reverse'},
    cell: {
        maxHeight:45,
        maxWidth:45,
        alignItems:'center',
        justifyContent:'center',
        fontFamily: Font.black,
        borderWidth: 2,
        borderRadius: 8,
        margin:4,
        textAlignVertical: 'center',
        textAlign: 'center',
    },
});
export default InputCodeField
