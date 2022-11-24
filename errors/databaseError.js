class ObjectNotFoundError extends Error {
  constructor(message) {
    super(message);
    this.name = 'ObjectNotFoundError';
  }
}

class ObjectInvalidError extends Error {
  constructor(message) {
    super(message);
    this.name = 'ObjectInvalidError';
  }
}

module.exports = {ObjectNotFoundError, ObjectInvalidError};