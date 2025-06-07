let _ref;

function setRef(ref){
_ref = ref
}

function showLoading(text, options){
    _ref.open(text, options)
}

function hideLoading(){
    _ref.close()
}

export default {
    setRef , showLoading, hideLoading
}