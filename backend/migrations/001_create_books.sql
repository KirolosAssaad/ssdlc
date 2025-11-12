-- Enable required extension
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Create books table
CREATE TABLE books (
    id SERIAL PRIMARY KEY,
    title VARCHAR(500) NOT NULL,
    author VARCHAR(255) NOT NULL,
    description TEXT,
    isbn VARCHAR(20) UNIQUE NOT NULL,
    price FLOAT NOT NULL,
    rating FLOAT DEFAULT 0.0,
    publication_date TIMESTAMP WITH TIME ZONE NOT NULL,
    is_available BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    search_vector TSVECTOR
);

-- Create indexes
CREATE INDEX ix_books_title ON books(title);
CREATE INDEX ix_books_author ON books(author);
CREATE INDEX ix_books_is_available ON books(is_available);
CREATE INDEX ix_books_search_vector ON books USING GIN(search_vector);
CREATE INDEX ix_books_title_trgm ON books USING GIN(title gin_trgm_ops);
CREATE INDEX ix_books_author_trgm ON books USING GIN(author gin_trgm_ops);
CREATE INDEX ix_books_title_author ON books(title, author);

-- Create trigger for full-text search vector update
CREATE TRIGGER books_search_vector_update
BEFORE INSERT OR UPDATE ON books
FOR EACH ROW EXECUTE FUNCTION
tsvector_update_trigger(search_vector, 'pg_catalog.english', title, author, description);

-- Create book_categories table
CREATE TABLE book_categories (
    id SERIAL PRIMARY KEY,
    book_id INTEGER NOT NULL REFERENCES books(id) ON DELETE CASCADE,
    category VARCHAR(100) NOT NULL
);

CREATE INDEX ix_book_id_category ON book_categories(book_id, category);

-- Insert sample data
INSERT INTO books (title, author, description, isbn, price, publication_date, is_available)
VALUES 
('The Great Gatsby', 'F. Scott Fitzgerald', 'A novel of wealth and class', '978-0743273565', 9.99, '1925-04-10'::timestamp with time zone, true),
('1984', 'George Orwell', 'Dystopian novel set in totalitarian state', '978-0451524935', 13.99, '1949-06-08'::timestamp with time zone, true),
('To Kill a Mockingbird', 'Harper Lee', 'Classic American novel about racial injustice', '978-0061120084', 14.99, '1960-07-11'::timestamp with time zone, true);