package com.ekayworks.ex.support.security;

import com.ekayworks.ex.domain.User;
import lombok.Data;

@Data
public class Login {
	long id;
	String name;
	String email;
	String ipAddr;

	public User getFakeUser() {
//		User user = new User(id, name);
		return null;
	}

}
