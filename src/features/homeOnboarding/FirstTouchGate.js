import React from 'react';
import {Pressable, StyleSheet} from 'react-native';

function FirstTouchGate({onPress}) {
    return <Pressable style={styles.gate} onPress={onPress} accessible={false} />;
}

const styles = StyleSheet.create({
    gate: {
        ...StyleSheet.absoluteFillObject,
        zIndex: 9999,
        elevation: 9999, // اندروید: بدون این، فرزندِ دارای elevation لمس را می‌گیرد
    },
});

export default React.memo(FirstTouchGate);