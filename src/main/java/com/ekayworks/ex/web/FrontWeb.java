package com.ekayworks.ex.web;

import com.ekayworks.ex.domain.User;
import com.ekayworks.ex.repository.UserRepository;
import com.ekayworks.ex.service.UserService;
import com.ekayworks.ex.web.dto.UserDto;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.util.ObjectUtils;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;

import javax.servlet.http.Cookie;
import javax.servlet.http.HttpServletRequest;
import javax.validation.Valid;

import static com.ekayworks.ex.support.security.SecurityInterceptor.ID_COOKIE_NAME;

@Controller
@RequiredArgsConstructor // 선언한 필드 중 final 이나 @NonNull 이 붙은 필드의 의존성을 찾아서 주입 해줌
@Slf4j
public class FrontWeb {
    private final UserService userService;
    private final UserRepository userRepository;

    //회원가입 페이지 이동
    @GetMapping("/join")
    public String toJoin(){return "join/join";}

    //아이디/비밀번호 찾기 페이지 이동
    @GetMapping("/find")
    public String toFind(Model model){
//        User user = new User();
//        model.addAttribute("user", user);
        model.addAttribute("user", new User());
        return "find/find";
    }
    
    //회원가입
    @PostMapping("/join")
    public String add(User entity){
        userService.add(entity); // userService(genericService) 의 add 메서드 실행 - JPA
        return "redirect:/login";
    }

    //비밀번호 변경
    @PostMapping("/find")
    public String update(@ModelAttribute User user, BindingResult errors, Model model,
                         @RequestParam(name = "email") String inputEmail,//비밀번호 변경시 입력되는 정보를 가져옴(inputEmail)
                         @RequestParam(name = "password") String password,
                         @RequestParam(name = "checkPw") String checkPw){
//        model.addAttribute(userDto);
//        model.addAttribute("userDto", new UserDto());
        String email = userRepository.findAllEmail(inputEmail);//해당 이메일과 같은 정보를 뽑아옴
        if(ObjectUtils.isEmpty(email)) {
            errors.reject("eamil", "일치하는 이메일이 없습니다");
            return "find/find";
        }
        if(!password.equals(checkPw)) { //비밀번호와 비밀번호 확인이 일치하지 않으면 찾기 페이지 리로드
                errors.reject("user", "비밀번호가 일치하지 않습니다");
//                errors.rejectValue("password", , "");
//                errors.reject("password", "비밀번호가 일치하지 않습니다");
            return "find/find";
        }
        User entity = userRepository.findByEmail(inputEmail); // 유효성이 통과되면 해당이메일인 entity 가져와서
//                log.info("entity :: {}", entity);
        entity.setPassword(password);
        userService.update(entity); //service의 update 메서드 실행
        return "redirect:/login"; //실행후 로그인화면 리다이렉트
    }
    //정보수정 페이지 이동
    @GetMapping("/edit")
    public String toEdit(HttpServletRequest request, Model model){
        User getUser = null;
        Long id = null;
        for(Cookie c1 : request.getCookies()){
            if(c1.getName().equals(ID_COOKIE_NAME)){
                 id = Long.valueOf(c1.getValue()); // id :: 1
                 getUser = userService.find(id);
//                log.info("ID_COOKIE_NAME :: {}", ID_COOKIE_NAME);
//                log.info("id :: {}", id);
//                log.info("c1.getName :: {}", c1.getName());
//                log.info("user :: {}", getUser.getLoginId());

                //한꺼번에(view에서 user. 으로 가져오기)
                model.addAttribute("user", getUser); 
//                model.addAttribute("loginId", getUser.getLoginId());
//                model.addAttribute("name", getUser.getName());
//                model.addAttribute("password", getUser.getPassword());
//                model.addAttribute("checkPw", getUser.getCheckPw());
//                model.addAttribute("email", getUser.getEmail());
//                model.addAttribute("address", getUser.getAddress());
//                model.addAttribute("phone", getUser.getPhone());
            }
        }
        return "edit";
    }
    //정보수정
    @PostMapping("/edit")
    public String update(User entity){
        userService.update(entity);
        return "redirect:/main";
    }
}
