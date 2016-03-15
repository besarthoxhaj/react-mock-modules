/**
 * 'Contacts module' from Zack Story.
 * Native version: https://github.com/rt2zz/react-native-contacts
 *
 * API
 * @getAll
 * @addContact
 * @updateContact
 * @deleteContact
 *
 * @checkPermission
 * @requestPermission
 */

'use strict';

const mock_contacts = require('./utils/mock_contacts.json');

module.exports = function (inject) {

  inject = inject || {};
  let permission = inject.permission || undefined;
  let hub = inject.hub || {};
  let store = inject.currentContacts || mock_contacts;

  return {
    'PERMISSION_DENIED':'denied',
    'PERMISSION_AUTHORIZED':'authorized',
    'PERMISSION_UNDEFINED':'undefined',
    requestPermission: callback => {
      process.nextTick(() => {
        hub.addEventListener('contacts:user_input', data => {
          switch (data) {
            case 'denied':
              callback(null,'denied');
              break;
            case 'authorized':
              callback(null,'authorized');
              break;
            case 'error':
              callback('error',null);
              break;
            default:
              callback(null,'undefined');
          }
        });
        hub.emit('require_permission');
      });
    },
    checkPermission: callback => {
      return process.nextTick(() => {        
        switch (permission) {
          case 'denied':
            callback(null,'denied');
            break;
          case 'authorized':
            callback(null,'authorized');
            break;
          case 'error':
            callback('error',null);
            break;
          default:
            callback(null,'undefined');
        }
      });
    },
    getAll: callback => {
      return process.nextTick(() => {
        if (permission === undefined) {
          hub.addEventListener('getAll:user_input', data => {
            switch (data) {
              case 'denied':
                callback(null,{type:'permissionDenied'});
                break;
              case 'authorized':
                callback(null,store);
                break;
              case 'error':
                callback('error',null);
                break;
              default:
                callback(null,{type:'permissionDenied'});
            }
          });
          hub.emit('getAll:require_permission');
        } else { 
          switch (permission) {
            case 'denied':
              callback(null,{type:'permissionDenied'});
              break;
            case 'success':
              callback(null,store);
              break;
            case 'error':
              callback('error',null);
              break;
            default:
              callback(null,{type:'permissionDenied'});
          }
        }
      });
    },
  };
}
