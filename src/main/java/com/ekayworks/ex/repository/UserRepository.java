package com.ekayworks.ex.repository;

import com.core.epril.repository.BaseRepository;
import com.ekayworks.ex.domain.User;
import com.sun.org.apache.xpath.internal.objects.XBoolean;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface UserRepository extends BaseRepository<User, Long> {
    @Query("select u from User u where u.loginId = ?1")
    User findByLoginId(String loginId);

    @Query("select u from User u where u.email = ?1")
    User findByEmail(String email);

    @Query("select u.email from User u where u.email = ?1")
    String findAllEmail(String inputEmail);

//    boolean existByEmail(String inputEmail);


}
