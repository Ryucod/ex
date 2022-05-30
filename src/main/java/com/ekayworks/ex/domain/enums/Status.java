package com.ekayworks.ex.domain.enums;

import com.core.epril.enumer.BaseEnum;

public enum Status implements BaseEnum {
	DRAFT("등록대기"), ACTIVE("사용"), HOLD("일시중지"), INACTIVE("사용중지");

	String descr;
	
	private Status(String descr) {
		this.descr = descr;
	}

	@Override
	public String getDescr() {
		return this.descr;
	}

	@Override
	public String getValue() {
		return this.name();
	}

}
