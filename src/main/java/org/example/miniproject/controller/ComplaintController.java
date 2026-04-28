package org.example.miniproject.controller;

import org.example.miniproject.model.Complaint;
import org.example.miniproject.service.ComplaintService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/complaints")
public class ComplaintController {

    @Autowired
    private ComplaintService complaintService;

    // ✅ Create Complaint
    @PostMapping
    public Complaint createComplaint(@RequestBody Complaint complaint) {
        return complaintService.createComplaint(complaint);
    }

    // ✅ Get All Complaints
    @GetMapping
    public List<Complaint> getAll() {
        return complaintService.getAllComplaints();
    }

    // ✅ Get User Complaints
    @GetMapping("/user/{userId}")
    public List<Complaint> getByUser(@PathVariable String userId) {
        return complaintService.getByUserId(userId);
    }

    // ✅ Get by Status
    @GetMapping("/status/{status}")
    public List<Complaint> getByStatus(@PathVariable String status) {
        return complaintService.getByStatus(status);
    }

    // ✅ Update Status (Admin)
    @PutMapping("/{id}/status")
    public Complaint updateStatus(@PathVariable String id,
                                  @RequestParam String status) {
        return complaintService.updateStatus(id, status);
    }
}