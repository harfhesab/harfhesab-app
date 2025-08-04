import {convertRtl} from 'react-native-rtl-reshaper';

export function prepareRTLText(input: string): string {
  const shaped = convertRtl(input);
  const reversed = shaped.split('').reverse().join('');
  return reversed;
}