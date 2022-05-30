package com.ekayworks.ex.config;

import com.ekayworks.ex.repository.UserRepository;
import com.ekayworks.ex.support.security.SecurityInterceptor;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
@RequiredArgsConstructor
public class WebConfig implements WebMvcConfigurer {
	private final UserRepository userRepository;

//	@Value("${ex.upload.path}")
//	private String rootPath;

	@Override
	public void addInterceptors(InterceptorRegistry registry) {
		registry.addInterceptor(securityInterceptor())
				.excludePathPatterns(
				"/", "/en", "/about-us", "/privacy-policy", "/front/notice/**", "/front/recruit/**", "/royalslider/**",
				"/login/**","/js/**","/css/**","/img/**","/font-awesome/**", /*rootPath + "/**",*/ "/download/**")
//				.addPathPatterns("/**")
				.addPathPatterns("/admin/**", "/mainsection/**", "/mainsection/**", "/fundingsection/**", "/bottomsection/**", "/notice/**", "/recruit/**")
		;
	}

	@Bean
    public SecurityInterceptor securityInterceptor() {
	    return new SecurityInterceptor(userRepository);
    }

}
