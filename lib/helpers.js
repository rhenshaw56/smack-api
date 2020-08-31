const crypto = require('crypto');

const helpers = {};

helpers.hash = str => {
  if (typeof(str) === 'string' && str.length > 0) {
    return crypto.createHmac(
      'sha256',
      process.env.HASH_SECRET
      )
      .update(str)
      .digest();

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

module.exports = helpers;