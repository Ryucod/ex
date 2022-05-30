package com.ekayworks.ex.web.dto;

import lombok.Data;
import org.springframework.stereotype.Component;

@Data
public class UserDto {

    String password;

    String checkPw;

    String email;

    public String getPassword(){return password;}
    public void setPassword(String password){this.password = password;}

    public String getCheckPw(){return checkPw;}
    public void setCheckPw(String checkPw){this.checkPw = checkPw;}

    public String getEmail(){return email;}
    public void setEmail(String email){this.email = email;}
}
