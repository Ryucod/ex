package com.ekayworks.ex.domain.enums;

import com.core.epril.enumer.BaseEnum;

public enum Division implements BaseEnum {
	NOTICE("공지사항"),
	RECRUIT("채용");

	String descr;

	private Division(String descr) {
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
