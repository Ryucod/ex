package com.ekayworks.ex.exceptions;

public class InvalidFileNameException extends FileHandlerException {

	private static final long serialVersionUID = 1L;

	public InvalidFileNameException(String filename) {
		super(String.format("업로드 할 수 없는 파일 이름 : %s", filename));
	}
	
}
