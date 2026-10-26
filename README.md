# Campus Placement & Eligibility Portal — Web Application

A web-based MCA minor project using **HTML, CSS, JavaScript, Java Spring Boot, JDBC (JdbcTemplate), and MySQL**. The frontend is a responsive dark dashboard with magenta/purple accents inspired by the provided design.

## Features
- Dashboard metrics: students, company drives, applications and placed students
- Student registration and deletion
- Company-drive management with role, job type, CTC, CGPA threshold, backlog limit, date and status
- Eligibility checker and application submission
- Duplicate-application prevention
- Application status tracking: APPLIED, SHORTLISTED, REJECTED, PLACED
- Placed-student directory
- Responsive HTML/CSS/JS frontend
- REST API backed by Spring Boot and JDBC
- MySQL schema with foreign keys, unique constraints and indexes

## Requirements
- JDK 17+
- Eclipse IDE for Enterprise Java and Web Developers (or any Eclipse with Maven support)
- MySQL Server 8+
- Internet on first Maven build to download dependencies

## Setup
1. Start MySQL Server.
2. Open MySQL Workbench and execute `database/schema.sql`.
3. Copy `src/main/resources/application.properties.example` to `src/main/resources/application.properties`.
4. Set the MySQL username and password in `application.properties`.
5. Import the extracted folder into Eclipse: **File → Import → Maven → Existing Maven Projects**.
6. Select this folder and click Finish. Wait for Maven dependencies.
7. Open `PlacementPortalApplication.java` and select **Run As → Java Application**.
8. Open `http://localhost:8080` in your browser.

## Demo sequence
1. Add a student (e.g. CGPA 8.1, zero backlogs).
2. Add a company drive (e.g. minimum CGPA 6.0, zero max backlogs, status OPEN).
3. Go to Eligibility Checker and select the student and company.
4. Submit the application.
5. Go to Applications and change status to SHORTLISTED, then PLACED.
6. Open Placed Students and confirm the record appears.

## Important
This is a generated starter implementation and has not been run against your local MySQL/Eclipse environment here. Please test before submission. It is an academic demo, not a production university system. This version has no login/role authentication, resume uploads, interview scheduling, email notifications or editing of existing student/company records.

## Company-wise Eligibility & One-click Apply

Open **Eligibility Checker** to automatically evaluate every registered student against every non-closed company drive. The page groups eligible students under each company, displays CGPA/backlogs/department/graduation year, and provides a one-click **Apply Application** action. Students already applied to that company are marked accordingly. A final section lists students who do not qualify for any available drive and shows the reasons.
