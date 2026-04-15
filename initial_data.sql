USE library_database;

-- -----------------------------------------------------
-- Seed Data: Patron Roles
-- -----------------------------------------------------
INSERT INTO patron_roles (patron_role_code, patron_role, loan_period, fine)
VALUES
(1, 'patron', 14, 0.25),
(2, 'staff', 30, 0.10),
(3, 'admin', 60, 0.00),
(4, 'student', 21, 0.20),
(5, 'faculty', 28, 0.10)
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
('Children''s Books'),
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
(1, 'waiting'),
(2, 'ready'),
(3, 'fulfilled'),
(4, 'expired'),
(5, 'cancelled');

-- -----------------------------------------------------
-- Patrons
-- -----------------------------------------------------
INSERT INTO patrons
(patron_role_code, first_name, last_name, date_of_birth, email, password_hash, is_active)
VALUES
(1,'John','Smith','1995-05-12','john@example.com','scrypt:8f4d7d75d9e4d0792f5eecc0bbd7ce63:d1cad374adddc3b48ced548749a91504e1989b7e4fd9e91ab77e5fb3c0bf8e3f92523ee0743beb12ac31aafd88c0e686e0d96c8f8f341f47b3d8a395ac2cc71d',1),
(1,'Emma','Johnson','1998-03-21','emma@example.com','scrypt:8f4d7d75d9e4d0792f5eecc0bbd7ce63:d1cad374adddc3b48ced548749a91504e1989b7e4fd9e91ab77e5fb3c0bf8e3f92523ee0743beb12ac31aafd88c0e686e0d96c8f8f341f47b3d8a395ac2cc71d',1),
(1,'Michael','Brown','1992-09-15','michael@example.com','scrypt:8f4d7d75d9e4d0792f5eecc0bbd7ce63:d1cad374adddc3b48ced548749a91504e1989b7e4fd9e91ab77e5fb3c0bf8e3f92523ee0743beb12ac31aafd88c0e686e0d96c8f8f341f47b3d8a395ac2cc71d',1),
(1,'Sophia','Davis','2000-11-02','sophia@example.com','scrypt:8f4d7d75d9e4d0792f5eecc0bbd7ce63:d1cad374adddc3b48ced548749a91504e1989b7e4fd9e91ab77e5fb3c0bf8e3f92523ee0743beb12ac31aafd88c0e686e0d96c8f8f341f47b3d8a395ac2cc71d',1),
(1,'Daniel','Wilson','1996-07-08','daniel@example.com','scrypt:8f4d7d75d9e4d0792f5eecc0bbd7ce63:d1cad374adddc3b48ced548749a91504e1989b7e4fd9e91ab77e5fb3c0bf8e3f92523ee0743beb12ac31aafd88c0e686e0d96c8f8f341f47b3d8a395ac2cc71d',1),
(1,'Olivia','Taylor','1999-12-01','olivia@example.com','scrypt:8f4d7d75d9e4d0792f5eecc0bbd7ce63:d1cad374adddc3b48ced548749a91504e1989b7e4fd9e91ab77e5fb3c0bf8e3f92523ee0743beb12ac31aafd88c0e686e0d96c8f8f341f47b3d8a395ac2cc71d',1),
(1,'James','Anderson','1991-04-18','james@example.com','scrypt:8f4d7d75d9e4d0792f5eecc0bbd7ce63:d1cad374adddc3b48ced548749a91504e1989b7e4fd9e91ab77e5fb3c0bf8e3f92523ee0743beb12ac31aafd88c0e686e0d96c8f8f341f47b3d8a395ac2cc71d',1),
(1,'Isabella','Thomas','1994-02-10','isabella@example.com','scrypt:8f4d7d75d9e4d0792f5eecc0bbd7ce63:d1cad374adddc3b48ced548749a91504e1989b7e4fd9e91ab77e5fb3c0bf8e3f92523ee0743beb12ac31aafd88c0e686e0d96c8f8f341f47b3d8a395ac2cc71d',1),
(1,'William','Moore','1997-08-22','william@example.com','scrypt:8f4d7d75d9e4d0792f5eecc0bbd7ce63:d1cad374adddc3b48ced548749a91504e1989b7e4fd9e91ab77e5fb3c0bf8e3f92523ee0743beb12ac31aafd88c0e686e0d96c8f8f341f47b3d8a395ac2cc71d',1),
(1,'Mia','Martin','2001-06-30','mia@example.com','scrypt:8f4d7d75d9e4d0792f5eecc0bbd7ce63:d1cad374adddc3b48ced548749a91504e1989b7e4fd9e91ab77e5fb3c0bf8e3f92523ee0743beb12ac31aafd88c0e686e0d96c8f8f341f47b3d8a395ac2cc71d',1),
(1,'Liam','Harris','1993-05-10','liam.harris@example.com','scrypt:8f4d7d75d9e4d0792f5eecc0bbd7ce63:d1cad374adddc3b48ced548749a91504e1989b7e4fd9e91ab77e5fb3c0bf8e3f92523ee0743beb12ac31aafd88c0e686e0d96c8f8f341f47b3d8a395ac2cc71d',1),
(1,'Noah','Clark','1997-11-21','noah.clark@example.com','scrypt:8f4d7d75d9e4d0792f5eecc0bbd7ce63:d1cad374adddc3b48ced548749a91504e1989b7e4fd9e91ab77e5fb3c0bf8e3f92523ee0743beb12ac31aafd88c0e686e0d96c8f8f341f47b3d8a395ac2cc71d',1),
(1,'Ava','Lewis','2000-03-14','ava.lewis@example.com','scrypt:8f4d7d75d9e4d0792f5eecc0bbd7ce63:d1cad374adddc3b48ced548749a91504e1989b7e4fd9e91ab77e5fb3c0bf8e3f92523ee0743beb12ac31aafd88c0e686e0d96c8f8f341f47b3d8a395ac2cc71d',1),
(1,'Ethan','Walker','1992-09-05','ethan.walker@example.com','scrypt:8f4d7d75d9e4d0792f5eecc0bbd7ce63:d1cad374adddc3b48ced548749a91504e1989b7e4fd9e91ab77e5fb3c0bf8e3f92523ee0743beb12ac31aafd88c0e686e0d96c8f8f341f47b3d8a395ac2cc71d',1),
(1,'Mason','Hall','1995-01-18','mason.hall@example.com','scrypt:8f4d7d75d9e4d0792f5eecc0bbd7ce63:d1cad374adddc3b48ced548749a91504e1989b7e4fd9e91ab77e5fb3c0bf8e3f92523ee0743beb12ac31aafd88c0e686e0d96c8f8f341f47b3d8a395ac2cc71d',1),
(1,'Charlotte','Young','1999-07-12','charlotte.young@example.com','scrypt:8f4d7d75d9e4d0792f5eecc0bbd7ce63:d1cad374adddc3b48ced548749a91504e1989b7e4fd9e91ab77e5fb3c0bf8e3f92523ee0743beb12ac31aafd88c0e686e0d96c8f8f341f47b3d8a395ac2cc71d',1),
(1,'Amelia','King','1996-02-03','amelia.king@example.com','scrypt:8f4d7d75d9e4d0792f5eecc0bbd7ce63:d1cad374adddc3b48ced548749a91504e1989b7e4fd9e91ab77e5fb3c0bf8e3f92523ee0743beb12ac31aafd88c0e686e0d96c8f8f341f47b3d8a395ac2cc71d',1),
(1,'Benjamin','Wright','1994-06-30','benjamin.wright@example.com','scrypt:8f4d7d75d9e4d0792f5eecc0bbd7ce63:d1cad374adddc3b48ced548749a91504e1989b7e4fd9e91ab77e5fb3c0bf8e3f92523ee0743beb12ac31aafd88c0e686e0d96c8f8f341f47b3d8a395ac2cc71d',1),
(1,'Lucas','Scott','2001-10-19','lucas.scott@example.com','scrypt:8f4d7d75d9e4d0792f5eecc0bbd7ce63:d1cad374adddc3b48ced548749a91504e1989b7e4fd9e91ab77e5fb3c0bf8e3f92523ee0743beb12ac31aafd88c0e686e0d96c8f8f341f47b3d8a395ac2cc71d',1),
(1,'Harper','Green','1998-12-01','harper.green@example.com','scrypt:8f4d7d75d9e4d0792f5eecc0bbd7ce63:d1cad374adddc3b48ced548749a91504e1989b7e4fd9e91ab77e5fb3c0bf8e3f92523ee0743beb12ac31aafd88c0e686e0d96c8f8f341f47b3d8a395ac2cc71d',1),
(1,'Elijah','Baker','1993-04-14','elijah.baker@example.com','scrypt:8f4d7d75d9e4d0792f5eecc0bbd7ce63:d1cad374adddc3b48ced548749a91504e1989b7e4fd9e91ab77e5fb3c0bf8e3f92523ee0743beb12ac31aafd88c0e686e0d96c8f8f341f47b3d8a395ac2cc71d',1),
(1,'Abigail','Adams','1997-08-25','abigail.adams@example.com','scrypt:8f4d7d75d9e4d0792f5eecc0bbd7ce63:d1cad374adddc3b48ced548749a91504e1989b7e4fd9e91ab77e5fb3c0bf8e3f92523ee0743beb12ac31aafd88c0e686e0d96c8f8f341f47b3d8a395ac2cc71d',1),
(1,'Alexander','Nelson','1992-03-07','alexander.nelson@example.com','scrypt:8f4d7d75d9e4d0792f5eecc0bbd7ce63:d1cad374adddc3b48ced548749a91504e1989b7e4fd9e91ab77e5fb3c0bf8e3f92523ee0743beb12ac31aafd88c0e686e0d96c8f8f341f47b3d8a395ac2cc71d',1),
(1,'Emily','Carter','1995-05-28','emily.carter@example.com','scrypt:8f4d7d75d9e4d0792f5eecc0bbd7ce63:d1cad374adddc3b48ced548749a91504e1989b7e4fd9e91ab77e5fb3c0bf8e3f92523ee0743beb12ac31aafd88c0e686e0d96c8f8f341f47b3d8a395ac2cc71d',1),
(1,'Henry','Mitchell','1991-09-17','henry.mitchell@example.com','scrypt:8f4d7d75d9e4d0792f5eecc0bbd7ce63:d1cad374adddc3b48ced548749a91504e1989b7e4fd9e91ab77e5fb3c0bf8e3f92523ee0743beb12ac31aafd88c0e686e0d96c8f8f341f47b3d8a395ac2cc71d',1),
(1,'Scarlett','Perez','1998-11-09','scarlett.perez@example.com','scrypt:8f4d7d75d9e4d0792f5eecc0bbd7ce63:d1cad374adddc3b48ced548749a91504e1989b7e4fd9e91ab77e5fb3c0bf8e3f92523ee0743beb12ac31aafd88c0e686e0d96c8f8f341f47b3d8a395ac2cc71d',1),
(1,'Daniel','Roberts','1994-06-06','daniel.roberts@example.com','scrypt:8f4d7d75d9e4d0792f5eecc0bbd7ce63:d1cad374adddc3b48ced548749a91504e1989b7e4fd9e91ab77e5fb3c0bf8e3f92523ee0743beb12ac31aafd88c0e686e0d96c8f8f341f47b3d8a395ac2cc71d',1),
(1,'Victoria','Turner','1999-01-13','victoria.turner@example.com','scrypt:8f4d7d75d9e4d0792f5eecc0bbd7ce63:d1cad374adddc3b48ced548749a91504e1989b7e4fd9e91ab77e5fb3c0bf8e3f92523ee0743beb12ac31aafd88c0e686e0d96c8f8f341f47b3d8a395ac2cc71d',1),
(1,'Sebastian','Phillips','1996-10-27','sebastian.phillips@example.com','scrypt:8f4d7d75d9e4d0792f5eecc0bbd7ce63:d1cad374adddc3b48ced548749a91504e1989b7e4fd9e91ab77e5fb3c0bf8e3f92523ee0743beb12ac31aafd88c0e686e0d96c8f8f341f47b3d8a395ac2cc71d',1),
(1,'Grace','Campbell','2000-04-04','grace.campbell@example.com','scrypt:8f4d7d75d9e4d0792f5eecc0bbd7ce63:d1cad374adddc3b48ced548749a91504e1989b7e4fd9e91ab77e5fb3c0bf8e3f92523ee0743beb12ac31aafd88c0e686e0d96c8f8f341f47b3d8a395ac2cc71d',1);
-- -----------------------------------------------------
-- Items Inventory
-- -----------------------------------------------------
INSERT INTO items (available, on_hold, unavailable)
VALUES
(3,0,0),(2,1,0),(1,0,1),(4,0,0),(2,0,0),
(1,1,0),(5,0,0),(5,0,0),(4,0,0),(3,0,0),
(2,0,1),(6,0,0),(3,0,0),(4,0,0),(5,0,0),
(2,0,0),(3,0,0),(5,0,0),(4,0,0),(3,0,0),
(2,0,1),(6,0,0),(3,0,0),(4,0,0),(5,0,0),
(2,0,0),(3,0,0),(5,0,0),(4,0,0),(3,0,0),
(2,0,1),(6,0,0),(3,0,0),(4,0,0),(5,0,0),
(2,0,0),(3,0,0),(5,0,0),(4,0,0),(3,0,0),
(2,0,1),(6,0,0),(3,0,0),(4,0,0),(5,0,0),
(2,0,0),(3,0,0),(5,0,0),(4,0,0),(3,0,0),
(2,0,1),(6,0,0),(3,0,0),(4,0,0),(3,0,0),
(7,0,0),(6,0,0),(3,0,0),(4,0,0),(3,0,0),
(7,0,0),(6,0,0),(3,0,0),(4,0,0),(3,0,0);

