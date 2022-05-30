package com.ekayworks.ex.exceptions;

public class OverSizeException extends FileHandlerException {

	private static final long serialVersionUID = 1L;

	public OverSizeException(String filename, long maxSize, long fileSize) {
		super(String.format("파일용량 초과 : %s 허용사이즈-%dkb 파일사이즈-%dkb", filename, (long)maxSize/1024, (long)fileSize/1024));
	}
}
