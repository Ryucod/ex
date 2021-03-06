package com.ekayworks.ex.web.dto;

import lombok.extern.slf4j.Slf4j;

import javax.validation.constraints.NotEmpty;

@Slf4j
public class Login {
    //session 관련?
    public static final String LOGIN_SESSION_ID = "__LOGIN_SESSION__";
    Long id;

    @NotEmpty
    String loginId;

    @NotEmpty
    String password;
    String email;
    String name;
    String address;
    String phone;

    public String getLoginId(){
        log.info("loginId :: {}", loginId);
        return loginId;
    }
    public void setLoginId(String loginId){this.loginId = loginId;}

    public String getPassword(){return password;}
    public void setPassword(String password) {
        this.password = password;
    }

    public Long getId() {
        return id;
    }
    public void setId(Long id) {
        this.id = id;
    }

    public String getEmail() {
        return email;
    }
    public void setEmail(String email) {
        this.email = email;
    }

    public String getName() {
        return name;
    }
    public void setName(String name) {
        this.name = name;
    }

    public String getAddress() {
        return address;
    }
    public void setAddress(String address) {
        this.address = address;
    }

    public String getPhone() {
        return phone;
    }
    public void setPhone(String phone) { this.phone = phone; }
}
