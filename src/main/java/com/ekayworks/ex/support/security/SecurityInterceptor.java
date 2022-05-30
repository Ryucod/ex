package com.ekayworks.ex.support.security;

import com.ekayworks.ex.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.web.servlet.HandlerInterceptor;
import org.springframework.web.servlet.ModelAndView;

import javax.servlet.http.Cookie;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.net.URLDecoder;
import java.util.Enumeration;

public class SecurityInterceptor implements HandlerInterceptor {
	public static final String ID_COOKIE_NAME = "id"; //"__id__";
	public static final String NAME_COOKIE_NAME = "name"; //"__name__";
	public static final String IP_COOKIE_NAME = "ip"; //"__ip__";
	
	private final Logger logger = LoggerFactory.getLogger(getClass());
	private final UserRepository userRepository;

	public SecurityInterceptor(UserRepository userRepository) {
		this.userRepository = userRepository;
	}

	@Override
	public void postHandle(HttpServletRequest request, HttpServletResponse response, Object handler, ModelAndView modelAndView) throws Exception {
		HandlerInterceptor.super.postHandle(request, response, handler, modelAndView);
	}

	@Override
	public boolean preHandle(HttpServletRequest request,
			HttpServletResponse response, Object handler) throws Exception {
		Login login = new Login();
		try {
			if (request.getCookies() != null) {
				for(Cookie c : request.getCookies()) {
					if (c.getName().equals(SecurityInterceptor.ID_COOKIE_NAME)) {
						login.setId(Integer.valueOf(c.getValue()));
					}
					else if (c.getName().equals(SecurityInterceptor.NAME_COOKIE_NAME)) {
						login.setName(URLDecoder.decode(c.getValue(), "UTF-8"));
					}
					else if (c.getName().equals(SecurityInterceptor.IP_COOKIE_NAME)) {
						login.setIpAddr(c.getValue());
					}
				}
			}

			if (login.getId() > 0) {	// logged in
				SecurityHolder.set(login);
				request.setAttribute("login", login);

				return true;
			}
			else {
				logger.debug("Not Login : " );
				for(Enumeration<String> it = request.getHeaderNames(); it.hasMoreElements();) {
					String headerName = it.nextElement();
					logger.debug("- Header : " + headerName + " / " + request.getHeader(headerName));
				}
				response.sendRedirect("/login?notlogin=true");
				return false;
			}
		} catch (Exception e) {
			logger.debug("Not Login : " );
			for(Enumeration<String> it = request.getHeaderNames(); it.hasMoreElements();) {
				String headerName = it.nextElement();
				logger.debug("- Header : " + headerName + " / " + request.getHeader(headerName));
			}
			response.sendRedirect("/login?notlogin=true");
			return false;
		}
	}
	@Override
	public void afterCompletion(HttpServletRequest request,
			HttpServletResponse response, Object handler, Exception ex)
			throws Exception {
		SecurityHolder.remove();
	}
}
