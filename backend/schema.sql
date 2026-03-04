-- Create database
CREATE DATABASE IF NOT EXISTS visitors_db;
USE visitors_db;

-- ── Hosts table ───────────────────────────────────────
CREATE TABLE IF NOT EXISTS hosts (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  name       VARCHAR(100) NOT NULL,
  department VARCHAR(100) NOT NULL,
  email      VARCHAR(100) NOT NULL UNIQUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ── Users table (visitor accounts) ───────────────────
CREATE TABLE IF NOT EXISTS users (
  id             INT AUTO_INCREMENT PRIMARY KEY,
  email          VARCHAR(100) NOT NULL UNIQUE,
  is_verified    BOOLEAN DEFAULT FALSE,
  otp            VARCHAR(6),
  otp_expires_at DATETIME,
  created_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ── Visitors table (visit requests) ──────────────────
CREATE TABLE IF NOT EXISTS visitors (
  id             INT AUTO_INCREMENT PRIMARY KEY,
  user_id        INT NOT NULL,
  name           VARCHAR(100) NOT NULL,
  phone          VARCHAR(20)  NOT NULL,
  address        TEXT         NOT NULL,
  purpose        TEXT         NOT NULL,
  host_id        INT          NOT NULL,
  preferred_date DATE         NOT NULL,
  preferred_time TIME         NOT NULL,
  photo_url      VARCHAR(255),
  status         ENUM(
                   'pending',
                   'approved',
                   'rejected',
                   'checked-in',
                   'checked-out'
                 ) DEFAULT 'pending',
  check_in_time  DATETIME,
  check_out_time DATETIME,
  created_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (host_id) REFERENCES hosts(id)
);

-- ── Visitor Passes table ──────────────────────────────
CREATE TABLE IF NOT EXISTS visitor_passes (
  id                  INT AUTO_INCREMENT PRIMARY KEY,
  visitor_id          INT          NOT NULL,
  qr_code             TEXT         NOT NULL,
  approved_start_time DATETIME     NOT NULL,
  approved_end_time   DATETIME     NOT NULL,
  created_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (visitor_id) REFERENCES visitors(id)
);

-- ── Sample hosts data ─────────────────────────────────
INSERT INTO hosts (name, department, email) VALUES
  ('Rajesh Kumar',  'Engineering',    'thejasam04@gmail.com'),
  ('Priya Sharma',  'HR',             'thejasam55@gmail.com'),
  ('Amit Patel',    'Finance',        'thejas.am@zodopt.com'),
  ('Sneha Reddy',   'Operations',     'sneha@company.com'),
  ('Vikram Singh',  'Sales',          'vikram@company.com');