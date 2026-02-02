from app.models import Basemodel

class Review(Basemodel):
    def __init__(self, text, rating, place, user):
        super().__init__()
        self.text = text
        self.rating = rating
        self.place = place     # Reference  to the place
        self.user = user       # Reference to the user


