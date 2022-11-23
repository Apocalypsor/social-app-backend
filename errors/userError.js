class UserNotFoundError extends Error {
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

class UserFailedToCreateError extends Error {
    constructor(message) {
        super(message);
        this.name = 'UserFailedToCreateError';
        this.status = 500;
    }
}

class UserFailedToDeleteError extends Error{
    constructor(message) {
        super(message);
        this.name = 'UserFailedToDeleteError';
        this.status = 500;
    }
}

module.exports = {
    UserNotFoundError,
    UserFailedToUpdateError,
    UserFailedToCreateError,
    UserFailedToDeleteError
};