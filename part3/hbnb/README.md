# HBnB Evolution: Persistence, Authentication & Administrator Access

This project implements the backend infrastructure for the HBnB application, focusing on transitioning from in-memory storage to a persistent **SQLAlchemy** database, securing data with **Bcrypt** hashing, and managing access via **JWT (JSON Web Tokens)**.

## 1. Database Architecture (ER Diagram)

The database schema is designed to handle users, properties, reviews, and amenities with strict relational integrity.

```mermaid
erDiagram
    USER ||--o{ PLACE : "owns"
    USER ||--o{ REVIEW : "writes"
    PLACE ||--o{ REVIEW : "has"
    PLACE ||--o{ PLACE_AMENITY : "contains"
    AMENITY ||--o{ PLACE_AMENITY : "is_in"

    USER {
        char-36 id PK
        varchar first_name
        varchar last_name
        varchar email UK
        varchar password
        boolean is_admin
    }

    PLACE {
        char-36 id PK
        varchar title
        text description
        decimal price
        float latitude
        float longitude
        char-36 owner_id FK
    }

    REVIEW {
        char-36 id PK
        text text
        int rating
        char-36 user_id FK
        char-36 place_id FK
    }

    AMENITY {
        char-36 id PK
        varchar name UK
    }

    PLACE_AMENITY {
        char-36 place_id PK, FK
        char-36 amenity_id PK, FK
    }

2. Technical Implementation Details
Persistence Layer (SQLAlchemy)

    SQLAlchemyRepository: A generic base class handling standard CRUD (Add, Get, Update, Delete) for all entities.
    UserRepository: A specialized repository for user-specific queries, such as retrieving a user by email.
    BaseModel: An abstract base class providing id (UUID4), created_at, and updated_at to all mapped entities.

Security & Authentication

    Password Hashing: Utilizes Flask-Bcrypt. Passwords are hashed during user registration and verified during login.
    JWT Authentication: Managed via Flask-JWT-Extended. Tokens carry identity (user_id) and additional claims (is_admin).
    Configuration: Uses a Config class to manage SQLALCHEMY_DATABASE_URI and JWT_SECRET_KEY.

3. Access Control & API Logic
Public Access

    GET /api/v1/places/: List all places.
    GET /api/v1/places/<id>: View place details.

Authenticated User Access

    POST /api/v1/places/: Create a place (current user becomes owner_id).
    PUT /api/v1/places/<id>: Update place (Owner only).
    POST /api/v1/reviews/: Create a review.
        Constraint: Users cannot review their own place.
        Constraint: Users can only review a place once.
    PUT /api/v1/users/<id>: Modify own profile (Email and Password modification restricted).

Administrator Access (RBAC)
Administrators (is_admin=True) bypass standard ownership restrictions and have exclusive access to:

    POST /api/v1/users/: Create new users.
    PUT /api/v1/users/<id>: Full modification of any user (including email/password).
    POST /api/v1/amenities/: Create new amenities.
    PUT /api/v1/amenities/<id>: Modify amenities.
    Bypass: Admins can modify or delete any Place or Review regardless of ownership.

4. Setup & Initialization
Dependencies
Install the required packages using the Flask Documentation:
bash

pip install flask-sqlalchemy flask-bcrypt flask-jwt-extended

Initialize Database
To generate the SQLite database file and tables:
bash

flask shell
>>> from app import db
>>> db.create_all()

Seeding Initial Data
Use the following credentials for the default administrator (Fixed ID: 36c9050e-ddd3-4c3b-9731-9f487208bbc1):

    Email: admin@hbnb.io
    Password: admin1234

5. Testing with cURL
Admin Login:
bash

curl -X POST "http://127.0.0.1" \
     -H "Content-Type: application/json" \
     -d '{"email": "admin@hbnb.io", "password": "admin1234"}'

Create Amenity (Admin Only):
bash

curl -X POST "http://127.0.0.1" \
     -H "Authorization: Bearer <JWT_TOKEN>" \
     -H "Content-Type: application/json" \
     -d '{"name": "WiFi"}'