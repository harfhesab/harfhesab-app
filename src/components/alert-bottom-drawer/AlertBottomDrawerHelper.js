let _ref;

function setRef(ref){
_ref = ref
}

function showAlert(title, message, buttons, options){
    _ref.open(title, message, buttons, options)
}

function hideAlert(){
    _ref.close()
}

export default {
    setRef , showAlert, hideAlert
}