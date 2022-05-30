package com.core.epril.grid;

import com.querydsl.core.types.EntityPath;
import com.querydsl.jpa.JPQLQuery;

/**
 * Grid 검색조건 및 Paging 컨텍스트
 * @param <E>
 */
public interface SearchContext<E> {
    void applySearchCriteria(JPQLQuery q);

    void applyFieldCriteria(JPQLQuery q);

    void applyPagingCriteria(JPQLQuery q);

    void applyOrder(JPQLQuery q);

    EntityPath<E> getEntityPathBase();

    void setTotalPages(int totalRows);

    void setRecords(int records);

    int getTotalPages();

    int getPage();

    int getRowsPerPage();
}
