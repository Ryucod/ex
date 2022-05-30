package com.core.epril.grid;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.querydsl.core.types.EntityPath;
import com.querydsl.core.types.OrderSpecifier;
import com.querydsl.jpa.JPQLQuery;
import lombok.NoArgsConstructor;
import org.springframework.util.Assert;

/**
 * Grid 조회 조건
 *
 * @param <E>
 */
@JsonIgnoreProperties(ignoreUnknown = true) @NoArgsConstructor
public class GridReq<E> extends ExpressionUtils implements SearchContext<E> {
    int page = 1;    // current page
    int rows;    // rows per page;
    int total;    // total pages
    int records;    // total records retrieved

    EntityPath<E> path;    // entity path base
    OrderSpecifier<?> order;

    public GridReq(EntityPath<E> path) {
        this.path = path;
    }

    public GridReq(EntityPath<E> path, OrderSpecifier<?> order) {
        this.path = path;
        this.order = order;
    }

    public final EntityPath<E> getEntityPathBase() {
        return path;
    }

    @Override
    public void applySearchCriteria(JPQLQuery q) {
        applyFieldCriteria(q);
        applyPagingCriteria(q);
    }

    @Override
    public void applyOrder(JPQLQuery q) {
        Assert.notNull(order, "정렬 값 없음.");
        q.orderBy(this.order);
    }

    @Override
    public void applyFieldCriteria(JPQLQuery q) {
    }

    @Override
    public void applyPagingCriteria(JPQLQuery q) {
        if (rows < 1) {
            rows = 20;
        }
        q.limit(rows);
        q.offset((page - 1) * rows);
    }

    @Override
    public void setTotalPages(int totalPages) {
        total = totalPages;
    }

    @Override
    public int getTotalPages() {
        return total;
    }

    @Override
    public int getRowsPerPage() {
        return rows;
    }

    // getters and setters
    public int getPage() {
        return page;
    }

    public void setPage(int page) {
        this.page = page;
    }

    public int getRows() {
        return rows;
    }

    public void setRows(int rows) {
        this.rows = rows;
    }

    public int getRecords() {
        return records;
    }

    @Override
    public void setRecords(int records) {
        this.records = records;
    }
}
