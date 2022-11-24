class CommentNotFoundError extends Error {
    constructor(message) {
        super(message);
        this.name = "CommentNotFoundError";
        this.status = 404;
    }
}

class CommentFailedToCreateError extends Error {
    constructor(message) {
        super(message);
        this.name = "CommentFailedToCreateError";
        this.status = 500;
    }
}

class CommentFailedToUpdateError extends Error {
    constructor(message) {
        super(message);
        this.name = "CommentFailedToUpdateError";
        this.status = 500;
    }
}

class CommentFailedToDeleteError extends Error {
    constructor(message) {
        super(message);
        this.name = "CommentFailedToDeleteError";
        this.status = 500;
    }
}

module.exports = {CommentNotFoundError, CommentFailedToCreateError, CommentFailedToUpdateError, CommentFailedToDeleteError};