-- -----------------------------------------------------
-- Books
-- -----------------------------------------------------
INSERT INTO books
(item_id, book_type_code, language_code, genre_code, summary, publisher, shelf_number, publication_date, title)
VALUES
-- Main books
(1,1,1,1,'In this stunning new edition of Harry Potter and the Sorcerer''s Stone, experience the story as never before.','Scholastic Inc.',12,'2020-10-20','Harry Potter and the Sorcerer''s Stone'),
(2,2,1,2,'In 1984, London is a grim city in the totalitarian state of Oceania where Big Brother is always watching you and the Thought Police can practically read your mind.','Mariner Books Classics',20,'2017-04-04','1984'),
(3,1,1,3,'A brilliant psychological portrait of an individual''s departure from social conventions in the search for spiritual fulfillment, Demian encompasses many of the themes associated with Hermann Hesse, its Noble Prize-winning author, particularly the duality of human nature and the quest for inner peace.','Dover Publications',30,'2000-12-18','Demian'),
(8,1,1,1,'Ryland Grace is the sole survivor on a desperate, last-chance mission--and if he fails, humanity and the earth itself will perish.','Ballantine Books',21,'2022-10-04','Project Hail Mary'),
(9,2,1,2,'The story begins with a traveling salesman, Gregor Samsa, waking to find himself transformed (metamorphosed) into a large, monstrous insect-like creature.','CreateSpace Independent Publishing Platform',22,'2014-11-30','The Metamorphosis'),
(10,1,1,3,'Raskolnikov, a destitute and desperate former student, wanders through the slums of St Petersburg and commits a random murder without remorse or regret.','Penguin Classics',23,'2002-12-31','Crime and Punishment'),
(11,2,1,4,'A gripping, heart-wrenching, and wholly remarkable tale of coming-of-age in a South poisoned by virulent prejudice, it views a world of great beauty and savage inequities through the eyes of a young girl, as her father--a crusading local lawyer--risks everything to defend a black man unjustly accused of a terrible crime.','Harper Perennial',24,'2002-03-05','To Kill a Mockingbird'),
(12,1,1,5,'In the light of the moon a little egg lay on a leaf','Philomel Books',25,'1994-03-23','The Very Hungry Caterpillar'),
(13,2,1,6,'Don Quixote has become so entranced reading tales of chivalry that he decides to turn knight errant himself.','Penguin Classics',26,'2003-02-25','Don Quixote (Penguin Classics)'),
(14,2,1,2,'In a great green room, tucked away in bed, is a little bunny.','HarperCollins',28,'1991-10-20','Goodnight Moon'),
-- Misc books
(15,1,1,1,'Wizard school story','Bloomsbury',27,'2002-02-02','Magic Academy'),
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

