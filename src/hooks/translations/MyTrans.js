import fa from './fa';
import Globals from '../../utils/Globals';

class MyTrans {
    translate(page, sub, text) {
        if (Globals.data.configs.translate === 'fa') {
            if (page && sub && text)
                return fa[page][sub][text]
            else if (page && sub)
                return fa[page][sub]
            else if (page)
                return fa[page]
            else
                return 'error'
        } else {
            return 'not found'
        }
    }
}

const MyTransCall = new MyTrans();
export default MyTransCall;