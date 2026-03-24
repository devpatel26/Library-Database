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
  'scrypt:8f4d7d75d9e4d0792f5eecc0bbd7ce63:d1cad374adddc3b48ced548749a91504e1989b7e4fd9e91ab77e5fb3c0bf8e3f92523ee0743beb12ac31aafd88c0e686e0d96c8f8f341f47b3d8a395ac2cc71d',
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
(1,'John','Smith','1995-05-12','john@example.com','scrypt:8f4d7d75d9e4d0792f5eecc0bbd7ce63:d1cad374adddc3b48ced548749a91504e1989b7e4fd9e91ab77e5fb3c0bf8e3f92523ee0743beb12ac31aafd88c0e686e0d96c8f8f341f47b3d8a395ac2cc71d',1),
(1,'Emma','Johnson','1998-03-21','emma@example.com','scrypt:8f4d7d75d9e4d0792f5eecc0bbd7ce63:d1cad374adddc3b48ced548749a91504e1989b7e4fd9e91ab77e5fb3c0bf8e3f92523ee0743beb12ac31aafd88c0e686e0d96c8f8f341f47b3d8a395ac2cc71d',1),
(1,'Michael','Brown','1992-09-15','michael@example.com','scrypt:8f4d7d75d9e4d0792f5eecc0bbd7ce63:d1cad374adddc3b48ced548749a91504e1989b7e4fd9e91ab77e5fb3c0bf8e3f92523ee0743beb12ac31aafd88c0e686e0d96c8f8f341f47b3d8a395ac2cc71d',1),
(1,'Sophia','Davis','2000-11-02','sophia@example.com','scrypt:8f4d7d75d9e4d0792f5eecc0bbd7ce63:d1cad374adddc3b48ced548749a91504e1989b7e4fd9e91ab77e5fb3c0bf8e3f92523ee0743beb12ac31aafd88c0e686e0d96c8f8f341f47b3d8a395ac2cc71d',1);

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



-- More extensive seed data for testing and demonstration purposes
INSERT INTO items (available,on_hold,unavailable) VALUES
(5,0,0),(4,0,0),(3,0,0),(2,0,1),(6,0,0),(3,0,0),(4,0,0),(5,0,0),(2,0,0),(3,0,0),
(5,0,0),(4,0,0),(3,0,0),(2,0,1),(6,0,0),(3,0,0),(4,0,0),(5,0,0),(2,0,0),(3,0,0),
(5,0,0),(4,0,0),(3,0,0),(2,0,1),(6,0,0),(3,0,0),(4,0,0),(5,0,0),(2,0,0),(3,0,0),
(5,0,0),(4,0,0),(3,0,0),(2,0,1),(6,0,0),(3,0,0),(4,0,0),(5,0,0),(2,0,0),(3,0,0),
(5,0,0),(4,0,0),(3,0,0),(2,0,1),(6,0,0),(3,0,0),(4,0,0);

