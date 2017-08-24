// Opens piwik functions here so they
// dont have to be called in code
function addEvent(category, action, name="", value=0){
    if (!(!name && !value)) {
        _paq.push(["trackEvent", category, action, name, value])
    } else if (!name && !value){
        _paq.push(["trackEvent", category, action])
    } else if (!!name) {
        _paq.push(["trackEvent", category, action, name])
    }
} 
