package com.core.epril.formatter;

import com.core.epril.entity.AbstractEntity;
import com.core.epril.service.GenericService;
import org.springframework.format.Formatter;
import org.springframework.util.StringUtils;

import java.text.ParseException;
import java.util.Locale;

public class GenericModelFormatter<E extends AbstractEntity, S extends GenericService<E, Long, ?>>
		implements Formatter<E> {
	S service;

	public GenericModelFormatter(S service) {
		this.service = service;
	}

	@Override
	public String print(E object, Locale locale) {
		if (object == null) return "";
		return String.valueOf(object.getId());
	}

	@Override
	public E parse(String text, Locale locale) throws ParseException {
		if (StringUtils.hasText(text)) return service.get((Long) Long.parseLong(text));
		return null;
	}
}