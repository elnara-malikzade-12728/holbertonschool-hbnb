

0. Project Setup and Package Initialization

Instructions:

1. Create the Project Directory Structure:
Your project should be organized into the following structure:

hbnb/
├── app/
│   ├── __init__.py
│   ├── api/
│   │   ├── __init__.py
│   │   ├── v1/
│   │       ├── __init__.py
│   │       ├── users.py
│   │       ├── places.py
│   │       ├── reviews.py
│   │       ├── amenities.py
│   ├── models/
│   │   ├── __init__.py
│   │   ├── user.py
│   │   ├── place.py
│   │   ├── review.py
│   │   ├── amenity.py
│   ├── services/
│   │   ├── __init__.py
│   │   ├── facade.py
│   ├── persistence/
│       ├── __init__.py
│       ├── repository.py
├── run.py
├── config.py
├── requirements.txt
├── README.md

Explanation:

- The app/ directory contains the core application code.
- The api/ subdirectory houses the API endpoints, organized by version (v1/).
- The models/ subdirectory contains the business logic classes (e.g., user.py, place.py).
- The services/ subdirectory is where the Facade pattern is implemented, managing the interaction between layers.
- The persistence/ subdirectory is where the in-memory repository is implemented. This will later be replaced by a database-backed solution using SQL Alchemy.
- run.py is the entry point for running the Flask application.
- config.py will be used for configuring environment variables and application settings.
- requirements.txt will list all the Python packages needed for the project.
- README.md will contain a brief overview of the project.


2. Initialize Python Packages:
In each directory that is intended to be a Python package (e.g., app/, api/, models/, services/, persistence/, v1/),
create an empty __init__.py file. This tells Python to treat these directories as importable packages.


3. Set Up the Flask Application with Placeholders:
Inside the app/ directory, create the Flask application instance within the __init__.py file.


4. Implement the In-Memory Repository in Persistence subdirectory:
The in-memory repository will handle object storage and validation.
It follows a consistent interface that will later be replaced by a database-backed repository.


5. Plan for the Facade Pattern with Placeholders in Services subdirectory:
In the services/ subdirectory, create a facade.py file where you will define the HBnBFacade class.
This class will handle communication between the Presentation, Business Logic, and Persistence layers.
You will interact with the repositories (like the in-memory repository) through this Class.
The facade instance will be used in __init__.py as a singleton to make sure that only one instance of the HBnBFacade class is created and used throughout the application.


6. Create the Entry Point in run.py:
In the root directory, create the run.py file that will serve as the entry point for running the application.


7. Prepare the Configuration in config.py:
In the root directory, create a config.py file where you can define environment-specific settings.


8. Install Required Packages in requirements.txt:
In the requirements.txt file, list the Python packages needed for the project:

flask
flask-restx


9. Install the dependencies using:
pip install -r requirements.txt

10. Test the Initial Setup
Run the application to ensure everything is set up correctly.

python run.py

------------------------------------------------------------------------------------------------------------


1. Core Business Logic Layer

The Business Logic layer is the core of the HBnB application. It handles data validation,
manages relationships between entities, and ensures the integrity of the application's rules.

Core Entities:
All business entities inherit from a BaseModel to ensure consistency. Each object is uniquely identified by a UUID
(Universally Unique Identifier) rather than a sequential ID to ensure global uniqueness and improved security.
- User: Manages user information, including names, unique email addresses, and administrative privileges.
- Place: Represents a rental listing. It tracks details like title, price, location coordinates, and maintains relationships with its owner, reviews, and amenities.
- Review: Stores feedback provided by a User for a specific Place, including a rating (1-5).
- Amenity: Represents features available at a Place, such as "Wi-Fi" or "Parking".

Entity Relationships:
- User & Place: A User can own multiple Place instances (one-to-many).
- Place & Review: A Place can have multiple Review instances associated with it (one-to-many).
- Place & Amenity: A Place can be associated with multiple Amenities (many-to-many).


