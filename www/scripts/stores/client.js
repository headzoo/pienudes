'use strict';

var Reflux        = require('reflux');
var SocketActions = require('../actions/socket');
var Events        = require('../events');

module.exports = Reflux.createStore({
    listenables: [SocketActions],
    socket: null,
    data: {
        rank: -1,
        leader: false,
        name: "",
        logged_in: false,
        guest: true,
        profile: {
            image: "",
            text: ""
        }
    },
    
    getInitialState() {
        return this.data;
    },
    
    onConnectDone: function(socket) {
        socket.on(Events.LOGIN, this.onLogin);
        
        if (this.data.name && this.data.guest) {
            SocketActions.emit(Events.LOGIN, {
                name: this.data.name
            });
        }
        
        this.trigger(this.data);
    },
    
    onLogin: function(data) {
        console.log(data);
    }
});