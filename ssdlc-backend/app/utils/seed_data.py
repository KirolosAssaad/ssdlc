"""
Database seeding utility to populate the database with sample data
"""

from datetime import datetime, date
from app import db
from app.models.user import User
from app.models.book import Book
from app.models.purchase import Purchase

def seed_database():
    """Seed the database with sample data"""
    
    # Clear existing data
    Purchase.query.delete()
    Book.query.delete()
    User.query.delete()
    
    # Create sample users
    users_data = [
        {
            'email': 'john.doe@example.com',
            'password': 'password123',
            'first_name': 'John',
            'last_name': 'Doe'
        },
        {
            'email': 'jane.smith@example.com',
            'password': 'password123',
            'first_name': 'Jane',
            'last_name': 'Smith'
        },
        {
            'email': 'admin@bookvault.com',
            'password': 'admin123',
            'first_name': 'Admin',
            'last_name': 'User'
        }
    ]
    
    users = []
    for user_data in users_data:
        user = User(**user_data)
        users.append(user)
        db.session.add(user)
    
    # Create sample books
    books_data = [
        {
            'title': 'The Digital Revolution',
            'author': 'Sarah Johnson',
            'description': 'A comprehensive guide to understanding how technology is reshaping our world.',
            'price': 19.99,
            'cover_image': 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=300&h=400&fit=crop',
            'genre': 'Technology',
            'rating': 4.5,
            'rating_count': 127,
            'published_date': date(2024, 1, 15)
        },
        {
            'title': 'Mindful Living',
            'author': 'Dr. Michael Chen',
            'description': 'Discover the art of mindfulness and how it can transform your daily life.',
            'price': 14.99,
            'cover_image': 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=300&h=400&fit=crop',
            'genre': 'Self-Help',
            'rating': 4.8,
            'rating_count': 203,
            'published_date': date(2024, 2, 20)
        },
        {
            'title': 'The Art of Cooking',
            'author': 'Isabella Rodriguez',
            'description': 'Master the fundamentals of cooking with this beautifully illustrated cookbook.',
            'price': 24.99,
            'cover_image': 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=300&h=400&fit=crop',
            'genre': 'Cooking',
            'rating': 4.7,
            'rating_count': 89,
            'published_date': date(2024, 3, 10)
        },
        {
            'title': 'Space Exploration',
            'author': 'Dr. Robert Kim',
            'description': 'Journey through the cosmos and explore the latest discoveries in space science.',
            'price': 22.99,
            'cover_image': 'https://images.unsplash.com/photo-1446776653964-20c1d3a81b06?w=300&h=400&fit=crop',
            'genre': 'Science',
            'rating': 4.6,
            'rating_count': 156,
            'published_date': date(2024, 4, 5)
        },
        {
            'title': 'Financial Freedom',
            'author': 'Amanda Thompson',
            'description': 'Learn practical strategies for building wealth and achieving financial independence.',
            'price': 18.99,
            'cover_image': 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=300&h=400&fit=crop',
            'genre': 'Finance',
            'rating': 4.4,
            'rating_count': 234,
            'published_date': date(2024, 5, 12)
        },
        {
            'title': 'The Creative Mind',
            'author': 'David Wilson',
            'description': 'Unlock your creative potential with proven techniques and exercises.',
            'price': 16.99,
            'cover_image': 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=400&fit=crop',
            'genre': 'Creativity',
            'rating': 4.3,
            'rating_count': 98,
            'published_date': date(2024, 6, 18)
        },
        {
            'title': 'Python Programming Mastery',
            'author': 'Alex Chen',
            'description': 'From beginner to expert: master Python programming with practical examples.',
            'price': 29.99,
            'cover_image': 'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?w=300&h=400&fit=crop',
            'genre': 'Technology',
            'rating': 4.9,
            'rating_count': 312,
            'published_date': date(2024, 7, 1)
        },
        {
            'title': 'The History of Art',
            'author': 'Maria Gonzalez',
            'description': 'A comprehensive journey through the evolution of artistic expression.',
            'price': 21.99,
            'cover_image': 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=300&h=400&fit=crop',
            'genre': 'Art',
            'rating': 4.2,
            'rating_count': 67,
            'published_date': date(2024, 8, 15)
        }
    ]
    
    books = []
    for book_data in books_data:
        book = Book(**book_data)
        books.append(book)
        db.session.add(book)
    
    # Commit users and books first to get their IDs
    db.session.commit()
    
    # Create sample purchases
    # John Doe purchases a few books
    john = users[0]
    john.register_device('device_123', 'John\'s MacBook Pro')
    
    purchase1 = Purchase(
        user_id=john.id,
        book_id=books[0].id,  # The Digital Revolution
        purchase_price=books[0].price,
        payment_method='credit_card',
        status='completed'
    )
    
    purchase2 = Purchase(
        user_id=john.id,
        book_id=books[6].id,  # Python Programming Mastery
        purchase_price=books[6].price,
        payment_method='credit_card',
        status='completed'
    )
    
    db.session.add(purchase1)
    db.session.add(purchase2)
    
    # Jane Smith purchases some books
    jane = users[1]
    jane.register_device('device_456', 'Jane\'s iPad')
    
    purchase3 = Purchase(
        user_id=jane.id,
        book_id=books[1].id,  # Mindful Living
        purchase_price=books[1].price,
        payment_method='paypal',
        status='completed'
    )
    
    purchase4 = Purchase(
        user_id=jane.id,
        book_id=books[2].id,  # The Art of Cooking
        purchase_price=books[2].price,
        payment_method='credit_card',
        status='completed'
    )
    
    db.session.add(purchase3)
    db.session.add(purchase4)
    
    # Commit all changes
    db.session.commit()
    
    print(f"Created {len(users)} users")
    print(f"Created {len(books)} books")
    print("Created sample purchases")
    print("Database seeded successfully!")