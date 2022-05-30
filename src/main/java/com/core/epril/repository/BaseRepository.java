package com.core.epril.repository;

import com.core.epril.grid.SearchContext;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.support.Querydsl;
import org.springframework.data.repository.NoRepositoryBean;

import java.io.Serializable;
import java.util.List;

/**
 * 공통 기준 리포지토리
 *
 * @param <E>
 * @param <ID>
 */
@NoRepositoryBean
public interface BaseRepository<E, ID extends Serializable> extends JpaRepository<E, ID> {
    /**
     *
     * @return
     */
    Querydsl getQuerydsl();

    /**
     * entity를 detach(session에서 제거)
     *
     * @param entity
     */
    void detach(E entity);

    /**
     * Session cache를 모두 제거해준다. 모든 엔티티에 대해서 detach
     */
    void clear();

    /**
     * SearchContext를 기준으로 동적 페이징 쿼리 실행후 결과를 리턴.
     * 클라이언트에 리턴할 페이징 관련 정보는 ctx에 남김.
     *
     * @param ctx
     * @return
     */
    List<E> search(SearchContext<E> ctx);
}
