from app import db
from app.models.baseclass import BaseModel

# Association table
place_amenity = db.Table(
    "place_amenity",
    db.Column("place_id", db.Integer, db.ForeignKey("places.id"), primary_key=True),
    db.Column("amenity_id", db.Integer, db.ForeignKey("amenities.id"), primary_key=True),
)

class Place(BaseModel):
    __tablename__ = "places"

    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(100), nullable=False)
    description = db.Column(db.String(1024))
    price = db.Column(db.Float, nullable=False)
    latitude = db.Column(db.Float, nullable=False)
    longitude = db.Column(db.Float, nullable=False)

    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)

    owner = db.relationship(
        "User",
        back_populates="places",
        foreign_keys=[user_id]
    )

    reviews = db.relationship(
        "Review",
        backref="place",
        lazy="dynamic",
        cascade="all, delete-orphan"
    )

    amenities = db.relationship(
        "Amenity",
        secondary=place_amenity,
        back_populates="places"
    )

    def to_dict(self, include_owner=False, include_amenities=False, include_reviews=False):
        data = {
            "id": self.id,
            "title": self.title,
            "description": self.description,
            "price": self.price,
            "latitude": self.latitude,
            "longitude": self.longitude,
            "user_id": self.user_id,
        }

        if include_owner:
            data["owner"] = None if not self.owner else {
                "id": self.owner.id,
                "first_name": self.owner.first_name,
                "last_name": self.owner.last_name,
                "email": self.owner.email,
            }

        if include_amenities:
            data["amenities"] = [
                {"id": a.id, "name": a.name} for a in (self.amenities or [])
            ]

        if include_reviews:
            all_reviews = self.reviews.all()
            data["reviews"] = [
                {
                    "id": r.id,
                    "text": r.text,
                    "rating": r.rating,
                    "user_id": r.user_id,
                    "user_name": f"{r.user.first_name} {r.user.last_name}"
                }
                for r in all_reviews
            ]
        return data