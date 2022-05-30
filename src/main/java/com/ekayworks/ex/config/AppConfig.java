package com.ekayworks.ex.config;

import com.core.epril.utils.DateUtils;
import org.modelmapper.AbstractConverter;
import org.modelmapper.ModelMapper;
import org.springframework.context.annotation.Bean;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Component
public class AppConfig {


    @Bean
    public ModelMapper mapper() {
        ModelMapper mm = new ModelMapper();


        return mm;
    }
}
