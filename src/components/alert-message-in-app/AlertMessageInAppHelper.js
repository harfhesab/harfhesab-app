let _ref;

function setRef(ref){
_ref = ref
}

function showAlert(data){
    _ref.open(data)
}

function hideAlert(){
    _ref.close()
}

export default {
    setRef , showAlert, hideAlert
}