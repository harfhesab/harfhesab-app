import Globals from './Globals';

const translate = Globals.data.configs.translate;
class MyFont {
    constructor(){
        this.black = translate == 'fa'?"IRANSans(FaNum)_Black":"IRANSans_Black"
        this.bold = translate == 'fa'?"IRANSans(FaNum)_Bold":"IRANSans_Bold"
        this.medium = translate == 'fa'?"IRANSans(FaNum)_Medium":"IRANSans_Medium"
        this.light = translate == 'fa'?"IRANSans(FaNum)_Light":"IRANSans_Light"
        this.ultra = translate == 'fa'?"IRANSans(FaNum)_UltraLight":"IRANSans_UltraLight"
        this.en_black = "IRANSans_Black"
        this.en_bold = "IRANSans_Bold"
        this.en_medium = "IRANSans_Medium"
        this.en_light = "IRANSans_Light"
        this.en_ultra = "IRANSans_UltraLight"
    }
}

const Font = new MyFont();
export default Font;