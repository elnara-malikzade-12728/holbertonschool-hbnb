

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

************** VALID DATA *********************
User Request body (POST)   -->   JSON               

{
  "first_name": "John",
  "last_name": "Doe",
  "email": "john.doe@example.com"
}

User Response Body (POST)

{
    "id": "3fc9a9cf-6b26-45b4-a26a-5eae5eadf24d",
    "first_name": "John",
    "last_name": "Doe",
    "email": "john.doe@example.com"
}
################# INVALID DATA ##################
User Request Body (POST)   --> JSON
{
  "first_name": "",
  "last_name": "Doe",
  "email": "john.doe@example.com"
}

User Response Body (POST)

{
    "message": "First name is required"
}

****************** VALID DATA ******************
User Request body (PUT)  --> JSON

{
  "first_name": "Jane",
  "last_name": "Doe",
  "email": "jane.doe@example.com"
}

User Response Body (PUT)
{
    "id": "af5dd895-fb21-46da-82a9-e909b3e26fc1",
    "first_name": "Jane",
    "last_name": "Doe",
    "email": "jane.doe@example.com"
}

############ INVALID DATA ######################
User Request Body (PUT)   --> JSON

{
  "first_name": "",
  "last_name": "Doe",
  "email": "jane.doe@example.com"
}

User Response Body (PUT)

{
    "error": "First name is required"
}

***************** VALID DATA *******************
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

User Response Body (GET)

{
    "error": "User not found"
}

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

***************** VALID DATA **********************
Amenity Request Body (POST)  --> JSON
{
  "name": "Wi-Fi"
}

Amenity Response Body (POST)
{
    "id": "c49c1b96-9c67-4c0b-8f21-8fdb9d54dcbd",
    "name": "Wi-Fi"
}

################ INVALID DATA ######################
Amenity Request Body (POST)   --> JSON
{
  "name": ""
}

Amenity Response Body (POST)
{
    "error": "Name is required"
}

*************** VALID DATA **************************
Amenity Request Body (PUT)  -->  JSON
{
  "name": "Air Conditioning"
}

Amenity Response Body (PUT)
{
    "message": "Amenity updated successfully"
}
################# INVALID DATA #######################
Amenity Request Body (PUT) --> JSON
{
  "name": ""
}

Amenity Response Body (PUT)
{
    "error": "Amenity not found"
}

**************** VALID DATA *********************
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

Amenity Response Body (GET)
{
    "error": "Amenity not found"
}


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

How to Run and Test:

- Start the Flask Server:
python run.py

- Access Swagger Documentation:
Open your browser and navigate to http://127.0.0.1:5000/api/v1/. 
Use the interactive UI to test the endpoints.

- Testing with Postman:
Set headers to Content-Type: application/json.
Use the provided endpoints above to verify JSON responses and status codes (200, 201, 400, 404).

**************** VALID DATA ************************
Place Request Body (POST) -->  JSON
{
  "title": "Cozy Apartment",
  "description": "A nice place to stay",
  "price": 100.0,
  "latitude": 37.7749,
  "longitude": -122.4194,
  "owner_id": "5a71cf64-2352-4982-8bbf-b38873d36f43",
  "amenities":["ab338ba3-e832-4ebe-a0aa-22b2e308811a"]
  }

Place Response Body (POST)
{
    "id": "607991a6-09e7-4efa-b5d8-2a3ab4ec80db",
    "title": "Cozy Apartment",
    "latitude": 37.7749,
    "longitude": -122.4194,
    "owner_id": "5a71cf64-2352-4982-8bbf-b38873d36f43"
}
############ INVALID DATA #####################
Place Request Body (POST) -->  JSON
{
  "title": "Cozy Apartment",
  "description": "A nice place to stay",
  "price": 100.0,
  "latitude": 101,
  "longitude": -122.4194,
  "owner_id": "5a71cf64-2352-4982-8bbf-b38873d36f43",
  "amenities":["ab338ba3-e832-4ebe-a0aa-22b2e308811a"]
  }

Place Response Body (POST)
{
    "error": "Latitude must be between -90 and 90"
}

Place Request Body (POST) -->  JSON
{
  "title": "Cozy Apartment",
  "description": "A nice place to stay",
  "price": 100.0,
  "latitude": 37.7749,
  "longitude": -190,
  "owner_id": "7018b32f-dd28-4c72-932d-0b3f22de93fd",
  "amenities":["ab338ba3-e832-4ebe-a0aa-22b2e308811a"]
  }

Place Response Body (POST)
{
    "error": "Longitude must be between -180 and 180"
}

Place Request Body (POST) -->  JSON
{
  "title": "Cozy Apartment",
  "description": "A nice place to stay",
  "price": 100.0,
  "latitude": 37.7749,
  "longitude": -122.4194,
  "owner_id": "",
  "amenities":["ab338ba3-e832-4ebe-a0aa-22b2e308811a"]
  }

