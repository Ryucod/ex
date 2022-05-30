package com.ekayworks.ex.domain.enums;

import com.core.epril.enumer.BaseEnum;

public enum FileType implements BaseEnum {
    IMAGE("이미지"), ATTACH("첨부파일"), EXCEL("엑셀파일");

    String descr;

    private FileType(String descr) {
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
