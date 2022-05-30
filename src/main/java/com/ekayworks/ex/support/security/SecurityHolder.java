package com.ekayworks.ex.support.security;

import com.ekayworks.ex.domain.User;
import org.springframework.util.ObjectUtils;

public class SecurityHolder {
	private static final ThreadLocal<Login> securityInfo = new ThreadLocal<Login>();
	
	public static final Login get() { return securityInfo.get(); }
	public static final void set(Login info) { securityInfo.set(info); }
	public static final void remove() { securityInfo.remove(); }
	public static final User getLoginUser() {
		User user = null;
		if(!ObjectUtils.isEmpty(securityInfo.get())) user = securityInfo.get().getFakeUser();
		return user;
	}
}