-- -----------------------------------------------------
-- Authors
-- -----------------------------------------------------
INSERT INTO authors (item_id, first_name, last_name)
VALUES
-- Main authors
(1,'J.K.','Rowling'),
(2,'George','Orwell'),
(3,'Hermann','Hesse'),
(8,'Andy','Weir'),
(9,'Franz','Kafka'),
(10,'Fyodor','Dostoevsky'),
(11,'Harper','Lee'),
(12,'Eric','Carle'),
(13,'Miguel','Cervantes'),
(14,'Margaret','Brown'),
-- Misc authors
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

-- -----------------------------------------------------
-- Periodicals
-- -----------------------------------------------------
INSERT INTO periodicals
(item_id, periodical_type_code, language_code, genre_code, publisher, publication_date, shelf_number, title, summary)
VALUES
(4,1,1,5,'Time Inc.','2025-01-01',40,'Time Magazine','Weekly world news coverage'),
(56,1,1,5,'Fancy Publications','2015-01-01',40,'Cat Fancy','Cat news coverage'),
(57,1,1,5,'Dow Jones & Co.','2016-04-01',40,'The Wall Street Journal Magazine','Wall Street news coverage'),
(58,1,1,5,'National Geographic Society','1959-12-01',40,'National Geographic','Geographic news coverage');

