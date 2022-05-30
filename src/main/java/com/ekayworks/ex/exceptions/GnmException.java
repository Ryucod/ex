package com.ekayworks.ex.exceptions;

/**
 *
 */
public class GnmException extends RuntimeException {
    public GnmException() {
        super();
    }

    public GnmException(String message) {
        super(message);
    }

    public GnmException(String message, Throwable cause) {
        super(message, cause);
    }

    public GnmException(Throwable cause) {
        super(cause);
    }

    protected GnmException(String message, Throwable cause, boolean enableSuppression, boolean writableStackTrace) {
        super(message, cause, enableSuppression, writableStackTrace);
    }
}
