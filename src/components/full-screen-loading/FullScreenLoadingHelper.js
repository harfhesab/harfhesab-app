let _ref;

function setRef(ref){
_ref = ref
}

function showLoading(title, cancelable){
    _ref.open(title, cancelable)
}

function hideLoading(){
    _ref.close()
}

export default {
    setRef , showLoading, hideLoading
}