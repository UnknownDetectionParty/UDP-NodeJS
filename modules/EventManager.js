var listeners = {};

module.exports = {
    register: (listener, type) => {
        if (listeners[type])
            listeners[type].push(listener);
        else
            listeners[type] = [listener];
    },
    onEvent: (event) => {
        for (var type in listeners)
            if (event.constructor.name == type)
                for (var i = 0; i < listeners[type].length; i++)
                    listeners[type][i](event);
    }
}