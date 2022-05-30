package com.ekayworks.ex.support;

import com.ekayworks.ex.domain.enums.CateForQna;
import com.ekayworks.ex.domain.enums.Category;
import com.ekayworks.ex.domain.enums.Division;
import org.hibernate.engine.spi.Status;
import org.springframework.stereotype.Component;

import java.util.Arrays;
import java.util.List;

@Component
public class EnumProvider {
    public List<Status> getStatuses() {
        return Arrays.asList(Status.values());
    }
    public List<Division> getDivisions() {return Arrays.asList(Division.values());}
    public List<Category> getCategories() {return Arrays.asList(Category.values());}
    public List<CateForQna> getCateForQnas() {return Arrays.asList(CateForQna.values());}

}
