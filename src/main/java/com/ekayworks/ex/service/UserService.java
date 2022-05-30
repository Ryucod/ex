package com.ekayworks.ex.service;

import com.core.epril.service.GenericService;
import com.ekayworks.ex.domain.User;
import com.ekayworks.ex.repository.UserRepository;
import com.ekayworks.ex.web.dto.Login;

import javax.servlet.http.HttpServletRequest;
import java.util.List;

public interface UserService extends GenericService<User, Long, UserRepository> {
    /**
     * 로그인
     * @param login
     * @return
     */
    User login(Login login);

    User get(Long id);

    User find(Long id);

    User update(User entity);

//    User add(User entity);

}
