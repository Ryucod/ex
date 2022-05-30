package com.core.epril.grid;

import java.util.Arrays;

/**
 * Grid 응답용 wrapper
 *
 * @param <E>
 */
public class GridRes<E> {
    int page;
    int total;
    int records;

    E[] rows;

    public int getPage() {
        return page;
    }

    public void setPage(int page) {
        this.page = page;
    }

    public int getTotal() {
        return total;
    }

    public void setTotal(int total) {
        this.total = total;
    }

    public int getRecords() {
        return records;
    }

    public void setRecords(int records) {
        this.records = records;
    }

    public E[] getRows() {
        return rows;
    }

    public void setRows(E[] rows) {
        this.rows = rows;
    }

    @Override
    public String toString() {
        return "GridRes [page=" + page + ", total=" + total + ", records="
                + records + ", rows=" + Arrays.toString(rows) + "]";
    }
}