-- -----------------------------------------------------
-- Audiovisual Media
-- -----------------------------------------------------
INSERT INTO audiovisual_media
(item_id, audiovisual_media_type_code, language_code, genre_code, runtime, publisher, publication_date, shelf_number, title, summary)
VALUES
(5,1,1,4,120,'Warner Bros','2018-04-20',50,'Inception','Dream within dream thriller'),
(55,1,1,4,125,'Universal','2000-07-11',50,'Jaws','A New England police chief, a shark hunter and a scientist have a showdown with a huge white shark.'),
(59,1,1,4,125,'Reprise','1997-01-01',50,'Nimrod','Although punk-pop is Green Day''s forte, they sound the most alive on Nimrod when they are breaking away from their formula, whether it is shuffling, tongue-in-cheek humor, surging surf instrumental, horn-driven saga, or acoustic string-laced ballad.'),
(60,1,1,4,125,'Paramount Home Entertainment','2007-01-01',50,'To Catch a Thief','A woman falls in love with a reformed jewel thief, but suspects he''s active again when a series of jewel heists occur.');

-- -----------------------------------------------------
-- Contributors
-- -----------------------------------------------------
INSERT INTO contributors
(item_id, first_name, last_name, role)
VALUES
(5,'Christopher','Nolan','Director'),
(55,'Steven','Spielberg','Director'),
(59,'Billie','Joe','Vocalist'),
(56,'Alfread','Hitchcock','Vocalist');

