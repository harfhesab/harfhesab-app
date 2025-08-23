// types برای ساختار کلی theme
export type ThemeKey = 't1' | 't2';

export type ThemeColors = typeof themes.t1.colors;

export const themes = {
  t1: {
    colors: {
      primary: {
        a1: '#0ea960',
        a2: '#24536b',
      },
      background_gradient: ['#163241', '#193b4d', '#24536b'],
      text_gradient:{
        a1: ['#1b0b63', '#311b92', '#512da8'],
      },
      text_banner: {
        background: ['#bf5340', '#813123', '#491a11'],
        content_1: '#e8edf5',
        content_2: '#c4d2e5',
      },
      header: {
        background: '#0e202a',
        content_1: '#F0F0F0',
        content_2: '#d1d1d1',
      },
      bottom_tab: {
        background: '#163241',
        active: '#FFFFFF',
        inactive: '#AAAAAA',
      },
      button_gradient: {
        background: ['#47cd8a', '#1f5b3b'],
        content_1: '#FFFFFF',
        content_2: '#EBEBEB',
      },
      text: {
        a1: '#FFFFFF',
        a2: '#F0F0F0',
        a3: '#d1d1d1',
        a4: '#cccccc',
        a5: '#BDBDBD',
      },
      rgb: {
        a1: 'rgba(14,169,96,0.80)',
        a2: 'rgba(14,169,96,0.65)',
        a3: 'rgba(14,169,96,0.50)',
        a4: 'rgba(14,169,96,0.35)',
        a5: 'rgba(14,169,96,0.20)',
      },
      border: {
        a1: '#546874',
        a2: '#425762',
      },
      alert: {
        a1: '#CC0000',
      },
      shadow: {
        a1: '#00000095',
        a2: '#000000',
      },
      toast: {
        background: '#F0F0F0',
        text1: '#222222',
        text2: '#333333',
        error: '#CC0000',
        info: '#0088cc',
        success: '#0ea960',
      },
      alert_component: {
        background: '#163241',
        success: ['#007E33', '#00C851'],
        error: ['#CC0000', '#ff4444'],
        info: ['#0099CC', '#33b5e5'],
        warning: ['#FF8800', '#ffbb33'],
        question: ['#FF8800', '#ffbb33'],
      },
      bottom_drawer: {
        background: '#163241',
        text1: '#F0F0F0',
        text2: '#d1d1d1',
      },
      check_box: {
        color: '#0ea960',
        check: '#FFFFFF',
      },
    },
  },
} as const;

export default themes;
