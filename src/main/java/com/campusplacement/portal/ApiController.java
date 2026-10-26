package com.campusplacement.portal;

import org.springframework.dao.DuplicateKeyException;
import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.sql.Date;
import java.util.*;

@RestController
@RequestMapping("/api")
@CrossOrigin
public class ApiController {
    private final JdbcTemplate db;
    public ApiController(JdbcTemplate db) { this.db = db; }

    @GetMapping("/dashboard")
    public Map<String,Object> dashboard() {
        Map<String,Object> out = new LinkedHashMap<>();
        out.put("students", db.queryForObject("SELECT COUNT(*) FROM students", Integer.class));
        out.put("companies", db.queryForObject("SELECT COUNT(*) FROM companies", Integer.class));
        out.put("applications", db.queryForObject("SELECT COUNT(*) FROM applications", Integer.class));
        out.put("placed", db.queryForObject("SELECT COUNT(*) FROM applications WHERE status='PLACED'", Integer.class));
        out.put("upcoming", db.queryForList("SELECT id,name,role_title,job_type,ctc_lpa,minimum_cgpa,max_backlogs,drive_date,status,description FROM companies WHERE status <> 'CLOSED' ORDER BY drive_date LIMIT 8"));
        out.put("recentApplications", db.queryForList("SELECT a.id,s.full_name student,c.name company,c.role_title,a.status,a.applied_at FROM applications a JOIN students s ON s.id=a.student_id JOIN companies c ON c.id=a.company_id ORDER BY a.applied_at DESC LIMIT 6"));
        return out;
    }

    @GetMapping("/students")
    public List<Map<String,Object>> students() {
        return db.queryForList("SELECT id,roll_no,full_name,email,department,graduation_year,cgpa,active_backlogs,phone FROM students ORDER BY full_name");
    }

    @PostMapping("/students")
    public Map<String,Object> addStudent(@RequestBody Map<String,Object> x) {
        String roll = required(x,"rollNo"), name=required(x,"fullName"), email=required(x,"email"), dept=required(x,"department");
        int year = integer(x,"graduationYear"), backlogs=integerDefault(x,"activeBacklogs",0);
        BigDecimal cgpa=decimal(x,"cgpa");
        if(cgpa.compareTo(BigDecimal.ZERO)<0 || cgpa.compareTo(BigDecimal.TEN)>0) throw bad("CGPA must be between 0 and 10.");
        if(backlogs<0) throw bad("Backlogs cannot be negative.");
        try {
            db.update("INSERT INTO students(roll_no,full_name,email,department,graduation_year,cgpa,active_backlogs,phone) VALUES(?,?,?,?,?,?,?,?)",
                roll,name,email,dept,year,cgpa,backlogs,optional(x,"phone"));
        } catch(DuplicateKeyException e) { throw conflict("Roll number or email already exists."); }
        return Map.of("message","Student added successfully.");
    }

    @DeleteMapping("/students/{id}")
    public Map<String,Object> deleteStudent(@PathVariable long id) {
        if(db.update("DELETE FROM students WHERE id=?",id)==0) throw new ResponseStatusException(HttpStatus.NOT_FOUND,"Student not found.");
        return Map.of("message","Student deleted.");
    }

    @GetMapping("/companies")
    public List<Map<String,Object>> companies() {
        return db.queryForList("SELECT id,name,role_title,job_type,ctc_lpa,minimum_cgpa,max_backlogs,drive_date,status,description FROM companies ORDER BY drive_date");
    }

    @PostMapping("/companies")
    public Map<String,Object> addCompany(@RequestBody Map<String,Object> x) {
        String name=required(x,"name"), role=required(x,"roleTitle"), type=optional(x,"jobType");
        if(type.isBlank()) type="PRODUCT";
        BigDecimal ctc=decimal(x,"ctcLpa"), min=decimal(x,"minimumCgpa");
        int backlogs=integerDefault(x,"maxBacklogs",0);
        Date date;
        try { date=Date.valueOf(required(x,"driveDate")); } catch(Exception e) { throw bad("Drive date must be YYYY-MM-DD."); }
        String status=optional(x,"status"); if(status.isBlank()) status="UPCOMING";
        if(ctc.compareTo(BigDecimal.ZERO)<0 || min.compareTo(BigDecimal.ZERO)<0 || min.compareTo(BigDecimal.TEN)>0 || backlogs<0) throw bad("Check CTC, minimum CGPA and backlog values.");
        if(!Set.of("PRODUCT","SERVICE","CONSULTING","OTHER").contains(type)) throw bad("Invalid job type.");
        if(!Set.of("UPCOMING","OPEN","CLOSED").contains(status)) throw bad("Invalid drive status.");
        db.update("INSERT INTO companies(name,role_title,job_type,ctc_lpa,minimum_cgpa,max_backlogs,drive_date,status,description) VALUES(?,?,?,?,?,?,?,?,?)",
            name,role,type,ctc,min,backlogs,date,status,optional(x,"description"));
        return Map.of("message","Company drive added successfully.");
    }

