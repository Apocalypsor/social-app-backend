class PostNotFoundError extends Error {
    constructor(message) {
        super(message);
        this.name = 'PostNotFoundError';
        this.status = 404;
    }
}

class PostFailedToCreateError extends Error {
    constructor(message) {
        super(message);
        this.name = 'PostFailedToCreateError';
        this.status = 500;
    }
}

class PostFailedToUpdateError extends Error {
    constructor(message) {
        super(message);
        this.name = 'PostFailedToUpdateError';
        this.status = 500;
    }
}


class PostFailedToDeleteError extends Error {
    constructor(message) {
        super(message);
        this.name = 'PostFailedToDeleteError';
        this.status = 500;
    }
}


module.exports = {
    PostNotFoundError,
    PostFailedToDeleteError,
    PostFailedToUpdateError,
    PostFailedToCreateError
}