---------------------------------------------------------------------------------------------------------------------------

2. Users Endpoints:

Implemented the Facade Pattern to manage communication between the API layers and Business logic endpoints needed for managing users in the HBNB application.
Created full CRUD (Create, Read, Update) functionality for Users, including email uniqueness and structured data responses.

User Management Key Features:
- UUID Identification: Every user is assigned a unique UUID4 upon creation to ensure distinct identity across the system.
- Email Uniqueness: Implementation of logic in the Business Layer to prevent multiple users from registering with the same email address.
- Mandatory Attribute Validation: Ensures that first_name, last_name, and email are provided and valid before a user is persisted.
- Profile Management: Full support for retrieving a user's profile by ID and updating profile details through the Facade.


API Endpoints for Users:
POST: /api/v1/users/      -->  Register a new user
GET:  /api/v1/users/      -->  List all users
GET:  /api/v1/users/<id>  -->  Get specific user details
PUT:  /api/v1/users/<id>  -->  Update user information

How to Run and Test:

- Start the Flask Server:
python run.py

- Access Swagger Documentation:
Open your browser and navigate to http://127.0.0.1:5000/api/v1/. 
Use the interactive UI to test the endpoints.

- Testing with Postman:
Set headers to Content-Type: application/json.
Use the provided endpoints above to verify JSON responses and status codes (200, 201, 400, 404).


User Request body (POST)   -->   JSON

{
  "first_name": "John",
  "last_name": "Doe",
  "email": "john.doe@example.com"
}

User Request body (PUT )  --> JSON

{
  "first_name": "Jane",
  "last_name": "Doe",
  "email": "jane.doe@example.com"
}

User Response Body (GET)  --> JSON

[
  {
    "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "first_name": "John",
    "last_name": "Doe",
    "email": "john.doe@example.com"
  },
  ...
]

---------------------------------------------------------------------------------------------------------------------------

3. Amenities Endpoints:

Implemented the Facade Pattern to manage communication between the API layers and Business logic endpoints needed for managing Amenities in the HBNB application.
Created full CRUD (Create, Read, Update) functionality for Amenities.

Amenity Management Key Features:
- Standalone Entity Logic: Amenities are managed as independent objects that can exist before being linked to any specific property.
- Attribute Enforcement: Includes validation to ensure the name of the amenity is provided and correctly formatted during creation.
- Repository Integration: Utilizes the InMemoryRepository for efficient storage and retrieval of amenity lists.
- Relationship Readiness: Designed to be retrieved by ID so they can be associated with Place entities in subsequent tasks.

API Endpoints for Amenities:
POST: /api/v1/amenities/      -->  Register a new amenity
GET:  /api/v1/amenities/      -->  List all amenities
GET:  /api/v1/amenities/<id>  -->  Get specific amenity
PUT:  /api/v1/amenities/<id>  -->  Update amenity information

How to Run and Test:

- Start the Flask Server:
python run.py

- Access Swagger Documentation:
Open your browser and navigate to http://127.0.0.1:5000/api/v1/. 
Use the interactive UI to test the endpoints.

- Testing with Postman:
Set headers to Content-Type: application/json.
Use the provided endpoints above to verify JSON responses and status codes (200, 201, 400, 404).

Amenity Request Body (POST)  --> JSON

{
  "name": "Wi-Fi"
}

Amenity Request Body (PUT)  -->  JSON

{
  "name": "Air Conditioning"
}

Amenity Response Body (GET) --> JSON

[
  {
    "id": "1fa85f64-5717-4562-b3fc-2c963f66afa6",
    "name": "Wi-Fi"
  },
  {
    "id": "2fa85f64-5717-4562-b3fc-2c963f66afa6",
    "name": "Air Conditioning"
  }
]

-----------------------------------------------------------------------------------------------------------

4. Places Endpoints:

