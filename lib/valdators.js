
const validator = {};

validator.validateString = (data, requiredLength = 0) => typeof(data) === 'string'
  && data.trim().length > requiredLength
  ? data.trim()
  : false;

validator.validateBool = (data) => typeof(data) === 'boolean' && data === true ? true : false;


module.exports = validator;