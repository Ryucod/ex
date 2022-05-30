package com.ekayworks.ex.web;

import com.core.epril.web.GenericWeb;
import com.ekayworks.ex.domain.User;
import com.ekayworks.ex.service.UserService;
import com.ekayworks.ex.support.security.SecurityInterceptor;
import com.ekayworks.ex.web.dto.Login;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.bind.support.SessionStatus;

import javax.servlet.http.Cookie;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.validation.Valid;
import java.io.UnsupportedEncodingException;
import java.net.URLEncoder;

@Controller
@RequestMapping("/login")
@RequiredArgsConstructor // 선언한 필드 중 final 이나 @NonNull 이 붙은 필드의 의존성을 찾아서 주입 해줌
@Slf4j
public class LoginWeb{
    private static final String FORM_VIEW = "login/login"; //리턴 주소 지정
    private final UserService userService;
    Logger logger = LoggerFactory.getLogger(getClass());

    @GetMapping("")
    public String form(@RequestParam(required = false) String notlogin, Model model){
        model.addAttribute("login", new Login());
        if(notlogin != null){
            model.addAttribute("notlogin", true);
        }
        return FORM_VIEW;
    }

    @PostMapping("")//                                        web session
    public String submit(@ModelAttribute @Valid Login login, BindingResult errors, SessionStatus status, HttpServletRequest req, HttpServletResponse res)throws UnsupportedEncodingException{
//        if(errors.hasErrors()) return FORM_VIEW; // 에러가 뜨면 FORM_VIEW 리턴
//        status.setComplete();
        User user = userService.login(login);
        if(user == null){
            errors.reject("login", "입력하신 아이디 또는 패스워드가 정확하지 않습니다");

            return FORM_VIEW; //아이디나 패스워드가 일치하지 않으면 FORM_VIEW 리턴
        }else{
            status.setComplete();
            Cookie c1 = new Cookie(SecurityInterceptor.ID_COOKIE_NAME, "" + user.getId());//아이디 쿠키 저장
            Cookie c2 = new Cookie(SecurityInterceptor.NAME_COOKIE_NAME, URLEncoder.encode(user.getName(), "UTF-8"));// 한글일 경우 인코딩 걸어주기
            Cookie c3 = new Cookie(SecurityInterceptor.IP_COOKIE_NAME, req.getRemoteAddr());//ip 주소 쿠키 저장
            c1.setPath("/");
            c2.setPath("/");
            c3.setPath("/");// 쿠키를 저장할 url 지정("/"는 모든 url에 쿠키 설정)
            res.addCookie(c1);
            res.addCookie(c2);
            res.addCookie(c3);

            log.info("user :: {}", user);
            logger.debug("Logged in : " + user.toString() + " / " + req.getRemoteAddr());
        }
        return "redirect:/main";
    }
}

