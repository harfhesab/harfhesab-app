let _ref;

function setRef(ref){
    _ref = ref
}

function showAlertGame(title, admiration, description, completedSentences, stageHint, buttons, options){
    if(_ref){
        _ref.open(title, admiration, description, completedSentences, stageHint, buttons, options)
    }
}

export default {
    setRef , showAlertGame
}