package com.core.epril.grid;

import com.querydsl.core.types.dsl.*;
import com.querydsl.jpa.JPQLQuery;
import lombok.extern.slf4j.Slf4j;
import org.hibernate.criterion.MatchMode;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

import static org.springframework.util.StringUtils.hasText;

/**
 * QueryDSL 조건 설정용
 */
@Slf4j
public class ExpressionUtils {

    public static void like(JPQLQuery query, StringPath path, String value, MatchMode mode) {
        if (hasText(value)) query.where(path.like(mode.toMatchString(value)));
    }

    public static void notLike(JPQLQuery query, StringPath path, String value, MatchMode mode) {
        if (hasText(value)) query.where(path.notLike(mode.toMatchString(value)));
    }

    public static <T> void eq(JPQLQuery query, SimpleExpression<T> path, T value) {
        if (value != null) query.where(path.eq(value));
    }

    public static <T> void neq(JPQLQuery query, SimpleExpression<T> path, T value) {
        if (value != null) query.where(path.ne(value));
    }

    public static <T> void eqId(JPQLQuery query, SimpleExpression<Long> path, long id) {
        if (id > 0) query.where(path.eq(id));
    }

    public static void eq(JPQLQuery query, StringPath path, String value) {
        if (hasText(value)) query.where(path.eq(value));
    }

    public static <T extends Enum<T>> void eq(JPQLQuery q, EnumPath<T> path, String value, Class<T> cl) {
        if (!hasText(value)) return;
        eq(q, path, Enum.valueOf(cl, value));
    }

    public static <T> void isNull(JPQLQuery query, SimpleExpression<T> path) {
        query.where(path.isNull());
    }

    public static <T> void isNotNull(JPQLQuery query, SimpleExpression<T> path) {
        query.where(path.isNotNull());
    }

    public static <T> void in(JPQLQuery query, SimpleExpression<T> path, List<T> value){
        if (value !=null) query.where(path.in(value));
    }
    public static <T> void notIn(JPQLQuery query, SimpleExpression<T> path, List<T> value){
        if (value !=null) query.where(path.notIn(value));
    }

    /**
     * beforeDateTime - 1day
     *
     * @param query
     * @param path
     * @param before
     * @param <T>
     */
    public static <T> void before(JPQLQuery query, DateTimePath path, LocalDateTime before) {
        if (before != null) query.where(path.before(before.plusDays(1)));
    }

    public static <T> void after(JPQLQuery query, DateTimePath path, LocalDateTime after) {
        if (after != null) query.where(path.goe(after));
    }

    public static <T> void before(JPQLQuery query, DatePath path, LocalDate before) {
        if (before != null) query.where(path.before(before));
    }

    public static <T> void after(JPQLQuery query, DatePath path, LocalDate after) {
        if (after != null) query.where(path.goe(after));
    }

    public static <T> void loe(JPQLQuery query, DatePath path, LocalDate toDate) {
        if (toDate != null) query.where(path.loe(toDate));
    }

    public static <T> void goe(JPQLQuery query, DatePath path, LocalDate fromDate) {
        if (fromDate != null) query.where(path.goe(fromDate));
    }

    public static DateTimeFormatter dateFormatter = DateTimeFormatter.ofPattern("yyyy/MM/dd");

    public static void betweenDate(JPQLQuery query, DatePath<LocalDate> path, String from, String to) {
        log.info("from, to::{} / {}", from, to);
        if (!hasText(from) || !hasText(to)) return;

        LocalDate fromDt = null;
        LocalDate toDt = null;
        try {
            fromDt = LocalDate.parse(from.replace('-','/'), dateFormatter);
            toDt = LocalDate.parse(to.replace('-','/'), dateFormatter);
        }
        catch(IllegalArgumentException e) {
            throw e;
        }

        if (fromDt.isAfter(toDt)) return;

        query.where(path.between(fromDt, toDt));
    }
}
