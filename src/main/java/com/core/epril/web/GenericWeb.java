package com.core.epril.web;

import com.core.epril.grid.GridReq;
import com.core.epril.grid.GridRes;
import com.core.epril.repository.BaseRepository;
import com.core.epril.service.GenericService;
import com.core.epril.utils.ReflectionUtils;
import org.modelmapper.ModelMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationContext;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.ui.Model;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.bind.support.SessionStatus;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

import javax.annotation.PostConstruct;
import javax.validation.Valid;
import java.beans.Introspector;
import java.io.Serializable;
import java.lang.reflect.Array;
import java.util.List;

/**
 * @param <E>
 * @param <P>
 * @param <D>
 * @param <RQ>
 * @param <RS>
 * @param <S>
 * @author Toby
 */
public abstract class GenericWeb<
        E, // 0
        P extends Serializable, // 1
        D, // 2
        RQ extends GridReq<E>, // 3
        RS extends GridRes<D>,  // 4
        S extends GenericService<E, P, ? extends BaseRepository<E, P>>> {
    protected Logger logger = LoggerFactory.getLogger(getClass());

    protected boolean reloadWhenClose;	// add,edit 창을 닫을 때 main grid를 reload할지 여부

    protected static final String CLOSE_AND_REFRESH_VIEW = "closeandrefresh";
    protected static final String CLOSE_AND_RELOAD_VIEW = "closeandreload";
    protected static final String STAY_OPEN_AND_RELOAD_VIEW = "stayopenandreload";
    protected static final String MOVE_AND_RELOAD_VIEW = "moveandreload";

    protected static final String ADD_MSG = "1";
    protected static final String EDIT_MSG = "2";
    protected static final String DELETE_MSG = "3";
    protected static final String DELETE_FAIL_MSG = "4";
    protected static final String CUSTOM_MSG = "9";

    @Autowired protected ApplicationContext ac;
    @Autowired protected S service;
    @Autowired protected ModelMapper mapper;

    protected Class<E> entityClass;
    protected Class<RS> gridResClass;
    protected Class<D> dataClass;

    private String defaultModuleName;

    /**
     * URL 생성 등에 사용하는 모듈 이름
     *
     * @return
     */
    protected String moduleName() {
        return this.defaultModuleName;
    }

    /**
     * Session 저장, <form:form> & @ModelAttribute 이름으로 사용하는 모델 이름
     *
     * @return
     */
    protected String modelName() {
        return this.defaultModuleName;
    }

    protected String prefix() {
        return "";
    }

    @PostConstruct
    public final void initInternal() {
        entityClass = ReflectionUtils.getGenericTypeParam(getClass(), 0);
        dataClass = ReflectionUtils.getGenericTypeParam(getClass(), 2);
        gridResClass = ReflectionUtils.getGenericTypeParam(getClass(), 4);

        /**
         * Session 저장, <form:form> & @ModelAttribute 이름으로 사용하는 모델 이름
         * 카멜케이스 때문에 Introspector.decapitalize(entityClass.getSimpleName()); 변경
         */
        this.defaultModuleName = Introspector.decapitalize(entityClass.getSimpleName());
//        this.defaultModuleName = entityClass.getSimpleName().toLowerCase();
    }

    /*******************************************************/
    /*                    MAIN/GRID                        */

    /*******************************************************/
    @RequestMapping
    public String main(Model model) {
//        model.addAttribute("loginUser", SecurityHolder.get().getFakeUser());
        mainReferenceData(model);
        return prefix() + moduleName() + "/" + moduleName() + "main";
    }

    /**
     * reference data for main page
     *
     * @param model
     */
    protected void mainReferenceData(Model model) {
    }

    @RequestMapping(value = "/grid")
    @ResponseBody
    public RS grid(RQ req) {
        touchReq(req);
        List<E> codes = service.search(req);

        return convertToData(req, codes);
    }

    protected void touchReq(RQ req) {
    }

    @SuppressWarnings("unchecked")
    protected RS convertToData(RQ req, List<E> list) {
        RS res;
        try {
            res = gridResClass.newInstance();
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
        res.setTotal(req.getTotalPages());
        res.setPage(req.getPage());
        res.setRecords(req.getRecords());

        D[] data = (D[]) Array.newInstance(dataClass, list.size());
        int i = 0;

        for (E c : list) {
            data[i] = mapper.map(c, dataClass);
            convertMore(c, data[i]);
            i++;
        }

        res.setRows(data);

        return res;
    }

    protected void convertMore(E entity, D data) {
    }

    /*******************************************************/
    /*                      ADD                            */

    /*******************************************************/

    @RequestMapping(value = "/add", method = RequestMethod.GET)
    public String addform(Model model) {
        E entity = createEntity();
        defaults(entity);
        model.addAttribute(modelName(), entity);
        formReferenceData(model, entity);
        addReferenceData(model, entity);

        return addFormView();
    }

    /**
     * add form reference data
     *
     * @param model
     * @param entity
     */
    protected void addReferenceData(Model model, E entity) {
    }

    /**
     * form reference data
     *
     * @param model
     * @param entity
     */
    protected void formReferenceData(Model model, E entity) {
    }

    protected void defaults(E entity) {
    }

    protected E createEntity() {
        try {
            return entityClass.newInstance();
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    @RequestMapping(value = "/add", method = RequestMethod.POST)
    public String addsubmit(@ModelAttribute @Valid E entity, BindingResult errors, SessionStatus status, Model model, RedirectAttributes redirectAttributes) {
        validate(entity, errors);
        validateAdd(entity, errors);
        if (errors.hasErrors()) {
            touchEntity(entity);
            formReferenceData(model, entity);
            addReferenceData(model, entity);
            return addFormView();
        }
        status.setComplete();
        addEntity(entity);

        return addSuccessView(entity, model, redirectAttributes);
    }

    protected void addEntity(E entity) {
        service.add(entity);
    }

    protected String addSuccessView(E entity, Model model, RedirectAttributes redirectAttributes) {
        model.addAttribute("msg", ADD_MSG);
        return prefix() + (this.reloadWhenClose ? CLOSE_AND_RELOAD_VIEW : CLOSE_AND_REFRESH_VIEW);
    }

    protected String addFormView() {
        return prefix() + moduleName() + "/" + moduleName() + "add";
    }

    protected void validate(E entity, BindingResult errors) {
    }

    protected void validateAdd(E entity, BindingResult errors) {

    }

    /*******************************************************/
    /*                      EDIT                           */

    /*******************************************************/

    @RequestMapping(value = "/{id}/edit")
    public String editform(@PathVariable P id, Model model) {
        E entity = retrieveEntity(id);
        model.addAttribute(modelName(), entity);
        touchEntity(entity);
        formReferenceData(model, entity);
        editReferenceData(model, entity);
        return editFormView();
    }

    protected E retrieveEntity(P id) {
        return service.find(id);
    }

    /**
     * edit form reference data
     *
     * @param model
     * @param entity
     */
    protected void editReferenceData(Model model, E entity) {}

    @RequestMapping(value = "/{id}/edit", method = RequestMethod.POST)
    public String editsubmit(@PathVariable P id, @ModelAttribute @Valid E entity, BindingResult errors, SessionStatus status, Model model, RedirectAttributes ra) {
        validate(entity, errors);
        validateEdit(entity, errors);
        if (errors.hasErrors()) {
            touchEntity(entity);
            formReferenceData(model, entity);
            editReferenceData(model, entity);
            return editFormView();
        }

        status.setComplete();
        editEntity(entity);

        return editSuccessView(entity, model, ra);
    }

    protected void editEntity(E entity) {
        service.update(entity);
    }

    /**
     * form 출력 전 entity에 대한 touching
     * @param entity
     */
    protected void touchEntity(E entity) {
    }

    protected String editFormView() {
        return prefix() + moduleName() + "/" + moduleName() + "edit";
    }

    protected void validateEdit(E entity, BindingResult errors) {
    }

    protected String editSuccessView(E entity, Model model, RedirectAttributes ra) {
        model.addAttribute("msg", EDIT_MSG);
        return prefix() +(this.reloadWhenClose ? CLOSE_AND_RELOAD_VIEW : CLOSE_AND_REFRESH_VIEW);
    }

    /*******************************************************/
    /*                      DELETE                         */

    /*******************************************************/

    @RequestMapping(value = "/{id}/delete")
    public String delete(@PathVariable P id, Model model) {
        try {
            service.deleteById(id);
        }
        catch(DataIntegrityViolationException ex) {
            return deleteFailView(id, model);
        }
        return deleteSuccessView(id, model);
    }

    protected String deleteFailView(P id, Model model) {
        model.addAttribute("msg", DELETE_FAIL_MSG);
        return prefix() + (this.reloadWhenClose ? CLOSE_AND_RELOAD_VIEW : CLOSE_AND_REFRESH_VIEW);
    }

    protected String deleteSuccessView(P id, Model model) {
        model.addAttribute("msg", DELETE_MSG);
        return prefix() + (this.reloadWhenClose ? CLOSE_AND_RELOAD_VIEW : CLOSE_AND_REFRESH_VIEW);
    }
}
