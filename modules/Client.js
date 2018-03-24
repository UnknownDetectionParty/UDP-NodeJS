const EventManager = require('./EventManager');
const EventTest = require('./events/EventChatCommand');

var Client = function() {
    EventManager.register(this.onEventChatCommand, 'EventChatCommand');
};

Client.prototype.onEventChatCommand = (eventChatCommand) => {
    console.log('Chat command: ' + eventChatCommand.command);
};

module.exports = Client;