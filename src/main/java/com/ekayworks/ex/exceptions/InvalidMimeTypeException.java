package com.ekayworks.ex.exceptions;

public class InvalidMimeTypeException extends FileHandlerException {

	private static final long serialVersionUID = 1L;

	public InvalidMimeTypeException(String filename, String allowMime, String currentMime) {
		super(String.format("허용되지 않는 파일형식 : 파일-%s, 허용MIME-%s, 파일MIME-%s", filename, allowMime, currentMime));
	}
	
}
