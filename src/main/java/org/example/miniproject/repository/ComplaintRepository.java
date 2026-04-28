package org.example.miniproject.repository;

import org.example.miniproject.model.Complaint;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface ComplaintRepository extends MongoRepository<Complaint, String> {

    List<Complaint> findByUserId(String userId);

    List<Complaint> findByStatus(String status);

    List<Complaint> findByCategory(String category);
}