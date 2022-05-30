package com.ekayworks.ex.exceptions;

/**
 * 파일 핸들 예외
 * 반드시 처리해야 함으로 checked Exception 발생시킴
 *
 * @author RealGurus
 */
public class FileHandlerException extends RuntimeException {

	private static final long serialVersionUID = 1L;

	public FileHandlerException(String message) {
		super(message);
	}

	public FileHandlerException(String message, Throwable cause) {
		super(message, cause);
	}

}
