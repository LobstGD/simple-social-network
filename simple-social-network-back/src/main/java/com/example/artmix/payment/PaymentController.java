package com.example.artmix.payment;

import com.example.artmix.payment.paypal_integration.PaypalService;
import com.example.artmix.payment.yoomoney_integration.YooMoneyService;
import com.paypal.api.payments.Links;
import com.paypal.api.payments.Payment;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.view.RedirectView;

import java.util.Map;

@RestController
@RequiredArgsConstructor
@Slf4j
@RequestMapping("/payment")
public class PaymentController {

    private final PaypalService paypalService;
    private final YooMoneyService yooMoneyService;

    @PostMapping("/create")
    public ResponseEntity<Map<String, String>> createPayment(
            @RequestParam String method,
            @RequestParam double amount,
            @RequestParam String currency,
            @RequestParam(required = false) String description,
            @RequestParam(required = false) String username //добавляю для возврата на конкретного юзера
    ) {
        try {
            String redirectUrl = null;

            if (method.equalsIgnoreCase("Paypal")) {
                String cancelUrl = "http://localhost:8080/payment/cancel?username=" + username;
                String successUrl = "http://localhost:8080/payment/success?username=" + username;
                Payment payment = paypalService.createPayment(
                        amount,
                        currency,
                        "paypal",
                        "sale",
                        description,
                        cancelUrl,
                        successUrl
                );
                for (Links link : payment.getLinks()) {
                    if (link.getRel().equals("approval_url")) {
                        redirectUrl = link.getHref();
                        break;
                    }
                }
            } else if (method.equalsIgnoreCase("YooMoney")) {
                redirectUrl = yooMoneyService.createPayment(amount, description, username);
            }

            if (redirectUrl != null) {
                return ResponseEntity.ok(Map.of("redirectUrl", redirectUrl));
            } else {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(Map.of("error", "Failed to create payment"));
            }

        } catch (Exception e) {
            log.error("Payment creation error", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Server error during payment creation"));
        }
    }

    @GetMapping("/success")
    public RedirectView paymentSuccess(@RequestParam(required = false) String username) {
        return new RedirectView("http://localhost:5173/" + username + "?payment=success");
    }

    @GetMapping("/cancel")
    public RedirectView paymentCancel(@RequestParam(required = false) String username) {
        return new RedirectView("http://localhost:5173/" + username + "?payment=cancel");
    }
}
