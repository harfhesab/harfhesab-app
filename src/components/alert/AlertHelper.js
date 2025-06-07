let _ref;

function setRef(ref){
_ref = ref
}

function showAlert(body, buttons, options){
    _ref.open(body, buttons, options)
}

export default {
    setRef , showAlert
}