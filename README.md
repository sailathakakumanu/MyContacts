# MyContacts – Personal Contact Management System

##  Overview

MyContacts is a full-stack web application that allows users to securely manage their personal contacts.
Each user can create, view, update, and delete their own contacts with support for multiple phone numbers.

---

##  Features

### Authentication

* Basic login system (username & password)
* User-specific data access

###  Contact Management (CRUD)

* Add new contacts
* View all contacts
* Update existing contacts
* Delete contacts

### Phone Numbers

* Each contact can have multiple phone numbers

### Security

* User-level data isolation
* Users can only access their own contacts

---

## Tech Stack

### Backend

* Java 17
* Spring Boot
* Spring Data JPA
* Hibernate
* MySQL

### Frontend

* React / Vite
* HTML, CSS, JavaScript

### Tools

* Maven
* Git & GitHub
* Postman

---

## Architecture

The application follows a layered architecture:

* **Controller Layer** → Handles HTTP requests
* **Service Layer** → Business logic
* **Repository Layer** → Database interaction

---

## Database Design

### User

* id
* username
* password

### Contact

* id
* firstName
* lastName
* user_id (FK)

### PhoneNumber

* id
* number
* contact_id (FK)

### Relationships

* One User → Many Contacts
* One Contact → Many Phone Numbers

---

## API Endpoints

### Authentication

* `POST /login`

### Contacts

* `GET /contacts` → Get all contacts for logged-in user
* `POST /contacts` → Create contact
* `PUT /contacts/{id}` → Update contact
* `DELETE /contacts/{id}` → Delete contact

### Phone Numbers

* `POST /contacts/{id}/numbers` → Add phone number

---

## Setup Instructions

###  Clone Repository

```bash
git clone https://github.com/your-repo/mycontacts.git
cd mycontacts
```

---

### Backend Setup

```bash
cd backend
```

#### Create Database

```sql
CREATE DATABASE contacts_db;
```

#### Run Backend

```bash
mvn clean install
mvn spring-boot:run
```

---

###  Frontend Setup

```bash
cd frontend
npm install
npm run dev
```
 Open browser:

```
http://localhost:5173
```

---

## Security Approach

* Basic authentication using login credentials
* User identity maintained per session
* Data filtered using user ID
* Prevents unauthorized access to other users' contacts

---

## Future Enhancements

* JWT-based authentication
* Role-based access (Admin/User)
* Search and filtering
* Contact import/export
* UI improvements

---

## Demo Flow

1. User logs in
2. Adds a contact with multiple numbers
3. Views list of contacts
4. Updates a contact
5. Deletes a contact

---

## Key Highlights

* Clean layered architecture
* Proper database relationships
* Secure data isolation
* Full CRUD functionality

---

## Conclusion

MyContacts demonstrates a real-world contact management system with secure data handling, scalable backend design, and user-friendly frontend interaction.

---

##Author

* Your Name

---
