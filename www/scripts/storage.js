'use strict';

var NO_STORAGE = typeof localStorage == "undefined" || localStorage === null;

function createCookie(name, value, days) {
    var expires = "";
    if (days) {
        var date = new Date();
        date.setTime(date.getTime() + (days*24*60*60*1000));
        expires = "; expires="+date.toGMTString();
    }
    
    document.cookie = name + "=" + value + expires+"; path=/";
}

function readCookie(name) {
    var nameEQ = name + "=";
    var ca = document.cookie.split(";");
    for(var i=0;i < ca.length;i++) {
        var c = ca[i];
        while (c.charAt(0)==" ") c = c.substring(1,c.length);
        if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
    }
    return null;
}

module.exports = {
    getValue: function(key) {
        var value = NO_STORAGE ? readCookie(key) : localStorage.getItem(key);
        try {
            value = JSON.parse(value);
        } catch (e) {
            value = null;
        }
        
        return value;
    },
    
    setValue: function(key, value) {
        value = JSON.stringify(value);
        NO_STORAGE ? createCookie(key, value, 1000) : localStorage.setItem(key, value);
    }
};