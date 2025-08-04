declare module 'react-native-rtl-reshaper' {
  /**
   * Takes an Arabic or Persian string and reshapes it for proper RTL display.
   * @param input The input string
   * @returns A reshaped string suitable for RTL rendering
   */
  export function convertRtl(input: string): string;
}