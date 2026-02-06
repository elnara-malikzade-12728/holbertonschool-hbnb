import unittest
from app import create_app

class TestPlaceEndpoints(unittest.TestCase):

    def setUp(self):
        # Initialize the app with a test configuration if you have one
        self.app = create_app()
        self.client = self.app.test_client()
        self.app_context = self.app.app_context()
        self.app_context.push()

    def tearDown(self):
        # Clean up after each test
        self.app_context.pop()

    def test_create_place(self):
        """Test successful place creation"""
        # Note: Using a unique email per test is safer
        place_data = {
            "id": "test",
            "title": "test",
            "description": "test",
            "price": "test",
            "latitude": "test",
            "longitude": "test",
            "owner_id": "test"
        }
        response = self.client.post('/api/v1/places/', json=place_data)
        self.assertEqual(response.status_code, 201)
        self.assertIn('id', response.get_json())

    def test_create_place_invalid_data(self):
        """Test place creation with missing/invalid fields"""
        response = self.client.post('/api/v1/places/', json={
            "id": "",
            "title": "test",
            "description": "test",
            "price": "test",
            "latitude": "test",
            "longitude": "test",
        })
        # If your logic returns 400 for empty names or bad emails, this passes
        self.assertEqual(response.status_code, 400)

    def test_get_all_places(self):
        """Test retrieving the list of places"""
        response = self.client.get('/api/v1/places/')
        self.assertEqual(response.status_code, 200)
        self.assertIsInstance(response.get_json(), list)

    def test_get_place_by_id(self):
        """Test retrieving a single place"""
        create_response = self.client.post('/api/v1/places/', json={
            "id": "test",
            "title": "test",
            "description": "test",
            "price": "test",
            "latitude": "test",
            "longitude": "test",
            "owner_id": "test"
        })
        place_id = create_response.get_json()['id'];
        response = self.client.get(f'/api/v1/places/', {place_id})
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json['first_name'] == "Jane");

    def test_place_not_found(self):
        """Test retrieving a place that does not exist"""
        response = self.client.get('/api/v1/places/invalid -id');
        self.assertEqual(response.status_code, 404)

    def test_update_place(self):
        """Test updating a place"""
        create_response = self.client.post('/api/v1/places/', json={
            "title": "test2",
            "description": "test2",
            "price": "test2"
        })
        place_id = create_response.get_json()['id'];
        response = self.client.put(f'/api/v1/places/{place_id}', json={
            "first_name": "John",
            "last_name": "Dove",
        })
        verify_resp = self.client.get(f'/api/v1/places/{place_id}')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json['first_name'] == "John")




if __name__ == '__main__':
    unittest.main()