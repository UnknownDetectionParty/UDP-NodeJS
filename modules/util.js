module.exports = () => {
    var module = {};

    module.sleep = (ms) => {
        return  new Promise(resolve => setTimeout(resolve, ms));
    };

    return module;
};