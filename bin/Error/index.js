class JediError extends Error {
    constructor(code, subcode = null, message = "Something went wrong") {
        super(message);
        this.code = code;
        this.subcode = subcode;
    }
}

module.exports = JediError;