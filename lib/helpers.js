const crypto = require('crypto');

const helpers = {};

helpers.hash = str => {
  if (typeof(str) === 'string' && str.length > 0) {
    return crypto.createHmac(
      'sha256',
      process.env.HASH_SECRET
      )
      .update(str)
      .digest('hex');

  } else {
    return false;
  };
};

helpers.parseJSONToObject = JsonStr => {
  try {
    const parsedJson = JSON.parse(JsonStr);
    return parsedJson;

  } catch(err) {

    return {};
  }
};

helpers.createRandomString = strLength => {
  strLength = typeof(strLength) === 'number' && strLength > 0 ? strLength : false;
  if (strLength) {
    const possibleChars = 'abcdefghijklmnopqrstuvwxz0123456789'
    let str = '';

    for (let i = 1; i<= strLength; i++) {
      // get random char from possibleChars
      const randomChar = possibleChars.charAt(Math.floor(Math.random() * possibleChars.length));

      // append
      str += randomChar;
    }
    return str;
  } else {
    return false;
  }
}

module.exports = helpers;