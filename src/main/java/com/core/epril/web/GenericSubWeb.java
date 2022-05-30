package com.core.epril.web;

import com.core.epril.grid.GridReq;
import com.core.epril.grid.GridRes;
import com.core.epril.repository.BaseRepository;
import com.core.epril.service.GenericService;
import org.springframework.ui.Model;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.support.SessionStatus;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

import javax.validation.Valid;
import java.io.Serializable;

/**
 * Subgrid(edit이나 add화면에 나오는 그리드)용 Generic Web.
 * <p>
 * 1. URL 구조
 * - edit/{ownerid}/$model/grid
 * - edit/{ownerid}/$model/subadd	- url이 다름
 * - edit/{ownerid}/$model/subedit	- url이 다름
 * - edit/{ownerid}/$model/delete  - GenericWeb과 동일
 * <p>
 * 2. ownerName()
 * <p>
 * owner의 model명
 * <p>
 * 3. addSubEntity, editSubEntity
 * <p>
 * ownerId를 이용해서 추가 또는 수정 기능 작성
 *
 * @param <E>
 * @param <P>
 * @param <D>
 * @param <RQ>
 * @param <RS>
 * @param <S>
 * @author Toby
 */
public abstract class GenericSubWeb<
        E, // 0
        P extends Serializable, // 1
        D, // 2
        RQ extends GridReq<E>, // 3
        RS extends GridRes<D>,  // 4
        S extends GenericService<E, P, ? extends BaseRepository<E, P>>>
        extends GenericWeb<E, P, D, RQ, RS, S> {

    /**
     * owner(main) 모듈 이름
     *
     * @return
     */
    protected abstract String ownerName();


    /**
     * ======================== ADD ======================
     **/
    @Override
    public String addform(Model model) {
        throw new UnsupportedOperationException("use '/subadd' instead");
    }

    @Override
    public String addsubmit(E entity, BindingResult errors, SessionStatus status, Model model, RedirectAttributes redirectAttributes) {
        throw new UnsupportedOperationException("use '/subadd' instead");
    }

    @Override
    protected void addEntity(E entity) {
        throw new UnsupportedOperationException();
    }

    @RequestMapping(value = "/subadd", method = RequestMethod.GET)
    public String addform(@PathVariable("ownerid") P ownerid, Model model) {
        E entity = createEntity();
        defaults(entity, ownerid);
        model.addAttribute(modelName(), entity);
        formReferenceData(model, entity, ownerid);
        addReferenceData(model, entity, ownerid);

        return addFormView();
    }

    protected void defaults(E entity, P ownerid) {
        super.defaults(entity);
    }

    @Override
    protected String addFormView() {
        return prefix() + ownerName() + "/sub" + moduleName() + "add";
    }

    @RequestMapping(value = "/subadd", method = RequestMethod.POST)
    public String addsubmit(@PathVariable("ownerid") P ownerid, @ModelAttribute @Valid E entity, BindingResult errors, SessionStatus status, Model model, RedirectAttributes redirectAttributes) {
        validate(entity, errors);
        validate(entity, errors, ownerid);
        validateAdd(entity, errors);
        validateAdd(entity, errors, ownerid);
        if (errors.hasErrors()) {
            touchEntity(entity);
            formReferenceData(model, entity, ownerid);
            addReferenceData(model, entity, ownerid);
            return addFormView();
        }

        status.setComplete();
        addSubEntity(ownerid, entity);

        return addSuccessView(entity, model, redirectAttributes);
    }


    /**
     * owner.id가 필요한 validate
     *
     * @param entity
     * @param errors
     * @param ownerid
     */
    protected void validate(E entity, BindingResult errors, P ownerid) {};
    protected void validateAdd(E entity, BindingResult errors, P ownerid) {};
    protected void validateEdit(E entity, BindingResult errors, P ownerid) {};


    protected abstract void addSubEntity(P ownerid, E entity);

    /**
     * ======================== UPDATE ======================
     **/

    @Override
    public String editform(P id, Model model) {
        throw new UnsupportedOperationException("use '/subedit' instead");
    }

    @Override
    public String editsubmit(P id, E entity, BindingResult errors, SessionStatus status, Model model, RedirectAttributes ra) {
        throw new UnsupportedOperationException("use '/subedit' instead");
    }


    @Override
    protected void editEntity(E entity) {
        throw new UnsupportedOperationException();
    }

    @RequestMapping(value = "/{id}/subedit")
    public String editform(@PathVariable("ownerid") P ownerid, @PathVariable P id, Model model) {
        E entity = service.find(id);
        touchEntity(entity);
        model.addAttribute(modelName(), entity);
        formReferenceData(model, entity, ownerid);
        editReferenceData(model, entity, ownerid);
        return editFormView();
    }

    @Override
    protected String editFormView() {
        return prefix() + ownerName() + "/sub" + moduleName() + "edit";
    }

    @RequestMapping(value = "/{id}/subedit", method = RequestMethod.POST)
    public String editsubmit(@PathVariable("ownerid") P ownerid, P id, @ModelAttribute @Valid E entity, BindingResult errors, SessionStatus status, Model model, RedirectAttributes ra) {
        validate(entity, errors);
        validate(entity, errors, ownerid);
        validateEdit(entity, errors);
        validateEdit(entity, errors, ownerid);
        if (errors.hasErrors()) {
            touchEntity(entity);
            formReferenceData(model, entity, ownerid);
            editReferenceData(model, entity, ownerid);
            return editFormView();
        }

        status.setComplete();
        editSubEntity(ownerid, entity);

        return editSuccessView(entity, model, ra);
    }

    abstract protected void editSubEntity(P ownerid, E entity);

    /**
     * ======================== VALIDATION ======================
     **/

    protected void formReferenceData(Model model, E entity, P ownerid) {
        super.formReferenceData(model, entity);
    }

    protected void addReferenceData(Model model, E entity, P ownerid) {
        super.addReferenceData(model, entity);
    }

    protected void editReferenceData(Model model, E entity, P ownerid) {
        super.editReferenceData(model, entity);
    }

}
