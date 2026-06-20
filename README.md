# 🎓 Student Management System

## 📖 Overview

The Student Management System is a web-based application designed for educational institutes to manage students, teachers, subjects, timetables, results, payments, and notifications efficiently.

The system uses **Role-Based Access Control (RBAC)** and consists of three user roles:

* Admin
* Teacher
* Student

Only the Admin can create accounts for students and teachers. Public self-registration is disabled to maintain security and institutional control.

---

# 🔐 Authentication

The system implements secure authentication with role-based access.

### Default Admin Account

| Username | Password  |
| -------- | --------- |
| admin    | adminpass |

---

# 👨‍💼 Admin Module

The Admin has full access to the entire system.

## Features

### Student Management

* Register students
* Manage student information

### Teacher Management

* Register teachers
* Manage teacher information

### Subject Management

* Add subjects
* Update subjects
* Manage subject details

### Timetable Management

* Create timetables
* Update class schedules

### Notification Management

Send notifications based on:

* Special Events
* Payment Reminders
* Class Updates

Notifications can be sent to:

* Students
* Teachers
* Both Students and Teachers

---

# 👨‍🏫 Teacher Module

Teachers can manage academic activities related to their assigned subjects.

## Features

### Timetable

* View personal timetable
* View scheduled classes

### Student Management

* View enrolled students for assigned subjects

### Results Management

* Add student grades
* Update student grades
* Manage academic results

### Subject Information

* View assigned subjects

---

# 👨‍🎓 Student Module

Students have view-only access to academic information.

## Features

### Timetable

* View class schedules
* View class dates and times

### Results

View examination results categorized by terms:

* First Term
* Second Term
* Third Term

### Subjects

* View enrolled subjects
* View assigned teachers for each subject

### Teachers

* View all teachers in the institute

---

# 💳 Payment Management

Students can manage fee payments through the system.

## Features

* View paid payments
* View unpaid payments
* Online payment support
* Card payment processing

### Enrollment Payment Options

* Online Payment
* Physical Payment

---

# 🤖 AI Chatbot

An AI-powered chatbot is integrated into the Student Portal.

## Supported Topics

The chatbot can answer questions related to:

* Schedule
* Timetable
* Classes
* Subjects
* Courses
* Results
* Grades
* Exams
* Payments
* Fees
* Teachers
* Mentors
* Instructors

The chatbot currently provides responses based on predefined educational information and keywords.

---

# 🏗️ System Modules

## Authentication Module

* Login Management
* Role-Based Authorization

## Student Management Module

* Student Registration
* Student Profile Management

## Teacher Management Module

* Teacher Registration
* Teacher Profile Management

## Subject Management Module

* Subject Creation and Management

## Timetable Management Module

* Timetable Scheduling
* Class Management

## Result Management Module

* Grade Management
* Result Viewing

## Payment Management Module

* Online Payments
* Payment Tracking
* Outstanding Payment Management

## Notification Management Module

* Event Notifications
* Payment Reminders
* Class Updates

## AI Chatbot Module

* Student Assistance
* Academic Information Support

---

# 🛠️ Technology Stack

## Frontend

* React.js

## Backend

* Node.js
* Express.js

## Database

* Microsoft SQL Server

---

# 🚀 Installation

## Frontend Setup

```bash
cd frontend
npm install
npm start
```

## Backend Setup

```bash
cd backend
npm install
npm start
```

## Database Setup

Configure your SQL Server connection settings in the backend configuration file before running the application.

---

# 📈 Future Enhancements

* Attendance Management
* Assignment Submission
* Learning Materials
* Parent Portal
* Advanced AI Chatbot Features
* Analytics Dashboard

---

# 🎯 Project Objective

The objective of this project is to provide a centralized platform for managing educational activities, student records, teacher operations, timetables, examination results, payments, and institutional communication in a secure and efficient manner.
