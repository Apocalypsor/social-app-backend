class ObjectNotFoundError extends Error {
  constructor(message) {
    super(message);
    this.name = 'ObjectNotFoundError';
  }
}

module.exports = {ObjectNotFoundError};