Place Response Body (POST)
{
    "error": "Owner not found"
}

*************** VALID DATA *******************
Place Request Body (PUT) --> JSON
{
  "title": "Luxury Condo",
  "description": "An upscale place to stay",
  "price": 200.0
}

Place Response Body (PUT)
{
    "message": "Place updated successfully"
}

############## INVALID DATA ###################
Place Request Body (PUT) --> JSON
{
  "title": "",
  "description": "An upscale place to stay",
  "price": 100
}

Place Response Body (PUT)
{
    "error": "Title can not be empty"
}

Place Request Body (PUT) --> JSON
{
  "title": "Luxury Condo",
  "description": "",
  "price": -20
}

Place Response Body (PUT)
{
    "error": "Place not found"
}

Place Request Body (PUT) --> JSON
{
  "title": "Luxury Condo",
  "description": "An upscale place to stay",
  "price": -20
}

Place Response Body (PUT)
{
    "error": "Price must be a non-negative float"
}

************** VALID DATA ***********************
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
{
    "error": "Place not found"
}
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

How to Run and Test:

- Start the Flask Server:
python run.py

- Access Swagger Documentation:
Open your browser and navigate to http://127.0.0.1:5000/api/v1/. 
Use the interactive UI to test the endpoints.

- Testing with Postman:
Set headers to Content-Type: application/json.
Use the provided endpoints above to verify JSON responses and status codes (200, 201, 400, 404).

*************** VALID DATA *********************
Review Request Body (POST)  --> JSON
{
  "text": "Great place to stay!",
  "rating": 5,
  "user_id": "bf8a1448-cdd2-4f2f-96dc-3c80b3849009",
  "place_id": "ea745c55-edbb-426a-bed7-790b4982e439"
}
Review Response Body (POST)  --> JSON
{
    "id": "db28f79f-4961-4e61-a881-d132cc6c92e8",
    "text": "Great place to stay!",
    "rating": 5,
    "user_id": "bf8a1448-cdd2-4f2f-96dc-3c80b3849009",
    "place_id": "ea745c55-edbb-426a-bed7-790b4982e439"
}
################ INVALID DATA #######################
Review Request Body (POST)  --> JSON
{
  "text": "Great place to stay!",
  "rating": 5,
  "user_id": "",
  "place_id": "ea745c55-edbb-426a-bed7-790b4982e439"
}

Review Response Body (POST)  --> JSON
{
    "error": "Invalid User or Place ID"
}

Review Request Body (POST)  --> JSON
{
  "text": "Great place to stay!",
  "rating": 5,
  "user_id": "bf8a1448-cdd2-4f2f-96dc-3c80b3849009",
  "place_id": ""
}

Review Response Body (POST)  --> JSON
{
    "error": "Invalid User or Place ID"
}

Review Request Body (POST)  --> JSON
{
  "text": "Great place to stay!",
  "rating": 10,
  "user_id": "143bc226-a5d6-415f-ade0-d2284a6b45b2",
  "place_id": "d54e825b-1bd9-4143-9169-86bcff88995c"
}

Review Response Body (POST)  --> JSON
{
    "error": "Rating must be between 1 and 5"
}
*************** VALID DATA ********************
Review Request Body (PUT) --> JSON
{
  "text": "Amazing stay!",
  "rating": 4
}

Review Response Body (PUT) --> JSON
{
    "message": "Review updated successfully"
}
################## INVALID DATA #####################
Review Request Body (PUT) --> JSON
{
  "text": "",
  "rating": 4
}

Review Response Body (PUT) --> JSON
{
    "error": "Review not found"
}

Review Request Body (PUT) --> JSON
{
  "text": "Amazing stay!",
  "rating": 7
}

Review Response Body (PUT) --> JSON
{
    "error": "Rating must be between 1 and 5"
}
#####################################################

Review Response Body (GET)   --> JSON

[
    {
        "id": "db28f79f-4961-4e61-a881-d132cc6c92e8",
        "text": "Great place to stay!",
        "rating": 5
    },
    {
        "id": "22472d07-9651-42f7-b09b-82e9eb761481",
        "text": "Great place to stay!",
        "rating": 5
    },
    {
        "id": "b82c9285-4aee-4b86-a593-0c2343ed4e0b",
        "text": "Great place to stay!",
        "rating": 5
    }
]

Review Response Body (DELETE)
{
    "message": "Review deleted successfully"
}

Implementation Notes:

- Facade Pattern: The HBnBFacade coordinates the lookup of User and Place objects before instantiating a Review.
- Error Handling: Implemented specific checks for 404 Not Found when a review, user, or place does not exist in the repository.
- Repository Integration: The InMemoryRepository was updated with a delete method to support the removal of review records.