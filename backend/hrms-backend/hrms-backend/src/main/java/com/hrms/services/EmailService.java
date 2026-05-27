package com.hrms.services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    // ✅ Existing method (HTML email)
    public void sendEmail(String toEmail, String subject, String body) throws MessagingException {

        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true);

        helper.setTo(toEmail);
        helper.setSubject(subject);
        helper.setText(body, true); // HTML enabled

        mailSender.send(message);
    }

    // ✅ ADD THIS METHOD (Fix your error)
    public void send(String toEmail, String name, String status) {

        String subject = "Leave Request " + status;

        String body = "<h3>Hello " + name + ",</h3>" +
                "<p>Your leave request has been <b>" + status + "</b>.</p>" +
                "<br><p>Regards,<br>HR Team</p>";

        try {
            sendEmail(toEmail, subject, body);
        } catch (MessagingException e) {
            throw new RuntimeException("Email sending failed", e);
        }
    }
}