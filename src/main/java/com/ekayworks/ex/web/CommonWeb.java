package com.ekayworks.ex.web;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
@RequiredArgsConstructor
public class CommonWeb {

    @GetMapping("/main")
    public String main(){
        return "/main";
    }
}
