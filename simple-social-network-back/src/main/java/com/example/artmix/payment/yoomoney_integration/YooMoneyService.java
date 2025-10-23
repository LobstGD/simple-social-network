package com.example.artmix.payment.yoomoney_integration;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.nio.charset.StandardCharsets;
import java.util.Base64;
import java.util.Map;

@Service
@Slf4j
public class YooMoneyService {

    @Value("${yoomoney.shop-id}")
    private String shopId;

    @Value("${yoomoney.secret-key}")
    private String secretKey;

    @Value("${yoomoney.api-url}")
    private String apiUrl;

    @Value("${yoomoney.return-url}")
    private String returnUrl;

    private final RestTemplate restTemplate = new RestTemplate();

    public String createPayment(
            double amount,
            String description,
            String username
    ) {
        try {
            String credentials = shopId + ":" + secretKey;
            String basicAuth = "Basic " + Base64.getEncoder()
                    .encodeToString(credentials.getBytes(StandardCharsets.UTF_8));

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.set("Authorization", basicAuth);
            headers.set("Idempotence-Key", java.util.UUID.randomUUID().toString());

            String valueStr = String.format(java.util.Locale.US, "%.2f", amount);

            // ⚡ добавляем username в return_url
            String callbackUrl = "http://localhost:8080/payment/success?username=" + username;

            String jsonBody = """
                {
                  "amount": {
                    "value": "%s",
                    "currency": "RUB"
                  },
                  "capture": true,
                  "confirmation": {
                    "type": "redirect",
                    "return_url": "%s"
                  },
                  "description": "%s"
                }
                """.formatted(valueStr, callbackUrl, description);

            HttpEntity<String> entity = new HttpEntity<>(jsonBody, headers);
            ResponseEntity<Map> response = restTemplate.postForEntity(apiUrl, entity, Map.class);

            if (response.getStatusCode() == HttpStatus.OK || response.getStatusCode() == HttpStatus.CREATED) {
                Map confirmation = (Map) response.getBody().get("confirmation");
                return confirmation.get("confirmation_url").toString();
            } else {
                log.error("Ошибка при создании платежа: {}", response);
            }
        } catch (Exception e) {
            log.error("Ошибка при создании платежа", e);
        }
        return null;
    }
}
