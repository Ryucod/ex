package com.ekayworks.ex.domain;

import com.core.epril.entity.AuditEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.ToString;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.Table;
import javax.persistence.Transient;
import javax.validation.constraints.NotEmpty;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "tbl_user")
@Data
@EqualsAndHashCode(of = {}, callSuper = true)
@ToString(callSuper = true, of = {})
public class User extends AuditEntity {
    //이름
    @Column(length = 20)
    @NotEmpty
    String name;
    //이메일
    @Column(length = 50)
    @NotEmpty
    String email;
    //로그인 아이디
    @Column(length = 20)
    @NotEmpty
    String loginId;
    //비밀번호
    @Column(length = 20)
    @NotEmpty
    String password;
    //주소
    @Column(length = 200)
    String address;
    //전화번호
    @Column(length = 50)
    String phone;
    //비밀번호 확인
    @Transient
    String checkPw;

    //기본생성자
    public User(){}

    //email 비교할때 쓰는 생성자
    public User(String email){
        this.email = email;
    }
    public User(long id){ 
        this.id = id;
    }
    public User(long id, String name){
        this.id = id;
        this.name = name;
    }


}
