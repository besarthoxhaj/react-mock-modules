'use strict';

const test = require('tape');
const contacts_function = require('../index.js').Contacts;
const create_hub = require('../src/utils/hub.js');

test('checkPermission -> should return a callback with permission', t => {

  t.plan(2);

  const contacts = contacts_function({permission:'denied'});

  contacts.checkPermission((err,permission) => {
    t.notOk(err,'no errors');
    t.equal(permission,'denied','got denied');
  });
});

test('requestPermission -> should return a callback with permission', t => {

  t.plan(3);

  const hub = create_hub();
  const contacts = contacts_function({hub:hub});

  hub.addEventListener('require_permission', () => {
    t.pass('asking user permission');
    hub.emit('contacts:user_input','authorized');
  });

  contacts.requestPermission((err,permission) => {
    t.notOk(err,'no errors');
    t.equal(permission,'authorized','got authorized');
  });
});

test('getAll -> should get all contacts', t => {

  t.plan(2);

  const contacts = contacts_function({permission:'authorized'});

  contacts.getAll((err,contacts) => {
    t.notOk(err,'no errors');
    t.equal(contacts.length,2,'got two contacts');
  });
});

test('getAll -> should return `permissionDenied` if no permission', t => {

  t.plan(2);

  const contacts = contacts_function({permission:'denied'});

  contacts.getAll((err,contacts) => {
    t.notOk(err,'no error');
    t.equal(contacts.type,'permissionDenied','got permissionDenied');
  });
});

test('getAll -> when asked contacts for the first time ask permission `authorized`', t => {

  t.plan(3);

  const hub = create_hub();
  const contacts = contacts_function({hub:hub});

  hub.addEventListener('getAll:require_permission', () => {
    t.pass('asking user permission');
    hub.emit('getAll:user_input','authorized');
  });

  contacts.getAll((err,contacts) => {
    t.notOk(err,'no errors');
    t.equal(contacts.length,2,'got two contacts');    
  });
});

test('getAll -> when asked contacts for the first time ask permission `denied`', t => {

  t.plan(3);

  const hub = create_hub();
  const contacts = contacts_function({hub:hub});

  hub.addEventListener('getAll:require_permission', () => {
    t.pass('asking user permission');
    hub.emit('getAll:user_input','denied');
  });

  contacts.getAll((err,contacts) => {
    t.notOk(contacts,'no contacts');
    t.equal(err.type,'permissionDenied','got permissionDenied');
  });
});

test('should be able to promisify module', t => {

  t.plan(2);

  const Promise = require('bluebird');
  const contacts_ok = contacts_function({permission:'authorized'});
  const contacts_error = contacts_function({permission:'error'});
  const promise_contacts_ok = Promise.promisifyAll(contacts_ok);
  const promise_contacts_error = Promise.promisifyAll(contacts_error);

  promise_contacts_ok.checkPermissionAsync()
  .then(data => {
    t.equal(data,'authorized','got authorized');
    return promise_contacts_error.getAllAsync();
  })
  .then(data => {
    // will never reach this point
  })
  .catch(error => {
    t.equal(error.cause.toString(),'Error: error','got error');
  });
});

test('should be able to promisify module `getAllAsync`', t => {

  t.plan(1);

  const Promise = require('bluebird');
  const contacts_ok = contacts_function({permission:'authorized'});
  const contacts_error = contacts_function({permission:'error'});
  const promise_contacts_ok = Promise.promisifyAll(contacts_ok);
  const promise_contacts_error = Promise.promisifyAll(contacts_error);

  promise_contacts_ok.getAllAsync()
  .then(data => {
    t.equal(data.length,2,'got two contacts');
  })
  .catch(error => {
    t.end();
  });
});

test('promise `getAllAsync` with no permission should reject with error', t => {

  t.plan(2);

  const Promise = require('bluebird');
  const hub = create_hub();
  const contacts_denied = contacts_function({permission:undefined,hub:hub});
  const promise_contacts_denied = Promise.promisifyAll(contacts_denied);

  hub.addEventListener('getAll:require_permission', () => {
    t.pass('asking user permission');
    hub.emit('getAll:user_input','denied');
  });

  promise_contacts_denied.getAllAsync()
  .then(data => {
    // nothing here
  })
  .catch(error => {
    t.equal(error.type,'permissionDenied','got permission denied');
  });
});
