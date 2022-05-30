package com.ekayworks.ex.domain.enums;

import com.core.epril.enumer.BaseEnum;

public enum CateForQna implements BaseEnum {
    문의1("문의1"),
    문의2("문의2"),
    문의3("문의3"),
    RECRUIT("채용");

    String descr;

    private CateForQna(String descr) {
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