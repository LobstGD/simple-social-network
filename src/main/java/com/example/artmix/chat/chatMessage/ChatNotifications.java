package com.example.artmix.chat.chatMessage;


public record ChatNotifications (
     String id,
     String senderId,
     String recipientId,
     String content
) {
}