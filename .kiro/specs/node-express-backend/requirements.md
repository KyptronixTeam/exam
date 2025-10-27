# Requirements Document

## Introduction

This document outlines the requirements for migrating the existing Supabase-based backend to a Node.js Express server with MongoDB database. The system handles user authentication, multi-step form submissions, file uploads, and admin management functionality for what appears to be a student project submission platform.

## Glossary

- **Backend_System**: The Node.js Express server with MongoDB that will replace Supabase
- **User**: A person who submits forms through the application (students)
- **Admin**: A privileged user who can manage submissions, questions, and system data
- **Submission**: A complete form submission including personal info, MCQ answers, project details, and files
- **MCQ_Question**: Multiple choice questions used in the assessment step
- **File_Storage**: System for storing uploaded files (documents, images, etc.)
- **Authentication_Service**: JWT-based authentication system for users and admins
- **Database**: MongoDB database storing all application data

## Requirements

### Requirement 1

**User Story:** As a student, I want to authenticate using email/password or phone OTP, so that I can securely access the submission system

#### Acceptance Criteria

1. WHEN a user provides valid email and password, THE Backend_System SHALL authenticate the user and return a JWT token
2. WHEN a user requests phone OTP authentication, THE Backend_System SHALL send an OTP to the provided phone number
3. WHEN a user provides valid phone number and OTP, THE Backend_System SHALL authenticate the user and return a JWT token
4. THE Backend_System SHALL validate JWT tokens for protected routes
5. WHEN a user logs out, THE Backend_System SHALL invalidate the JWT token

### Requirement 2

**User Story:** As an admin, I want role-based access control, so that I can manage the system while preventing unauthorized access

#### Acceptance Criteria

1. THE Backend_System SHALL support user roles including "admin" and "user"
2. WHEN the first user registers, THE Backend_System SHALL automatically assign admin role
3. WHEN an admin creates additional users, THE Backend_System SHALL allow role assignment
4. THE Backend_System SHALL restrict admin endpoints to users with admin role
5. WHEN a non-admin attempts to access admin routes, THE Backend_System SHALL return 403 Forbidden

### Requirement 3

**User Story:** As a student, I want to submit my personal information, so that the system can identify and contact me

#### Acceptance Criteria

1. THE Backend_System SHALL accept and validate personal information including full name, email, phone, college name, department, year, and semester
2. THE Backend_System SHALL enforce required field validation for personal information
3. THE Backend_System SHALL validate email format and phone number format
4. THE Backend_System SHALL store personal information in the Database
5. THE Backend_System SHALL prevent duplicate submissions from the same email address

### Requirement 4

**User Story:** As a student, I want to answer MCQ questions, so that I can complete the assessment portion of my submission

#### Acceptance Criteria

1. THE Backend_System SHALL serve MCQ questions to authenticated users
2. THE Backend_System SHALL accept and store MCQ answers linked to user submissions
3. THE Backend_System SHALL validate that all required MCQ questions are answered
4. THE Backend_System SHALL calculate and store MCQ scores
5. THE Backend_System SHALL support dynamic MCQ question management

### Requirement 5

**User Story:** As a student, I want to provide project details, so that I can describe my work and include relevant links

#### Acceptance Criteria

1. THE Backend_System SHALL accept project title, description, and website URL
2. THE Backend_System SHALL validate URL format for website links
3. THE Backend_System SHALL enforce character limits for project descriptions
4. THE Backend_System SHALL store project details linked to user submissions
5. THE Backend_System SHALL support rich text formatting in project descriptions

### Requirement 6

**User Story:** As a student, I want to upload files related to my project, so that I can provide supporting documentation

#### Acceptance Criteria

1. THE Backend_System SHALL accept multiple file uploads per submission
2. THE Backend_System SHALL validate file types and sizes before storage
3. THE Backend_System SHALL store files securely in File_Storage
4. THE Backend_System SHALL generate unique file identifiers and store metadata
5. THE Backend_System SHALL support file download for authorized users

### Requirement 7

**User Story:** As an admin, I want to view and manage all submissions, so that I can review student work and make decisions

#### Acceptance Criteria

1. THE Backend_System SHALL provide endpoints to retrieve all submissions with pagination
2. THE Backend_System SHALL support filtering submissions by date, status, and other criteria
3. THE Backend_System SHALL allow admins to update submission status
4. THE Backend_System SHALL provide detailed submission views including all form data and files
5. THE Backend_System SHALL support exporting submission data in common formats

### Requirement 8

**User Story:** As an admin, I want to manage MCQ questions, so that I can update assessments and maintain question quality

#### Acceptance Criteria

1. THE Backend_System SHALL allow admins to create, read, update, and delete MCQ questions
2. THE Backend_System SHALL support multiple choice options with correct answer marking
3. THE Backend_System SHALL validate MCQ question structure before saving
4. THE Backend_System SHALL support question categorization and tagging
5. THE Backend_System SHALL maintain question version history for audit purposes

### Requirement 9

**User Story:** As an admin, I want to load demo data, so that I can test the system and provide examples

#### Acceptance Criteria

1. THE Backend_System SHALL provide endpoints to load predefined demo data
2. THE Backend_System SHALL support loading demo users, submissions, and MCQ questions
3. THE Backend_System SHALL prevent demo data loading in production environments
4. THE Backend_System SHALL allow clearing demo data when needed
5. THE Backend_System SHALL maintain data integrity when loading demo content

### Requirement 10

**User Story:** As a developer, I want comprehensive API documentation, so that I can integrate the frontend effectively

#### Acceptance Criteria

1. THE Backend_System SHALL provide OpenAPI/Swagger documentation for all endpoints
2. THE Backend_System SHALL include request/response examples in documentation
3. THE Backend_System SHALL document authentication requirements for each endpoint
4. THE Backend_System SHALL provide error response documentation with status codes
5. THE Backend_System SHALL maintain up-to-date API documentation with code changes