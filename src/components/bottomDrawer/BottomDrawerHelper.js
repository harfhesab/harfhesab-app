let _ref;

function setRef(ref){
_ref = ref
}

function showDrawer(title, buttons, options){
    _ref.open(title, buttons, options)
}

function hideDrawer(){
    _ref.close()
}

export default {
    setRef , showDrawer, hideDrawer
}