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
  
  
const width = Dimensions.get('window').width;
function InputCodeField({value,  cellCount, setValue, onSubmitEditing}){
    const colors = useAppTheme();
    const ref = useBlurOnFulfill({value, cellCount});
    const [prop, getCellOnLayoutHandler] = useClearByFocusCell({
        value,
        setValue,
    });

    
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
                        style={[styles.cell, {borderColor:isFocused?colors.primary.a1:colors.border.a1, backgroundColor:`${colors.primary.a1}50`, color:colors.text.a1}]}
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
        width: (width - 140) / 6,
        height: (width - 140) / 6,
        maxHeight:60,
        maxWidth:60,
        alignItems:'center',
        justifyContent:'center',
        fontSize: 22,
        fontFamily: Font.black,
        borderWidth: 2,
        borderRadius: 8,
        margin:4,
        textAlignVertical: 'center',
        textAlign: 'center',
    },
});
export default InputCodeField
