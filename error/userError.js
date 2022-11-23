class UserNotFountError extends Error {
  constructor(message) {
    super(message);
    this.name = 'UserNotFoundError';
    this.status = 404;
  }
}

class UserFailedToUpdateError extends Error {
    constructor(message) {
        super(message);
        this.name = 'UserFailedToUpdateError';
        this.status = 500;
    }
}

module.exports = {UserNotFountError, UserFailedToUpdateError};