import RSVP from 'rsvp';
import Ember from 'ember';
/**
 * Given an array of params, this will go through the list one-by-one and call your
 * callback function until your function calls returnSuccess, at which point the
 * main Promise will resolve with that thing you passed it.
 *
 * The callback should have the following arguments (nextParam, returnSuccess, markAsFailure)

 * Your callback should do what it needs to do and if that thing is good, pass it to
 * returnSuccess. If that thing is bad call markAsFailure
 *
 * @method findFirst
 * @param {Array} params
 * @param {Function} callback(nextParam, returnSuccess, markAsFailure)
 * @returns {Promise  {result, failures} }
 */

function findFirst(params, callback) {
  return new RSVP.Promise((resolve, reject) => {
    let paramsToTry = Ember.copy(params);
    var failures = [];

    (function tryNext(tryThis) {
      tryThis
        .then(success => {
          resolve({ success, failures });
        })
        .catch(failure => {
          if (failure) {
            failures.push(failure);
          }
          let nextParam = paramsToTry.shift();
          if (!nextParam) {
            reject({ failures });
          }
          else {
            return tryNext(promisifyCallback(callback, nextParam));
          }
      });
    })(promisifyCallback(callback, paramsToTry.shift()));
  });
}

function promisifyCallback(callback, nextParam) {
  return new RSVP.Promise((returnSuccess, markFailure) => {
    callback(nextParam, returnSuccess, markFailure);
  });
}

export default {
  findFirst: findFirst
};
