define([], function() {
    let defaultViewerOptions = {
        viewer: 'viewer', 
        hud: 'hud', 
        help: 'help'}

    // Uglymol seems to expect an iterable object so lets add the iteration in here which just iterates through the keys
    defaultViewerOptions[Symbol.iterator] = function () {
        let n=-1;
        let keys = Object.keys(this);
        return {
            next() {
            n+=1;
            done = (n === keys.length);
            return {value:keys[n], done:done}
            }
        }
    }

    return defaultViewerOptions;

})
