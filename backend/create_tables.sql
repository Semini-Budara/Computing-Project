-- Database and tables for the Educational Institute Management System
CREATE DATABASE IF NOT EXISTS `edumanager` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `edumanager`;
CREATE TABLE IF NOT EXISTS `users` (
    `id` INT NOT NULL AUTO_INCREMENT,
    `email` VARCHAR(255) NOT NULL,
    `username` VARCHAR(100) NOT NULL,
    `hashed_password` VARCHAR(255) NOT NULL,
    `role` VARCHAR(50) NOT NULL,
    `full_name` VARCHAR(255),
    PRIMARY KEY (`id`),
    UNIQUE KEY `uq_users_email` (`email`),
    UNIQUE KEY `uq_users_username` (`username`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4;
-- teachers must be created BEFORE students (students has a FK to teachers)
CREATE TABLE IF NOT EXISTS `teachers` (
    `id` INT NOT NULL AUTO_INCREMENT,
    `user_id` INT NOT NULL,
    `department` VARCHAR(100),
    `grade_assigned` VARCHAR(50),
    `class_fee` VARCHAR(50),
    `contact_number` VARCHAR(50),
    `profile_image` TEXT,
    `qualifications` TEXT,
    `experience` TEXT,
    `subjects_taught` TEXT,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uq_teachers_user_id` (`user_id`),
    CONSTRAINT `fk_teachers_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4;
CREATE TABLE IF NOT EXISTS `students` (
    `id` INT NOT NULL AUTO_INCREMENT,
    `user_id` INT NOT NULL,
    `teacher_id` INT,
    `age` INT,
    `grade` VARCHAR(50),
    `school` VARCHAR(150),
    `guardian_name` VARCHAR(150),
    `guardian_contact` VARCHAR(100),
    `profile_image` TEXT,
    `enrollment_status` VARCHAR(50) DEFAULT 'pending',
    PRIMARY KEY (`id`),
    UNIQUE KEY `uq_students_user_id` (`user_id`),
    CONSTRAINT `fk_students_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_students_teacher` FOREIGN KEY (`teacher_id`) REFERENCES `teachers` (`id`) ON DELETE
    SET NULL
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4;
CREATE TABLE IF NOT EXISTS `subjects` (
    `id` INT NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(255) NOT NULL,
    `description` TEXT,
    `grade` VARCHAR(50),
    `teacher_id` INT,
    `monthly_fee` FLOAT,
    `schedule_time` VARCHAR(255),
    PRIMARY KEY (`id`),
    CONSTRAINT `fk_subjects_teacher` FOREIGN KEY (`teacher_id`) REFERENCES `teachers` (`id`) ON DELETE
    SET NULL
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4;
CREATE TABLE IF NOT EXISTS `enrollments` (
    `id` INT NOT NULL AUTO_INCREMENT,
    `student_id` INT NOT NULL,
    `subject_id` INT NOT NULL,
    `status` VARCHAR(50) DEFAULT 'requested',
    `payment_status` VARCHAR(50) DEFAULT 'pending',
    `attendance_percentage` FLOAT DEFAULT 0,
    `grade` VARCHAR(20) DEFAULT 'N/A',
    PRIMARY KEY (`id`),
    CONSTRAINT `fk_enrollments_student` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_enrollments_subject` FOREIGN KEY (`subject_id`) REFERENCES `subjects` (`id`) ON DELETE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4;
CREATE TABLE IF NOT EXISTS `timetable` (
    `id` INT NOT NULL AUTO_INCREMENT,
    `subject_id` INT NOT NULL,
    `day` VARCHAR(20) NOT NULL,
    `start_time` VARCHAR(20) NOT NULL,
    `end_time` VARCHAR(20) NOT NULL,
    `classroom` VARCHAR(100),
    PRIMARY KEY (`id`),
    CONSTRAINT `fk_timetable_subject` FOREIGN KEY (`subject_id`) REFERENCES `subjects` (`id`) ON DELETE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4;
CREATE TABLE IF NOT EXISTS `payments` (
    `id` INT NOT NULL AUTO_INCREMENT,
    `student_id` INT NOT NULL,
    `enrollment_id` INT,
    `amount` FLOAT NOT NULL,
    `currency` VARCHAR(10) NOT NULL DEFAULT 'USD',
    `status` VARCHAR(50) DEFAULT 'completed',
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    CONSTRAINT `fk_payments_student` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_payments_enrollment` FOREIGN KEY (`enrollment_id`) REFERENCES `enrollments` (`id`) ON DELETE
    SET NULL
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4;
CREATE TABLE IF NOT EXISTS `notifications` (
    `id` INT NOT NULL AUTO_INCREMENT,
    `student_id` INT,
    `teacher_id` INT,
    `title` VARCHAR(255) NOT NULL,
    `message` TEXT NOT NULL,
    `category` VARCHAR(100) DEFAULT NULL,
    `target_role` VARCHAR(50) NOT NULL DEFAULT 'all',
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    CONSTRAINT `fk_notifications_student` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_notifications_teacher` FOREIGN KEY (`teacher_id`) REFERENCES `teachers` (`id`) ON DELETE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4;
CREATE TABLE IF NOT EXISTS `notification_dismissals` (
    `id` INT NOT NULL AUTO_INCREMENT,
    `notification_id` INT NOT NULL,
    `user_id` INT NOT NULL,
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uq_notification_dismissals_notification_user` (`notification_id`, `user_id`),
    CONSTRAINT `fk_notification_dismissals_notification` FOREIGN KEY (`notification_id`) REFERENCES `notifications` (`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_notification_dismissals_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4;