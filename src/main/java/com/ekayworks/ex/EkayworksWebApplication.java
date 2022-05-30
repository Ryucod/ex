package com.ekayworks.ex;

import com.core.epril.repository.BaseRepositoryImpl;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

@SpringBootApplication
@EnableJpaRepositories(repositoryBaseClass = BaseRepositoryImpl.class)
public class EkayworksWebApplication {

    public static void main(String[] args) {
        SpringApplication.run(EkayworksWebApplication.class, args);
    }

}
