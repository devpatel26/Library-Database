USE library_database;

-- -----------------------------------------------------
-- Seed Data: Patron Roles
-- -----------------------------------------------------
INSERT INTO patron_roles (patron_role_code, patron_role, loan_period, fine)
VALUES
(1, 'patron', 14, 0.25),
(2, 'staff', 30, 0.10),
(3, 'admin', 60, 0.00)
ON DUPLICATE KEY UPDATE
patron_role = VALUES(patron_role);

-- -----------------------------------------------------
-- Seed Data: Staff Roles
-- -----------------------------------------------------
INSERT INTO staff_roles (staff_role_code, staff_role)
VALUES
(1, 'staff'),
(2, 'admin')
ON DUPLICATE KEY UPDATE
staff_role = VALUES(staff_role);

-- -----------------------------------------------------
-- Seed Data: Default Admin Account
-- Email: admin@library.com
-- Password: password
-- -----------------------------------------------------
INSERT INTO staff
(staff_role_code, first_name, last_name, date_of_birth, email, phone_number, address, password_hash, is_active)
VALUES
(
  2,
  'Admin',
  'User',
  '1990-01-01',
  'admin@library.com',
  '1234567890',
  '123 Admin Street',
  'password',
  1
)
ON DUPLICATE KEY UPDATE
email = VALUES(email);

-- -----------------------------------------------------
-- Seed Data: Demo Staff Signup Codes
-- -----------------------------------------------------
INSERT INTO staff_signup_codes
(signup_code, staff_role_code, created_by_admin_id, is_used)
VALUES
('STAFF2026', 1, 1, 0),
('ADMIN2026', 2, 1, 0);

-- -----------------------------------------------------
-- Languages
-- -----------------------------------------------------
INSERT INTO languages (language)
VALUES
('English'),
('Spanish'),
('French'),
('Chinese');

-- -----------------------------------------------------
-- Genres
-- -----------------------------------------------------
INSERT INTO genres (genre)
VALUES
('Fantasy'),
('Science Fiction'),
('Mystery'),
('Drama'),
('Education'),
('Biography');

-- -----------------------------------------------------
-- Book Types
-- -----------------------------------------------------
INSERT INTO book_types (book_type)
VALUES
('Hardcover'),
('Paperback'),
('Ebook');

-- -----------------------------------------------------
-- Periodical Types
-- -----------------------------------------------------
INSERT INTO periodical_types (periodical_type)
VALUES
('Magazine'),
('Journal'),
('Newspaper');

-- -----------------------------------------------------
-- Audiovisual Media Types
-- -----------------------------------------------------
INSERT INTO audiovisual_media_types (audiovisual_media_type)
VALUES
('DVD'),
('Blu-ray'),
('CD');

-- -----------------------------------------------------
-- Loan Statuses
-- -----------------------------------------------------
INSERT INTO loan_statuses (loan_status_name)
VALUES
('active'),
('returned'),
('overdue');

-- -----------------------------------------------------
-- Hold Statuses
-- -----------------------------------------------------
INSERT INTO hold_statuses (hold_status_code, hold_status_name)
VALUES
(1,'active'),
(2,'fulfilled'),
(3,'expired');

-- -----------------------------------------------------
-- Patrons
-- -----------------------------------------------------
INSERT INTO patrons
(patron_role_code, first_name, last_name, date_of_birth, email, password_hash, is_active)
VALUES
(1,'John','Smith','1995-05-12','john@example.com','password',1),
(1,'Emma','Johnson','1998-03-21','emma@example.com','password',1),
(1,'Michael','Brown','1992-09-15','michael@example.com','password',1),
(1,'Sophia','Davis','2000-11-02','sophia@example.com','password',1);

-- -----------------------------------------------------
-- Items Inventory
-- -----------------------------------------------------
INSERT INTO items (available, on_hold, unavailable)
VALUES
(3,0,0),
(2,1,0),
(1,0,1),
(4,0,0),
(2,0,0),
(1,1,0),
(5,0,0);

-- -----------------------------------------------------
-- Books
-- -----------------------------------------------------
INSERT INTO books
(item_id, book_type_code, language_code, genre_code, summary, publisher, shelf_number, publication_date, title)
VALUES
(1,1,1,1,'Wizard boy discovers magic','Bloomsbury',12,'1997-06-26','Harry Potter and the Sorcerer''s Stone'),
(2,2,1,2,'Dystopian society under surveillance','Secker & Warburg',20,'1949-06-08','1984'),
(3,1,1,3,'Detective solves complex crime','Penguin',30,'2005-03-12','The Silent Case');

-- -----------------------------------------------------
-- Authors
-- -----------------------------------------------------
INSERT INTO authors (item_id, first_name, last_name)
VALUES
(1,'J.K.','Rowling'),
(2,'George','Orwell'),
(3,'Daniel','Cole');

-- -----------------------------------------------------
-- Periodicals
-- -----------------------------------------------------
INSERT INTO periodicals
(item_id, periodical_type_code, language_code, genre_code, publisher, publication_date, shelf_number, title, summary)
VALUES
(4,1,1,5,'Time Inc.','2025-01-01',40,'Time Magazine','Weekly world news coverage');

-- -----------------------------------------------------
-- Audiovisual Media
-- -----------------------------------------------------
INSERT INTO audiovisual_media
(item_id, audiovisual_media_type_code, language_code, genre_code, runtime, publisher, publication_date, shelf_number, title, summary)
VALUES
(5,1,1,4,120,'Warner Bros','2018-04-20',50,'Inception','Dream within dream thriller');

-- -----------------------------------------------------
-- Contributors
-- -----------------------------------------------------
INSERT INTO contributors
(item_id, first_name, last_name, role)
VALUES
(5,'Christopher','Nolan','Director');

-- -----------------------------------------------------
-- Equipment
-- -----------------------------------------------------
INSERT INTO equipment
(item_id, equipment_name)
VALUES
(6,'Laptop'),
(7,'Projector');

-- -----------------------------------------------------
-- Loans
-- -----------------------------------------------------
INSERT INTO loans
(item_id, patron_id, loan_origin_date, loan_due_date, patron_role_code, loan_status_code)
VALUES
(1,1,'2026-03-01','2026-03-15',1,1),
(2,2,'2026-03-05','2026-03-19',1,1),
(3,3,'2026-02-20','2026-03-01',1,3);

-- -----------------------------------------------------
-- Holds
-- -----------------------------------------------------
INSERT INTO holds
(item_id, patron_id, hold_origin_date, hold_expiration_date, hold_status_code)
VALUES
(1,4,'2026-03-20','2026-03-30',1);

-- -----------------------------------------------------
-- Fines
-- -----------------------------------------------------
INSERT INTO fines
(patron_id, fine_amount, fine_date)
VALUES
(3,5.00,'2026-03-10');