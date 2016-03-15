'use strict';

const test = require('tape');
const contacts_function = require('../src/contacts.js');
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

  const contacts = contacts_function({permission:'success'});

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
    t.notOk(err,'no errors');
    t.equal(contacts.type,'permissionDenied','got permissionDenied');
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