    @DeleteMapping("/companies/{id}")
    public Map<String,Object> deleteCompany(@PathVariable long id) {
        if(db.update("DELETE FROM companies WHERE id=?",id)==0) throw new ResponseStatusException(HttpStatus.NOT_FOUND,"Company drive not found.");
        return Map.of("message","Company drive deleted.");
    }

    @GetMapping("/applications")
    public List<Map<String,Object>> applications() {
        return db.queryForList("SELECT a.id,a.student_id,a.company_id,s.roll_no,s.full_name student,c.name company,c.role_title,c.ctc_lpa,a.status,a.applied_at FROM applications a JOIN students s ON s.id=a.student_id JOIN companies c ON c.id=a.company_id ORDER BY a.applied_at DESC");
    }

    @PostMapping("/applications")
    public Map<String,Object> apply(@RequestBody Map<String,Object> x) {
        long studentId=longValue(x,"studentId"), companyId=longValue(x,"companyId");
        Map<String,Object> row;
        try {
            row=db.queryForMap("SELECT s.cgpa,s.active_backlogs,c.minimum_cgpa,c.max_backlogs,c.status drive_status FROM students s CROSS JOIN companies c WHERE s.id=? AND c.id=?",studentId,companyId);
        } catch(Exception e) { throw new ResponseStatusException(HttpStatus.NOT_FOUND,"Select a valid student and company drive."); }
        if("CLOSED".equals(row.get("drive_status"))) throw bad("Applications are closed for this drive.");
        if(((BigDecimal)row.get("cgpa")).compareTo((BigDecimal)row.get("minimum_cgpa"))<0) throw bad("Not eligible: CGPA is below the company's minimum.");
        if(((Number)row.get("active_backlogs")).intValue()>((Number)row.get("max_backlogs")).intValue()) throw bad("Not eligible: active backlogs exceed the company's limit.");
        try { db.update("INSERT INTO applications(student_id,company_id,status) VALUES(?,?,'APPLIED')",studentId,companyId); }
        catch(DuplicateKeyException e) { throw conflict("This student has already applied to this company."); }
        return Map.of("message","Application submitted successfully.");
    }

    @PatchMapping("/applications/{id}")
    public Map<String,Object> updateStatus(@PathVariable long id,@RequestBody Map<String,Object> x) {
        String status=required(x,"status");
        if(!Set.of("APPLIED","SHORTLISTED","REJECTED","PLACED").contains(status)) throw bad("Invalid application status.");
        if(db.update("UPDATE applications SET status=? WHERE id=?",status,id)==0) throw new ResponseStatusException(HttpStatus.NOT_FOUND,"Application not found.");
        return Map.of("message","Application status updated.");
    }

    @GetMapping("/placed")
    public List<Map<String,Object>> placed() {
        return db.queryForList("SELECT s.roll_no,s.full_name student,s.department,c.name company,c.role_title,c.ctc_lpa,a.applied_at FROM applications a JOIN students s ON s.id=a.student_id JOIN companies c ON c.id=a.company_id WHERE a.status='PLACED' ORDER BY s.full_name");
    }

    private static String required(Map<String,Object> x,String key) {
        String v=optional(x,key); if(v.isBlank()) throw bad(key+" is required."); return v;
    }
    private static String optional(Map<String,Object> x,String key) {
        Object v=x.get(key); return v==null?"":String.valueOf(v).trim();
    }
    private static int integer(Map<String,Object> x,String key) {
        try{return Integer.parseInt(required(x,key));}catch(Exception e){throw bad(key+" must be a whole number.");}
    }
    private static int integerDefault(Map<String,Object> x,String key,int fallback) {
        if(optional(x,key).isBlank())return fallback; return integer(x,key);
    }
    private static long longValue(Map<String,Object> x,String key) {
        try{return Long.parseLong(required(x,key));}catch(Exception e){throw bad(key+" must be a valid ID.");}
    }
    private static BigDecimal decimal(Map<String,Object> x,String key) {
        try{return new BigDecimal(required(x,key));}catch(Exception e){throw bad(key+" must be a valid number.");}
    }
    private static ResponseStatusException bad(String msg){return new ResponseStatusException(HttpStatus.BAD_REQUEST,msg);}
    private static ResponseStatusException conflict(String msg){return new ResponseStatusException(HttpStatus.CONFLICT,msg);}
}
