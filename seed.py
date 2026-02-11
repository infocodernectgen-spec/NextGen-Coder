"""
Seed initial data to the database
"""
import sys
import os

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from backend.app import create_app
from backend.models import db, Product, User

def seed_data():
    """Add sample data to database"""
    
    # Sample products
    products = [
        Product(
            name="Chocolate Cake",
            description="Rich and moist chocolate cake with ganache",
            price=35.99,
            category="Cakes",
            stock=20,
            image_url="/assets/images/chocolate-cake.jpg"
        ),
        Product(
            name="Vanilla Cupcakes",
            description="Classic vanilla cupcakes with cream frosting",
            price=24.99,
            category="Cupcakes",
            stock=30,
            image_url="/assets/images/cupcakes.jpg"
        ),
        Product(
            name="Strawberry Cheesecake",
            description="Creamy cheesecake with fresh strawberry topping",
            price=45.99,
            category="Cakes",
            stock=15,
            image_url="/assets/images/cheesecake.jpg"
        ),
        Product(
            name="Macarons (Assorted)",
            description="Colorful French macarons (12 pieces)",
            price=18.99,
            category="Pastries",
            stock=25,
            image_url="/assets/images/macarons.jpg"
        ),
        Product(
            name="Custom Cake",
            description="Design your own custom cake",
            price=49.99,
            category="Custom",
            stock=10,
            image_url="/assets/images/custom-cake.jpg"
        ),
        Product(
            name="Croissants",
            description="Buttery French croissants (6 pieces)",
            price=12.99,
            category="Pastries",
            stock=40,
            image_url="/assets/images/croissants.jpg"
        ),
    ]
    
    # Add products
    for product in products:
        if not Product.query.filter_by(name=product.name).first():
            db.session.add(product)
    
    # Add admin user
    admin = User.query.filter_by(username='admin').first()
    if not admin:
        admin = User(
            username='admin',
            email='admin@toady.com',
            first_name='Admin',
            last_name='User',
            is_admin=True
        )
        admin.set_password('admin123')
        db.session.add(admin)
    
    # Add demo user
    demo = User.query.filter_by(username='demo').first()
    if not demo:
        demo = User(
            username='demo',
            email='demo@toady.com',
            first_name='Demo',
            last_name='User',
            is_admin=False
        )
        demo.set_password('demo123')
        db.session.add(demo)
    
    db.session.commit()
    print("Database seeded successfully!")

if __name__ == '__main__':
    app = create_app()
    with app.app_context():
        seed_data()
