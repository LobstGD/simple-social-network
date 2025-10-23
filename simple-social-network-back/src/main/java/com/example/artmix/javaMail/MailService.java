package com.example.artmix.javaMail;

import com.example.artmix.model.Users;
import freemarker.template.Configuration;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.SneakyThrows;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import java.io.StringWriter;
import java.util.HashMap;
import java.util.Map;
import java.util.Properties;

@Service
@RequiredArgsConstructor
public class MailService {

    private final Configuration configuration;

    private final JavaMailSender mailSender;

    public void sendEmail(Users user, MailType type, Properties params){
        if (type.equals(MailType.REGISTRATION)) {
            sendRegistrationEmail(user, params);
        } else {
            System.out.println("Error");
        }
    }

    @SneakyThrows
    private void sendRegistrationEmail(Users user, Properties params) {
        MimeMessage mimeMessage = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, false, "UTF-8");
        helper.setSubject("Thank you for registration, " + user.getUsername());
        helper.setTo(user.getEmail());

        String emailContent = getRegistrationEmailContent(user, params);
        helper.setText(emailContent, true);
        mailSender.send(mimeMessage);
    }

    @SneakyThrows
    private String getRegistrationEmailContent(Users user, Properties properties) {
        StringWriter writer = new StringWriter();
        Map<String, Object> model = new HashMap<>();
        model.put("email", user.getEmail());

        configuration.getTemplate("register.ftlh").process(model, writer);
        return writer.getBuffer().toString();
    }

}

