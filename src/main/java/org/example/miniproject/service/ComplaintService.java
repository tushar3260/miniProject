package org.example.miniproject.service;

import org.example.miniproject.model.Complaint;
import org.example.miniproject.repository.ComplaintRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class ComplaintService {

    @Autowired
    private ComplaintRepository complaintRepository;

    // ✅ Create Complaint
    public Complaint createComplaint(Complaint complaint) {
        complaint.setStatus("OPEN");
        complaint.setCreatedAt(LocalDateTime.now());
        return complaintRepository.save(complaint);
    }

    // ✅ Get All Complaints
    public List<Complaint> getAllComplaints() {
        return complaintRepository.findAll();
    }

    // ✅ Get Complaints by User
    public List<Complaint> getByUserId(String userId) {
        return complaintRepository.findByUserId(userId);
    }

    // ✅ Get by Status
    public List<Complaint> getByStatus(String status) {
        return complaintRepository.findByStatus(status);
    }

    // ✅ Update Status (ADMIN)
    public Complaint updateStatus(String id, String status) {
        Complaint complaint = complaintRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Complaint not found"));

        complaint.setStatus(status);
        return complaintRepository.save(complaint);
    }
}