package com.core.epril.service;

import com.core.epril.grid.SearchContext;
import com.core.epril.repository.BaseRepository;

import java.io.Serializable;
import java.util.List;

public interface GenericService<E, P extends Serializable, R extends BaseRepository<E,P>> {
	E add(E entity);
	
	E update(E entity);

	void deleteById(P id);

	void delete(E entity);

	E get(P id);
	
	E find(P id);
	
	List<E> search(SearchContext<E> sc);
}
