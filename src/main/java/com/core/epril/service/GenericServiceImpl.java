package com.core.epril.service;

import com.core.epril.entity.AuditEntity;
import com.core.epril.grid.SearchContext;
import com.core.epril.repository.BaseRepository;
import com.ekayworks.ex.support.security.SecurityHolder;
import org.modelmapper.ModelMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;

import javax.transaction.Transactional;
import java.io.Serializable;
import java.time.LocalDateTime;
import java.util.List;

@Transactional
public class GenericServiceImpl<E, P extends Serializable, R extends BaseRepository<E,P>> implements GenericService<E, P, R> {
	final protected Logger logger = LoggerFactory.getLogger(getClass());
	
	@Autowired protected ModelMapper mapper;
	@Autowired protected R repository;

	@Override
	public E add(E entity) {
		if (entity instanceof AuditEntity) {
			((AuditEntity)entity).setCreated(LocalDateTime.now());
            if (SecurityHolder.get() != null) ((AuditEntity)entity).setCreatedBy(SecurityHolder.get().getFakeUser());
		}
		return repository.save(entity);
	}
	
	@Override
	public E update(E entity) {
		if (entity instanceof AuditEntity) {
			((AuditEntity)entity).setUpdated(LocalDateTime.now());
			if (SecurityHolder.get() != null) ((AuditEntity)entity).setUpdatedBy(SecurityHolder.get().getFakeUser());
		}
		return repository.save(entity);
	}

	@Override
	public void deleteById(P id) {
		repository.deleteById(id);
	}

	@Override
	public void delete(E entity) {
		repository.delete(entity);
	}

	@Override
	public E get(P id) {
		return repository.getOne(id);
	}
	
	@Override
	public E find(P id) {
		return repository.findById(id).get();
	}

	@SuppressWarnings({ "unchecked", "rawtypes" })
	@Override
	public List<E> search(SearchContext<E> sc) {
		return repository.search((SearchContext)sc);
	}
}
