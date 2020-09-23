const _data = require('./data');
const validator = require('./valdators');
const helpers = require('./helpers');

const checks = {};

// Data (required) -> HTTPprotocol, url, HTTPmethod, successCodes, timeoutSeconds
// optional -> none
checks.post = (data, cb) => {
  const protocol = validator.validateString(data.payload.protocol);
  const url = validator.validateString(data.payload.url);
  const method = validator.validateString(data.payload.method);
  const successCodes = typeof(data.payload.successCodes) === 'object'
    && data.payload.successCodes instanceof Array
    && data.payload.successCodes.length > 0
    ? data.payload.successCodes
    : false;
  const timeoutSeconds = typeof(data.payload.timeoutSeconds) === 'number'
    && data.payload.timeoutSeconds % 1 === 0
    && data.payload.timeoutSeconds >= 1
    && data.payload.timeoutSeconds <= 5
    ? data.payload.timeoutSeconds
    : false;

  if (protocol && url && method && successCodes && timeoutSeconds) {
    const token = validator.validateString(data.headers.token, 10);

    _data.read('auth', token, (err, authData) => {
      if (!err && authData) {
        const phone = authData.phone;
        _data.read('users', phone, (err, userData) => {
          if (!err && userData) {
            const userChecks = typeof(userData.checks) === 'object'
              && userData.checks instanceof Array
              ? userData.checks : [];

            if (userChecks.length < process.env.MAX_CHECK_LIMIT) {
              // create random id for new check
              const checkId = helpers.createRandomString(20);

              // create check object and include user's phone
              const checkData = {
                'id': checkId,
                'userPhone': phone,
                protocol,
                url,
                method,
                successCodes,
                timeoutSeconds,
              };

              // save checks
              _data.create('checks', checkId, checkData, (err) => {
                if (!err) {
                  userData.checks = userChecks;
                  userData.checks.push(checkId);

                  // save user
                  _data.update('users', phone, userData, (err) => {
                    if (!err) {
                      cb(200, checkData);

                    } else {
                      cb(500, { "Error": "Could not update user with new check" });
                    }
                  });

                } else {
                  cb(400, { "Error": "Could not create new check" });
                }
              });
            } else {
              cb(400, { 'Error': 'Maximum checks limit reached (5)' });
            }

          } else {
            cb(403);
          }
        })
      } else {
        cb(403);
      }
    })

  } else {
    cb(400, { 'Error': 'Missing required fields or Inputs ar invalid'});

  }

};


// Data (required) -> id (checkId)
// optional -> none
checks.get = (data, cb) => {
  // Check phone number is valid
  const checkId = validator.validateString(data.queryString.id, 20);
  console.log('checkID', checkId, data.queryString.id);

  if (checkId) {

    _data.read('checks', checkId, (err, checkData) => {
      if (!err && checkData) {
            // get token from headers
        const token = validator.validateString(data.headers.token, 10);
        const phone = checkData.userPhone;
        validator.validateSession(token, phone, (isValidSession) => {
          if (isValidSession) {
            cb(200, checkData);
          } else {
            cb(403, { "Error": 'Invalid Session' });
          }
        });
      } else {
        cb(404);
      }
    });
  } else {
    cb(400, { "Error": "Missing required field" });
  }
};

// Data (required) -> checkId
// optional -> protocol, url, successCodes, method, timeOutSecoonds  {at least one}
checks.put = (data, cb) => {
    // Check phone number is valid as it's required
    const checkId = validator.validateString(data.payload.id, 20);

    if (checkId) {

    const protocol = validator.validateString(data.payload.protocol);
    const url = validator.validateString(data.payload.url);
    const method = validator.validateString(data.payload.method);
    const timeoutSeconds = data.payload.timeoutSeconds;
    const successCodes = data.payload.successCodes;

    if (protocol || url || method || timeoutSeconds || successCodes) {
        // get token from headers
        _data.read('checks', checkId, (err, checkData) => {
          if (!err && checkData) {


            const token = validator.validateString(data.headers.token, 10);
            const phone = checkData.userPhone;

            validator.validateSession(token, phone, (isValidSession) => {
              if (isValidSession) {
                // update fields
                if (protocol) {
                  checkData.protocol = protocol;
                }
      
                if (url) {
                  checkData.url = url;
                }
      
                if (method) {
                  checkData.method = method;
                }

                if (timeoutSeconds) {
                  checkData.timeoutSeconds = timeoutSeconds;
                }

                if (successCodes) {
                  checkData.successCodes = successCodes;
                }
      
                // Store updated checks
                _data.update('checks', checkId, checkData, (err) => {
                  if (!err) {
                    cb(200);
                  } else {
                    cb(500, { "Error": "could not update check"})
                  }
                });
              } else {
                cb(403, { "Error": 'Invalid Session' });
              }
            });
          } else {
            cb(404);
          }
        });
    } else {
      cb(400, { "Error": "Missing fields to update"});
    }

    } else {
      cb(404, { "Error": "Missing required field"});
    }
};

// Data (required) -> checkID
// optional -> none
// @TODO also clean up all associated data
checks.delete = (data, cb) => {
    // Check phone number is valid
    const checkId = validator.validateString(data.queryString.id, 10);

    if (checkId) {
      _data.read('checks', checkId, (err, checkData) => {
        if (!err && data) {
          const token = validator.validateString(data.headers.token, 10);
          const phone = checkData.userPhone;
          validator.validateSession(token, phone, (isValidSession) => {
            if (isValidSession) {
              _data.delete('checks', checkId, (err) => {
                if (!err) {
                  _data.read('users', phone, (err, userData) => {
                    if (!err && userData) {
                      const userChecks = typeof(userData.checks) === 'object'
                      && userData.checks instanceof Array
                      ? userData.checks : [];

                      const checkPosition = userChecks.indexOf(checkId);
                      if (checkPosition > -1) {
                        userChecks.splice(checkPosition, 1);
                        _data.update('users', phone, userData, (err) => {
                          if (!err) {
                            cb(200);
                          } else {
                            cb(500, { "Error": "could not delete associated check with user"});
                          }
                        });
                      } else {
                        cb(500, { "Error": "check not associated with user"});
                      }

                    } else {
                      cb(500, { "Error": "could not find check creator"});
                    }
                  });
                } else {
                  cb(500, { "Error": "could not delete check"});
                }
              });
            } else {
              cb(403, { "Error": 'Invalid Session' });
            }
          });
        }  else {
          cb(400, { "Error": "specifed check does not exist" });
        }
      });
    } else {
      cb(400, { "Error": "Missing required field" });
    }
};

module.exports = checks;