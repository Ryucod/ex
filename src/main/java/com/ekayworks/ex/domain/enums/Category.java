package com.ekayworks.ex.domain.enums;

import com.core.epril.enumer.BaseEnum;

public enum Category implements BaseEnum {
	PRS_JSU("PRS/JSU"),
	BUSINESS_SUPPORT("경영지원"),
	FUNDING_SUPPORT("기금지원"),
	RECRUIT("채용");

	String descr;

	private Category(String descr) {
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
