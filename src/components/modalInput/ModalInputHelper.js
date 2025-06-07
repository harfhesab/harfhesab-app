let _ref;

function setRef(ref){
_ref = ref
}

function showInput(title, description, buttons, options){
    _ref.open(title, description, buttons, options)
}

function hideInput(){
    _ref.close()
}

export default {
    setRef , showInput, hideInput
}