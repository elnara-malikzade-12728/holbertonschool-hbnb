from app.models import Basemodel
from flask_bcrypt import generate_password_hash, check_password_hash

class User(Basemodel):
    def __init__(self, first_name, last_name, password, email, is_admin=False):
        super().__init__()
        self.first_name = first_name
        self.last_name = last_name
        self.password = password
        self.email = email
        self.is_admin = is_admin

    @property
    def first_name(self):
        return self._first_name

    @first_name.setter
    def first_name(self, value):
        if not value or len(value.strip()) == 0:
            raise ValueError("First name is required")
        self._first_name = value

    def hash_password(self, password):
        """Hashes the password before storin it"""
        self.password = generate_password_hash(password).decode('utf-8')

    def verify_password(self, password):
        """Verifies if the provided password matches the hashed password"""
        return check_password_hash(self.password, password)

    @property
    def email(self):
        return self._email

    @email.setter
    def email(self, value):
        # Very basic email check
        if "@" not in value:
            raise ValueError("Invalid email format")
        self._email = value