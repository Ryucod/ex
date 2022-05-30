package com.ekayworks.ex.exceptions;

public class InvalidFileExtNameException extends FileHandlerException {

	private static final long serialVersionUID = 1L;
	
	public InvalidFileExtNameException(String filename) {
		super(String.format("업로드 할 수 없는 확장자 : %s", filename));
	}

}
