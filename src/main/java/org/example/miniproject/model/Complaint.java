package org.example.miniproject.model;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Document(collection = "complaints")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Complaint {

    @Id
    private String id;

    private String title;

    private String description;

    private String status;

    private String category;

    private String userId;

    private LocalDateTime createdAt;
}