package com.ekayworks.ex.service.impl;

import com.core.epril.service.GenericServiceImpl;
import com.ekayworks.ex.domain.User;
import com.ekayworks.ex.repository.UserRepository;
import com.ekayworks.ex.service.UserService;
import com.ekayworks.ex.web.dto.Login;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.validation.AbstractBindingResult;
import org.springframework.validation.BindException;

import javax.servlet.http.HttpServletRequest;

@Service
@Slf4j
public class UserServiceImpl extends GenericServiceImpl<User, Long, UserRepository> implements UserService {

    //회원가입
//    @Override
//    public User add(User entity) {
//        return entity;
//    }

    //로그인
    @Override
    public User login(Login login) {
        User user = repository.findByLoginId(login.getLoginId());
        if(user == null) {
            return null;
        }
        if(user.getPassword().equals(login.getPassword())) return user;
        return null;
    }

    //비밀번호 변경
    @Override
    public User update(User entity){
        User user = repository.findByEmail(entity.getEmail());
//        if(user == null)return null;
//        log.info("entity.getEmail :: {}", entity.getEmail());
//        log.info("user :: {}", user.getEmail());
            user.setPassword(entity.getPassword());
            user.setName(entity.getName());
            user.setPassword(entity.getPassword());
            user.setEmail(entity.getEmail());
            user.setAddress(entity.getAddress());
            user.setPhone(entity.getPhone());
            //        log.info("entity.getPass :: {}", entity.getPassword());
            return super.update(user);
    }


}
