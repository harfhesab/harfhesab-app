let _ref;

function setRef(ref){
_ref = ref
}

function showBottomDrawer(title, list, buttons, options){
    _ref.open(title, list, buttons, options)
}

function hideBottomDrawer(){
    _ref.close()
}

export default {
    setRef , showBottomDrawer, hideBottomDrawer
}