-- -----------------------------------------------------
-- Equipment
-- -----------------------------------------------------
INSERT INTO equipment
(item_id, equipment_name)
VALUES
(6,'Laptop'),
(7,'Projector'),
(61,'Sewing Kit'),
(62,'Guitar'),
(63,'Headphones'),
(64,'Sewing Machine'),
(65,'Recorder');

-- -----------------------------------------------------
-- Loans
-- -----------------------------------------------------
INSERT INTO loans
(item_id, patron_id, loan_origin_date, loan_due_date, patron_role_code, loan_status_code)
VALUES
(1,1,'2026-03-01','2026-03-15',1,1),
(2,2,'2026-03-05','2026-03-19',1,1),
(3,3,'2026-02-20','2026-03-01',1,3),
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
(24,1,'2026-02-14','2026-02-28',1,3),

-- active loans (not overdue)
(33,11,'2026-04-01','2026-04-15',1,1),
(34,12,'2026-04-02','2026-04-16',1,1),
(35,13,'2026-04-03','2026-04-17',1,1),
(36,14,'2026-04-04','2026-04-18',1,1),

-- overdue loans
(37,15,'2026-03-01','2026-03-10',1,1),
(38,16,'2026-03-02','2026-03-12',1,1),
(39,17,'2026-02-15','2026-03-01',1,1),

-- returned loans (normal)
(40,18,'2026-02-10','2026-02-24',1,2),
(41,19,'2026-02-15','2026-03-01',1,2),

-- returned overdue loans
(42,20,'2026-02-01','2026-02-14',1,2),
(43,21,'2026-02-05','2026-02-18',1,2),

-- active loans
(44,22,'2026-04-01','2026-04-15',1,1),
(45,23,'2026-04-02','2026-04-16',1,1),
(46,24,'2026-04-03','2026-04-17',1,1),

-- overdue loans
(47,25,'2026-03-10','2026-03-20',1,1),
(48,26,'2026-03-05','2026-03-15',1,1),

-- active
(49,27,'2026-04-01','2026-04-15',1,1),
(50,28,'2026-04-01','2026-04-15',1,1),

-- returned
(51,29,'2026-02-01','2026-02-14',1,2),
(52,30,'2026-02-02','2026-02-15',1,2),
-- test

