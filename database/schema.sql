CREATE DATABASE IF NOT EXISTS campus_placement CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE campus_placement;

CREATE TABLE IF NOT EXISTS students (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  roll_no VARCHAR(30) NOT NULL UNIQUE,
  full_name VARCHAR(100) NOT NULL,
  email VARCHAR(120) NOT NULL UNIQUE,
  department VARCHAR(80) NOT NULL,
  graduation_year INT NOT NULL,
  cgpa DECIMAL(4,2) NOT NULL,
  active_backlogs INT NOT NULL DEFAULT 0,
  phone VARCHAR(20),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CHECK (cgpa >= 0 AND cgpa <= 10),
  CHECK (active_backlogs >= 0)
);

CREATE TABLE IF NOT EXISTS companies (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(120) NOT NULL,
  role_title VARCHAR(120) NOT NULL,
  job_type ENUM('PRODUCT','SERVICE','CONSULTING','OTHER') NOT NULL DEFAULT 'PRODUCT',
  ctc_lpa DECIMAL(8,2) NOT NULL,
  minimum_cgpa DECIMAL(4,2) NOT NULL DEFAULT 6.00,
  max_backlogs INT NOT NULL DEFAULT 0,
  drive_date DATE NOT NULL,
  status ENUM('UPCOMING','OPEN','CLOSED') NOT NULL DEFAULT 'UPCOMING',
  description VARCHAR(1000),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CHECK (ctc_lpa >= 0),
  CHECK (minimum_cgpa >= 0 AND minimum_cgpa <= 10),
  CHECK (max_backlogs >= 0)
);

CREATE TABLE IF NOT EXISTS applications (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  student_id BIGINT NOT NULL,
  company_id BIGINT NOT NULL,
  applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  status ENUM('APPLIED','SHORTLISTED','REJECTED','PLACED') NOT NULL DEFAULT 'APPLIED',
  remarks VARCHAR(500),
  CONSTRAINT fk_application_student FOREIGN KEY(student_id) REFERENCES students(id) ON DELETE CASCADE,
  CONSTRAINT fk_application_company FOREIGN KEY(company_id) REFERENCES companies(id) ON DELETE CASCADE,
  CONSTRAINT uq_student_company UNIQUE(student_id, company_id)
);

CREATE INDEX idx_students_department ON students(department);
CREATE INDEX idx_companies_drive_date ON companies(drive_date);
CREATE INDEX idx_applications_status ON applications(status);
