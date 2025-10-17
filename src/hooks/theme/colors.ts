// types برای ساختار کلی theme
export type ThemeKey = 't1' | 't2';

export type ThemeColors = typeof themes.t1.colors;

export const themes = {
  t1: {
    colors: {
      primary: {
        a1: '#40bf42',
        a2: '#24536b',
        a3: '#fcb900'
      },
      background:{
        a1:'#001c20',
        a2:'#001012'
      },
      text_gradient:{
        a1: ['#1b0b63', '#311b92', '#512da8'],
      },
      text_banner: {
        background: ['#1b0b6395', '#311b9295', '#512da895'],
        content_1: '#e8edf5',
        content_2: '#c4d2e5',
      },
      status_bar: {
        background: '#001012',
        bar_style: "light-content"
      },
      header: {
        background: '#001012',
        content_1: '#F0F0F0',
        content_2: '#d1d1d1',
      },
      bottom_tab: {
        background: '#001012',
        active: '#dbdfdf',
        inactive: '#87989a',
      },
      button_gradient: {
        background: ['#40bf42', '#008B02'],
        content_1: '#FFFFFF',
        content_2: '#EBEBEB',
      },
      text: {
        a1: '#FFFFFF',
        a2: '#F0F0F0',
        a3: '#d1d1d1',
        a4: '#cccccc',
        a5: '#BDBDBD',
        a6: '#95a2a4'
      },
      rgb: {
        a1: 'rgba(64,191,66,0.80)',
        a2: 'rgba(64,191,66,0.65)',
        a3: 'rgba(64,191,66,0.50)',
        a4: 'rgba(64,191,66,0.35)',
        a5: 'rgba(64,191,66,0.20)',
      },
      border: {
        a1: '#4f5f62',
        a2: '#222c2e',
      },
      alert: {
        a1: '#ff4444',
      },
      shadow: {
        a1: '#00000095',
        a2: '#000000',
      },
      toast: {
        background: '#3f51b5',
        text1: '#FFFFFF',
        text2: '#d1d1d1',
        error: '#ff4444',
        info: '#0088cc',
        success: '#40bf42',
      },
      alert_component: {
        background: '#00252a',
        background2: '#00373f',
        success: ['#007E33', '#00C851'],
        error: ['#CC0000', '#ff4444'],
        info: ['#0099CC', '#33b5e5'],
        warning: ['#FF8800', '#ffbb33'],
        question: ['#FF8800', '#ffbb33'],
      },
      bottom_drawer: {
        background: '#00252a',
        text1: '#F0F0F0',
        text2: '#d1d1d1',
      },
      check_box: {
        color: '#40bf42',
        check: '#FFFFFF',
      },
    },
  },
} as const;

export const colors = {
  background:{
    a1:'#001c20'
  },
  primary: {
    a1: '#40bf42',
  },
  text: {
    a1: '#FFFFFF',
    a2: '#F0F0F0',
    a3: '#d1d1d1',
    a4: '#cccccc',
    a5: '#BDBDBD',
    a6: '#95a2a4'
  },
}

export default themes;
