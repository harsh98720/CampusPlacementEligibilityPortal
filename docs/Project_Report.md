# Campus Placement & Eligibility Portal — Project Report

**Student:** ____________________  
**Roll Number:** ____________________  
**Programme:** MCA  
**Guide:** ____________________  
**Academic Session:** ____________________

## Abstract
The Campus Placement & Eligibility Portal is a web application for managing campus recruitment. It centralizes student academic profiles, company drives, eligibility rules, applications and placement outcomes. The user interface is implemented with HTML, CSS and JavaScript; the backend uses Java Spring Boot and JDBC; MySQL stores persistent records.

## Problem Statement
Campus hiring details are often shared through notices and spreadsheets. Manually checking student CGPA and backlogs against company criteria can be repetitive and error-prone. The portal provides a centralized workflow for recording recruitment data and applying consistent eligibility rules.

## Objectives
- Store student roll number, contact details and academic data.
- Manage company roles, CTC, hiring dates and eligibility criteria.
- Check student eligibility using CGPA, active backlogs and drive status.
- Submit eligible applications and prevent duplicate applications.
- Track application statuses and list placed students.
- Demonstrate frontend development, REST APIs, JDBC and relational database design.

## Technology Stack
HTML5, CSS3, JavaScript, Java 17, Spring Boot, Spring JDBC (JdbcTemplate), MySQL, Maven and Eclipse.

## Architecture
The browser loads static files from Spring Boot's `static` folder. JavaScript sends HTTP requests to REST endpoints under `/api`. The REST controller validates requests and uses `JdbcTemplate` to execute parameterized SQL against MySQL. MySQL stores students, companies and applications.

## Database Design
- **students:** unique roll number and email, department, graduation year, CGPA and backlog count.
- **companies:** company, role, job type, CTC, minimum CGPA, backlog limit, drive date and status.
- **applications:** foreign keys to students and companies plus application status.
A unique constraint on student/company prevents duplicate applications.

## Eligibility Rule
A student qualifies when the company drive is not closed, student CGPA is at least the minimum CGPA, and active backlogs do not exceed the maximum permitted backlogs.

## Main Modules
1. Dashboard
2. Student Directory
3. Company Drives
4. Eligibility Checker
5. Application Management
6. Placed Students

## Testing Plan
Test student registration, duplicate roll/email, company-drive creation, below-threshold CGPA, excess backlogs, closed drives, valid application submission, duplicate application prevention, status update to PLACED, and placed-student display. Record only results actually observed during testing.

## Limitations
This academic version does not include authentication, user roles, resume uploads, email alerts, interview scheduling or editing existing student/company records.

## Future Scope
Add secure admin/student login, role-based access, resume uploads, interview schedules, notifications, CSV/PDF reports and placement analytics.

## Conclusion
The project demonstrates a complete basic web workflow for campus placement management using frontend web technologies, Spring Boot REST endpoints, JDBC and MySQL.

## References
- Spring Boot: https://docs.spring.io/spring-boot/
- JDBC: https://docs.oracle.com/javase/tutorial/jdbc/
- MySQL: https://dev.mysql.com/doc/
