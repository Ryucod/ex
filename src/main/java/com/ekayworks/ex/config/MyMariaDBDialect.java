package com.ekayworks.ex.config;

import org.hibernate.dialect.MariaDB102Dialect;
import org.hibernate.dialect.function.StandardSQLFunction;

public class MyMariaDBDialect extends MariaDB102Dialect {

    public MyMariaDBDialect() {
        super();
        registerFunction("GROUP_CONCAT", new StandardSQLFunction("GROUP_CONCAT"));
    }
}
