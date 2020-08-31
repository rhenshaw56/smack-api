const _data = require('./data');
const validator = require('./valdators');
const helpers = require('./helpers');

const users = {};

// Data (required) -> firstName, lastName, phone, password, tosAgreement
// optional -> none
users.post = (data, cb) => {
  const firstName = validator.validateString(data.payload.firstName);
  const lastName = validator.validateString(data.payload.lastName);
  const password = validator.validateString(data.payload.password, 6);
  const phone = validator.validateString(data.payload.phone, 10);
  const tosAgreement = validator.validateBool(data.payload.tosAgreement);

  const user = {
    firstName,
    lastName,
    password,
    phone,
    tosAgreement
  };

  let missingFields;

  const isValidUser = Object.keys(user).every((value) => {

    const isValid = Boolean(user[value]);
    missingFields = !isValid ? value : '';
    return isValid;
  });

  console.log('isValidUser', isValidUser);

  if (isValidUser) {
    // ensure user doesn't exist
    _data.read('users', phone, (err, data) => {
      if (err) {
        // saving user as it doesn't exist


        // hash password
        const hashedPassword = helpers.hash(password);

        if(hashedPassword) {
          // update user password
          delete user.password;
          user.hashedPassword = hashedPassword;

          // store user
          _data.create('users', phone, user, (err) => {
            if (!err) {
              cb(200);
            } else {
              console.log(err);
              cb(500, { 'Error': 'Could not create user'});
            }
          });
        } else {
          cb(500, { 'Error': 'Invalid password field' });
        }

      } else {
        cb(400, {'Error': 'user with phone number already exist'});
      }

    });

  } else {
     cb(400, { 'Error': 'Missing required fields', 'field' : JSON.stringify(missingFields) });
  }

};


// Data (required) -> phone
// optional -> none
// @TODO let authed users only access their data
users.get = (data, cb) => {
  // Check phone number is valid
  const phone = validator.validateString(data.queryString.phone, 10);

  if (phone) {
    _data.read('users', phone, (err, data) => {
      if (!err && data) {
        // remove hashed password
        delete data.hashedPassword;
        cb(200, data);
      }  else {
        cb(404);
      }
    });

  } else {
    cb(400, { "Error": "Missing required field" });
  }
};

// Data (required) -> phone
// optional -> firstName, lastName, password {at least one}
// @TODO let authed users only access their data
users.put = (data, cb) => {
    // Check phone number is valid as it's required
    const phone = validator.validateString(data.payload.phone, 10);

    if (phone) {

    const firstName = validator.validateString(data.payload.firstName);
    const lastName = validator.validateString(data.payload.lastName);
    const password = validator.validateString(data.payload.password, 6);

    if (firstName || lastName || password) {
      _data.read('users', phone, (err, userData) => {
        if (!err && data) {
          // update fields
          if (firstName) {
            userData.firstName = firstName;
          }

          if (lastName) {
            userData.lastName = lastName;
          }

          if (password) {
            userData.hashedPassword = helpers.hash(password);
          }

          // Store updated user
          _data.update('users', phone, userData, (err) => {
            if (!err) {
              cb(200);
            } else {
              cb(500, { "Error": "could not update user"})
            }
          });
        } else {
          cb(400, { "Error": "specifed user does not exist" });
        }
      });
    } else {
      cb(400, { "Error": "Missing fields to update"});
    }

    } else {
      cb(404, { "Error": "Missing required field"});
    }
};

// Data (required) -> phone
// optional -> none
// @TODO let authed users only access their data
// @TODO also clean up all associated data
users.delete = (data, cb) => {
    // Check phone number is valid
    const phone = validator.validateString(data.queryString.phone, 10);

    if (phone) {
      _data.read('users', phone, (err, data) => {
        if (!err && data) {
          // remove hashed password
          _data.delete('users', phone, (err) => {

            if (!err) {
              cb(200)
            } else {
              cb(500, { "Error": "could not delete user"});
            }
          });
        }  else {
          cb(400, { "Error": "specifed user does not exist" });
        }
      });
  
    } else {
      cb(400, { "Error": "Missing required field" });
    }
};

module.exports = users;