Implemented the CRUD operations for the Place entity. The focus was on integrating the Presentation Layer (RESTful API) 
with the Business Logic Layer using the Facade Pattern, ensuring that geographic coordinates and pricing are strictly validated.

Place Management Key Features:
- Implemented POST /api/v1/places/ to register new accommodations, linking them to an existing owner (User).
- Geographic Validation: Added strict constraints to ensure latitude is between -90 and 90, and longitude is between -180 and 180.
- Financial Validation: Ensured that the price attribute is a non-negative float.
- Relationship Handling: Updated the GET /api/v1/places/<place_id> endpoint to return nested objects for the Owner and a list of Amenities.
- Facade Integration: All data flow is managed through the HBnBFacade to maintain a clean separation of concerns.

API Endpoints for Places:
POST: /api/v1/places/      --> Register a new place 201, 400
GET:  /api/v1/places/      --> Retrieve all places  200
GET:  /api/v1/places/<id>  --> Detailed view (inc. Owner & Amenities)200, 404
PUT:  /api/v1/places/<id>  --> Update place details 200, 400, 404


Place Request Body (POST) -->  JSON

{
  "title": "Cozy Apartment",
  "description": "A nice place to stay",
  "price": 100.0,
  "latitude": 37.7749,
  "longitude": -122.4194,
  "owner_id": "3fa85f64-5717-4562-b3fc-2c963f66afa6"
}

Place Request Body (PUT) --> JSON

{
  "title": "Luxury Condo",
  "description": "An upscale place to stay",
  "price": 200.0
}

Place Response Body (GET) --> JSON

[
  {
    "id": "1fa85f64-5717-4562-b3fc-2c963f66afa6",
    "title": "Cozy Apartment",
    "latitude": 37.7749,
    "longitude": -122.4194
  },
  ...
]


----------------------------------------------------------------------------------------------------------------------------------------

5. Reviews Endpoints:

Implemented the CRUD (Create, Read, Update, Delete) operations for the Review entity.
The implementation ensures that reviews are correctly linked to both a User (the author) and a Place (the subject of the review),
maintaining data integrity across the HBnB application.

Review Management Key Features:
- Review Creation: Implemented POST /api/v1/reviews/ requiring a valid user_id and place_id.
- Rating Validation: Added logic to ensure ratings are integers between 1 and 5.
- Full CRUD Support:
 - Read: Retrieve all reviews or a specific review by ID.
 - Update: Modify review text or rating via PUT.
 - Delete: Remove a review from the system via DELETE.
- Relationship Integrity: The Facade validates that both the author (User) and the property (Place) exist before allowing a review to be created.


API Endpoints for Reviews:
POST    /api/v1/reviews/      --> Register a new review      201, 400
GET     /api/v1/reviews/      --> Retrieve all reviews       200
GET     /api/v1/reviews/<id>  --> Retrieve review details    200, 404
PUT     /api/v1/reviews/<id>  --> Update review text/rating  200, 400, 404
DELETE  /api/v1/reviews/<id>  --> Remove a review            200, 404


Review Request Body (POST)  --> JSON

{
  "text": "Amazing stay! The host was very welcoming.",
  "rating": 5,
  "user_id": "user-uuid-string",
  "place_id": "place-uuid-string"
}

Review Request Body (PUT) --> JSON

{
  "text": "Amazing stay!",
  "rating": 4
}

Review Response (GET)   --> JSON

{
  "id": "review-uuid-string",
  "text": "Amazing stay!",
  "rating": 5,
  "user_id": "user-uuid-string",
  "place_id": "place-uuid-string"
}

Implementation Notes:

- Facade Pattern: The HBnBFacade coordinates the lookup of User and Place objects before instantiating a Review.
- Error Handling: Implemented specific checks for 404 Not Found when a review, user, or place does not exist in the repository.
- Repository Integration: The InMemoryRepository was updated with a delete method to support the removal of review records.