INSERT INTO books
(item_id,book_type_code,language_code,genre_code,summary,publisher,shelf_number,publication_date,title) VALUES
(8,1,1,1,'Epic magical adventure','Bloomsbury',21,'2000-01-01','Dragon Realm'),
(9,2,1,2,'Space future story','Orbit',22,'2011-06-06','Galactic Wars'),
(10,1,1,3,'Locked room mystery','Penguin',23,'2014-04-04','Closed Door'),
(11,2,1,4,'Life struggles drama','RandomHouse',24,'2006-06-06','Life Lines'),
(12,1,1,5,'Education theory and practice','Pearson',25,'2015-09-09','Learning Theory'),
(13,2,1,6,'Biography of Nikola Tesla','Penguin',26,'2014-10-10','Tesla: A Life'),
(14,1,1,1,'Wizard school story','Bloomsbury',27,'2002-02-02','Magic Academy'),
(15,2,1,2,'Alien invasion sci-fi','Orbit',28,'2012-12-12','Alien Storm'),
(16,1,1,3,'Cold case mystery','Penguin',29,'2011-11-11','Cold Files'),
(17,2,1,4,'Family relationships drama','RandomHouse',30,'2010-04-04','Family Bonds'),
(18,1,1,5,'Teaching techniques','Pearson',31,'2015-05-05','Teaching Methods'),
(19,2,1,6,'Artist biography','Oxford',32,'2007-07-07','Life of Picasso'),
(20,1,1,1,'Magic prophecy story','Bloomsbury',33,'2005-05-05','Prophecy Stone'),
(21,2,1,2,'Mars colonization sci-fi','Orbit',34,'2014-04-14','Red Planet'),
(22,1,1,3,'Murder investigation','Penguin',35,'2016-12-12','Final Clue'),
(23,2,1,4,'Human conflict drama','RandomHouse',36,'2008-08-08','Broken World'),
(24,1,1,5,'Learning psychology','Pearson',37,'2017-07-07','Learning Minds'),
(25,2,1,6,'Life of a statesman','Oxford',38,'2013-03-13','A Public Life'),
(26,1,1,1,'Sorcery and kingdoms','Bloomsbury',39,'2003-03-03','Crown of Fire'),
(27,2,1,2,'Robots and rebellion','Orbit',40,'2010-10-10','Metal Rebellion'),
(28,1,1,3,'Detective noir mystery','Penguin',41,'2017-02-02','Dark Streets'),
(29,2,1,4,'Coming of age drama','RandomHouse',42,'2011-01-01','Growing Seasons'),
(30,1,1,5,'Modern classroom design','Pearson',43,'2019-09-19','The Modern Classroom'),
(31,2,1,6,'Inventor biography','Oxford',44,'2012-02-12','The Inventor'),
(32,1,1,1,'Forest magic tale','Bloomsbury',45,'2004-04-24','Whispering Woods'),
(33,2,1,2,'Interstellar journey','Orbit',46,'2016-06-16','Starbound'),
(34,1,1,3,'Forensic investigation','Penguin',47,'2018-08-18','Trace Evidence'),
(35,2,1,4,'Small town drama','RandomHouse',48,'2009-09-09','Quiet Roads'),
(36,1,1,5,'Study skills handbook','Pearson',49,'2020-01-20','Study Smarter'),
(37,2,1,6,'Scientist memoir','Oxford',50,'2015-05-15','Lab Notes'),
(38,1,1,1,'Ancient spellbook quest','Bloomsbury',51,'2006-06-26','Runes of Power'),
(39,2,1,2,'AI future conflict','Orbit',52,'2021-01-01','Machine Dawn'),
(40,1,1,3,'Stolen painting mystery','Penguin',53,'2013-03-23','The Missing Portrait'),
(41,2,1,4,'War and family drama','RandomHouse',54,'2007-07-17','Ashes of Summer'),
(42,1,1,5,'Database design concepts','Pearson',55,'2021-08-08','Practical Databases'),
(43,2,1,6,'Explorer biography','Oxford',56,'2011-11-21','Into the Wild North'),
(44,1,1,1,'Battle of the mages','Bloomsbury',57,'2008-08-28','Arcane War'),
(45,2,1,2,'Lunar colony survival','Orbit',58,'2019-09-29','Moonbase'),
(46,1,1,3,'Detective under pressure','Penguin',59,'2014-04-14','Last Witness'),
(47,2,1,4,'Courtroom drama','RandomHouse',60,'2016-06-26','The Verdict'),
(48,1,1,5,'Programming for beginners','Pearson',61,'2022-02-02','Coding Basics'),
(49,2,1,6,'Musician biography','Oxford',62,'2010-10-20','Sound of a Life'),
(50,1,1,1,'Crystal kingdom fantasy','Bloomsbury',63,'2009-09-19','Crystal Crown'),
(51,2,1,2,'Future Earth collapse','Orbit',64,'2018-08-08','After Tomorrow'),
(52,1,1,3,'Heist mystery thriller','Penguin',65,'2017-07-27','The Vault'),
(53,2,1,4,'Interwoven family story','RandomHouse',66,'2013-03-03','Threads of Home'),
(54,1,1,5,'Statistics for students','Pearson',67,'2020-10-10','Statistics Made Simple');

INSERT INTO authors (item_id,first_name,last_name) VALUES
(8,'Chris','Morgan'),
(9,'John','Walker'),
(10,'Eric','Adams'),
(11,'Paul','Scott'),
(12,'Henry','Lee'),
(13,'Julia','Hall'),
(14,'Oliver','Cook'),
(15,'Liam','Rogers'),
(16,'Aaron','Kelly'),
(17,'Kyle','Powell'),
(18,'Ethan','Long'),
(19,'Adam','Perry'),
(20,'Luke','Torres'),
(21,'Isaac','Peterson'),
(22,'Aiden','Gray'),
(23,'Levi','Ramirez'),
(24,'Jack','James'),
(25,'Sophie','Bennett'),
(26,'Nathan','Price'),
(27,'Jason','Bell'),
(28,'Noah','Cooper'),
(29,'Mason','Richardson'),
(30,'Logan','Cox'),
(31,'Lucas','Howard'),
(32,'Ella','Foster'),
(33,'Grace','Murphy'),
(34,'Chloe','Peterson'),
(35,'Zoe','Sanders'),
(36,'Lily','Ross'),
(37,'Hannah','Coleman'),
(38,'Victoria','Reed'),
(39,'Sebastian','Ward'),
(40,'Caleb','Bailey'),
(41,'Hunter','Rivera'),
(42,'Connor','Powell'),
(43,'Brooklyn','Gray'),
(44,'Penelope','Ward'),
(45,'Nora','James'),
(46,'Scarlett','Brooks'),
(47,'Aria','Watson'),
(48,'Madison','Bryant'),
(49,'Camila','Kelly'),
(50,'Stella','Flores'),
(51,'Paisley','Hayes'),
(52,'Audrey','Price'),
(53,'Bella','Bennett'),
(54,'Skylar','Wood');

