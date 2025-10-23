package com.example.artmix.javaMail;

import lombok.Data;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;
import org.springframework.stereotype.Component;

import java.util.Properties;

@Data
@Component
@ConfigurationProperties(prefix = "spring.mail")
public class MailProperties {

    private Integer port;
    private String host;
    private String username;
    private String password;
    private Properties properties;

}
