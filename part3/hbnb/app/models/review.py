from app import db
from app.models.baseclass import BaseModel

class Review(BaseModel):
    __tablename__ = "reviews"

    id = db.Column(db.Integer, primary_key=True)
    text = db.Column(db.String(2048), nullable=False)
    rating = db.Column(db.Integer, nullable=False)

    def to_dict(self):
        return {
            "id": self.id,
            "text": self.text,
            "rating": self.rating,
        }
