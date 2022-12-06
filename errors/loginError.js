class LoginServerError extends Error {
    constructor(message) {
        super(message);
        this.name = 'LoginServerError';
        this.status = 500;
    }
}

class LoginFailedError extends Error {
    constructor(message) {
        super(message);
        this.name = 'LoginError';
        this.status = 200;
    }
}

class UsernameNotMatchError extends Error {
    constructor(message) {
        super(message);
        this.name = 'UsernameNotMatchError';
        this.status = 403;
    }
}

module.exports = {LoginServerError, LoginFailedError, UsernameNotMatchError};