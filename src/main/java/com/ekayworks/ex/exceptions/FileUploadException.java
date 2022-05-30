package com.ekayworks.ex.exceptions;

import lombok.Getter;
import lombok.Setter;

/**
 * 파일 업로드시 예외 처리
 * Exception Advice 에 전달용으로 사용됨.
 */
@Getter
public class FileUploadException extends RuntimeException {

    private String code;
    private String[] args;

    @Setter
    private String field;

    private String value;



    public FileUploadException(Throwable cause, String value, String code, String... args) {
        super(cause);
        this.value = value;
        this.code = code;
        this.args = args;
    }
}
