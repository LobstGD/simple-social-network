package com.example.artmix.chat.chatMessage;

import jakarta.persistence.Id;
import lombok.*;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class ChatNotifications {
    @Id
    private String id;
    private String senderId;
    private String recipientId;
    private String content;
}