(33,15,'2026-03-01','2026-03-10',1,1),
(34,16,'2026-03-02','2026-03-12',1,1),
(35,17,'2026-03-03','2026-03-13',1,1),
(36,18,'2026-03-04','2026-03-14',1,1);

-- -----------------------------------------------------
-- Holds
-- -----------------------------------------------------
INSERT INTO holds
(item_id, patron_id, hold_origin_date, hold_expiration_date, hold_status_code)
VALUES
(1,4,'2026-03-20','2026-03-30',1),
(8,3,'2026-03-20','2026-03-30',1),
(9,4,'2026-03-21','2026-03-31',1),
(10,5,'2026-03-21','2026-03-31',1),
(11,6,'2026-03-22','2026-04-01',1),

-- active holds
(12,11,'2026-04-05','2026-04-08',1),
(13,12,'2026-04-05','2026-04-08',1),
(14,13,'2026-04-05','2026-04-08',1),
(15,14,'2026-04-05','2026-04-08',1),

-- expired holds
(16,15,'2026-03-01','2026-03-03',3),
(17,16,'2026-03-01','2026-03-03',3),

-- fulfilled hold
(18,17,'2026-03-20','2026-03-25',2),

-- active holds
(19,18,'2026-04-01','2026-04-06',1),
(20,19,'2026-04-02','2026-04-07',1),
(21,20,'2026-04-02','2026-04-07',1);

-- -----------------------------------------------------
-- Fines
-- -----------------------------------------------------
INSERT INTO fines
(patron_id, fine_amount, fine_date)
VALUES
(3,5.00,'2026-03-10'),
(5,4.50,'2026-03-15'),
(7,2.75,'2026-03-16'),
(10,6.25,'2026-03-17'),
(2,1.50,'2026-03-18');



-- More extensive seed data for testing and demonstration purposes

-- -----------------------------------------------------
-- Additional Dummy Patrons for Testing
-- -----------------------------------------------------

-- -----------------------------------------------------
-- Additional Loans for Newly Added Patrons
-- -----------------------------------------------------

-- -----------------------------------------------------
-- Additional Holds
-- -----------------------------------------------------


-- -----------------------------------------------------
-- Additional Fines
-- -----------------------------------------------------

INSERT INTO fines
(patron_id, fine_amount, paid_amount, fine_date)
VALUES

-- unpaid fines
(15,4.50,0.00,'2026-03-20'),
(16,6.25,0.00,'2026-03-22'),

-- partial payment
(17,8.00,3.00,'2026-03-21'),
(18,10.50,5.00,'2026-03-22'),

-- fully paid
(19,3.25,3.25,'2026-03-18'),
(20,2.75,2.75,'2026-03-17'),

-- more unpaid
(21,7.00,0.00,'2026-03-23'),
(22,5.50,0.00,'2026-03-24'),

-- partial
(23,9.75,4.00,'2026-03-25'),

-- paid
(24,1.50,1.50,'2026-03-16');

-- -----------------------------------------------------
-- Waived Fine Example
-- -----------------------------------------------------

UPDATE fines
SET waived_date = '2026-03-30'
WHERE patron_id = 23;

UPDATE holds
SET hold_status_code = 2
WHERE hold_status_code = 1;


ALTER TABLE loans
ADD COLUMN lost_date DATE NULL;

ALTER TABLE items
ADD COLUMN created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP;

ALTER TABLE patrons
ADD COLUMN created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP;

SET SQL_SAFE_UPDATES =0;

UPDATE items
SET created_at = NOW()
WHERE created_at IS NULL;

UPDATE patrons
SET created_at = NOW()
WHERE created_at IS NULL;

UPDATE loans
SET lost_date = CURDATE()
WHERE loan_status_code = 3
  AND lost_date IS NULL;

  UPDATE items SET created_at = '2026-04-02 09:00:00' WHERE item_id = 2;
UPDATE items SET created_at = '2026-04-05 10:30:00' WHERE item_id = 15;
UPDATE items SET created_at = '2026-04-08 13:00:00' WHERE item_id = 33;
UPDATE items SET created_at = '2026-04-11 15:20:00' WHERE item_id = 35;
UPDATE items SET created_at = '2026-04-13 11:10:00' WHERE item_id = 36;
UPDATE items SET created_at = '2026-04-14 16:45:00' WHERE item_id = 51;