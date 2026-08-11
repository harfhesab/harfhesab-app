let _ref;

function setRef(ref){
    _ref = ref
}

function showAlertGame(title, admiration, description, moreDescription, completedSentences, stageHint, buttons, options){
    if(_ref){
        _ref.open(title, admiration, description, moreDescription, completedSentences, stageHint, buttons, options)
    }
}

function changeLoading(loadingValue, loadingMessage){
    if(_ref){
        _ref.changeLoading(loadingValue, loadingMessage)
    }
}

function changeButtons(buttons){
    if(_ref){
        _ref.changeButtons(buttons)
    }
}

export default {
    setRef,
    showAlertGame,
    changeLoading,
    changeButtons
}