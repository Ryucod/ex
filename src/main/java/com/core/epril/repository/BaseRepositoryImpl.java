package com.core.epril.repository;

import com.core.epril.grid.SearchContext;
import com.querydsl.core.types.EntityPath;
import com.querydsl.core.types.dsl.PathBuilder;
import com.querydsl.core.types.dsl.PathBuilderFactory;
import com.querydsl.jpa.JPQLQuery;
import org.springframework.data.jpa.repository.support.JpaMetamodelEntityInformation;
import org.springframework.data.jpa.repository.support.Querydsl;
import org.springframework.data.jpa.repository.support.SimpleJpaRepository;

import javax.persistence.EntityManager;
import java.io.Serializable;
import java.util.List;

public class BaseRepositoryImpl<E, ID extends Serializable> extends SimpleJpaRepository<E, ID> implements BaseRepository<E, ID> {
    private EntityManager entityManager;
    private Querydsl querydsl;
    private PathBuilder<?> pathBuilder;

    public BaseRepositoryImpl(JpaMetamodelEntityInformation information, EntityManager entityManager) {
        super(information.getJavaType(), entityManager);
        this.entityManager = entityManager;

        this.pathBuilder = new PathBuilderFactory().create(information.getJavaType());
        this.querydsl = new Querydsl(this.entityManager, pathBuilder);
    }

    @Override
    public Querydsl getQuerydsl() {
        return querydsl;
    }

    @Override
    public void detach(E entity) {
        entityManager.detach(entity);
    }

    @Override
    public void clear() {
        entityManager.clear();
    }

    @Override
    public List<E> search(SearchContext<E> sc) {
        EntityPath<E> path = sc.getEntityPathBase();
        calcCount(sc, path);
        return getResults(sc, path);
    }

    @SuppressWarnings("unchecked")
    private List<E> getResults(SearchContext<E> sc, EntityPath<E> path) {
        JPQLQuery q = querydsl.createQuery(path);
        sc.applySearchCriteria(q);
        sc.applyOrder(q);
        return q.select(path).fetch();
    }

    private void calcCount(SearchContext<E> sc, EntityPath<E> path) {
        JPQLQuery q = querydsl.createQuery(path);
        sc.applyFieldCriteria(q);
        long records = q.fetchCount();
        sc.setRecords((int) records);
        sc.setTotalPages((int) Math.ceil(((double) records / sc.getRowsPerPage())));
    }
}