INSERT INTO patrons
(patron_role_code,first_name,last_name,date_of_birth,email,password_hash,is_active) VALUES
(1,'Daniel','Wilson','1996-07-08','daniel@example.com','scrypt:8f4d7d75d9e4d0792f5eecc0bbd7ce63:d1cad374adddc3b48ced548749a91504e1989b7e4fd9e91ab77e5fb3c0bf8e3f92523ee0743beb12ac31aafd88c0e686e0d96c8f8f341f47b3d8a395ac2cc71d',1),
(1,'Olivia','Taylor','1999-12-01','olivia@example.com','scrypt:8f4d7d75d9e4d0792f5eecc0bbd7ce63:d1cad374adddc3b48ced548749a91504e1989b7e4fd9e91ab77e5fb3c0bf8e3f92523ee0743beb12ac31aafd88c0e686e0d96c8f8f341f47b3d8a395ac2cc71d',1),
(1,'James','Anderson','1991-04-18','james@example.com','scrypt:8f4d7d75d9e4d0792f5eecc0bbd7ce63:d1cad374adddc3b48ced548749a91504e1989b7e4fd9e91ab77e5fb3c0bf8e3f92523ee0743beb12ac31aafd88c0e686e0d96c8f8f341f47b3d8a395ac2cc71d',1),
(1,'Isabella','Thomas','1994-02-10','isabella@example.com','scrypt:8f4d7d75d9e4d0792f5eecc0bbd7ce63:d1cad374adddc3b48ced548749a91504e1989b7e4fd9e91ab77e5fb3c0bf8e3f92523ee0743beb12ac31aafd88c0e686e0d96c8f8f341f47b3d8a395ac2cc71d',1),
(1,'William','Moore','1997-08-22','william@example.com','scrypt:8f4d7d75d9e4d0792f5eecc0bbd7ce63:d1cad374adddc3b48ced548749a91504e1989b7e4fd9e91ab77e5fb3c0bf8e3f92523ee0743beb12ac31aafd88c0e686e0d96c8f8f341f47b3d8a395ac2cc71d',1),
(1,'Mia','Martin','2001-06-30','mia@example.com','scrypt:8f4d7d75d9e4d0792f5eecc0bbd7ce63:d1cad374adddc3b48ced548749a91504e1989b7e4fd9e91ab77e5fb3c0bf8e3f92523ee0743beb12ac31aafd88c0e686e0d96c8f8f341f47b3d8a395ac2cc71d',1);

INSERT INTO loans
(item_id,patron_id,loan_origin_date,loan_due_date,patron_role_code,loan_status_code) VALUES
(8,5,'2026-03-01','2026-03-15',1,1),
(9,6,'2026-03-02','2026-03-16',1,1),
(10,7,'2026-02-10','2026-02-24',1,3),
(11,8,'2026-03-05','2026-03-19',1,1),
(12,9,'2026-03-06','2026-03-20',1,1),
(13,10,'2026-02-12','2026-02-26',1,3),
(14,1,'2026-03-15','2026-03-29',1,1),
(15,2,'2026-03-16','2026-03-30',1,1),
(16,3,'2026-03-17','2026-03-31',1,1),
(17,4,'2026-03-18','2026-04-01',1,1),
(18,5,'2026-03-19','2026-04-02',1,1),
(19,6,'2026-03-20','2026-04-03',1,1),
(20,7,'2026-03-21','2026-04-04',1,1),
(21,8,'2026-03-22','2026-04-05',1,1),
(22,9,'2026-03-23','2026-04-06',1,1),
(23,10,'2026-03-24','2026-04-07',1,1),
(24,1,'2026-02-14','2026-02-28',1,3);

INSERT INTO holds
(item_id,patron_id,hold_origin_date,hold_expiration_date,hold_status_code) VALUES
(8,3,'2026-03-20','2026-03-30',1),
(9,4,'2026-03-21','2026-03-31',1),
(10,5,'2026-03-21','2026-03-31',1),
(11,6,'2026-03-22','2026-04-01',1);

INSERT INTO fines
(patron_id,fine_amount,fine_date) VALUES
(5,4.50,'2026-03-15'),
(7,2.75,'2026-03-16'),
(10,6.25,'2026-03-17'),
(2,1.50,'2026-03-18');
