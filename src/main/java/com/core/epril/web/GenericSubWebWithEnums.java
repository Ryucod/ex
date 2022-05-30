package com.core.epril.web;

import com.core.epril.grid.GridReq;
import com.core.epril.grid.GridRes;
import com.core.epril.repository.BaseRepository;
import com.core.epril.service.GenericService;
import com.ekayworks.ex.support.EnumProvider;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.ModelAttribute;

import java.io.Serializable;

public abstract class GenericSubWebWithEnums<E,	P extends Serializable,	D, RQ extends GridReq<E>,
        RS extends GridRes<D>, S extends GenericService<E, P, ? extends BaseRepository<E, P>>>
        extends GenericSubWeb<E,P,D,RQ,RS,S> {

    @Autowired
    EnumProvider enumProvider;

    @ModelAttribute("enums")
    EnumProvider enums() {
        return enumProvider;
    }

}
