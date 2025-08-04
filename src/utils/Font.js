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
        this.bakh_black = "YekanBakhFaNum-Black"
        this.bakh_bold = "YekanBakhFaNum-Bold"
        this.bakh_extra_black = "YekanBakhFaNum-ExtraBlack"
        this.bakh_extra_bold = "YekanBakhFaNum-ExtraBold"
        this.bakh_light = "YekanBakhFaNum-Light"
        this.bakh_regular = "YekanBakhFaNum-Regular"
        this.bakh_semi_bold = "YekanBakhFaNum-SemiBold"
        this.bakh_thin = "YekanBakhFaNum-Thin"
    }
}

const Font = new MyFont();
export default Font;