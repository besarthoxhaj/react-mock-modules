'use strict';

/**
 * Event hub.
 *
 *
  store: {
    'message': [
      function message_listener_one (data) {
        // do stuff
      },
      function message_listener_two (data) {
        // do stuff
      }
    ],
    'register': [
      function register_listener_one (data) {
        // do stuff
      },
    ]
  };
 *
 */

module.exports = function () {

  let store = {};

  return {
    addEventListener: function (channel,listener) {
      (store[channel] = store[channel] || []).unshift(listener);
    },
    emit: function (channel,data) {
      (store[channel] || []).forEach(function (listener) {listener(data)});
    }
  }
}
