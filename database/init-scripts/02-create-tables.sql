-- Connect to kahf database
\c kahf

-- Create books table
CREATE TABLE IF NOT EXISTS books (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    author VARCHAR(255),
    description TEXT,
    filepath VARCHAR(500) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE
);

-- Create indexes on books
CREATE INDEX IF NOT EXISTS idx_books_title ON books(title);

-- Create purchases table (DRM!) - Using Auth0 user_id as string
CREATE TABLE IF NOT EXISTS purchases (
    id SERIAL PRIMARY KEY,
    auth0_user_id VARCHAR(255) NOT NULL,  -- e.g., "auth0|123456" or "google-oauth2|789"
    book_id INTEGER NOT NULL,
    purchase_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_purchase_book FOREIGN KEY (book_id) 
        REFERENCES books(id) ON DELETE CASCADE,
    
    CONSTRAINT unique_user_book_purchase UNIQUE (auth0_user_id, book_id)
);

-- Create indexes on purchases for fast DRM checks
CREATE INDEX IF NOT EXISTS idx_purchases_auth0_user_id ON purchases(auth0_user_id);
CREATE INDEX IF NOT EXISTS idx_purchases_book_id ON purchases(book_id);
CREATE INDEX IF NOT EXISTS idx_purchases_user_book ON purchases(auth0_user_id, book_id);

-- Insert sample books
INSERT INTO books (id, title, author, description, filepath) VALUES
    (1, 'The Secret Garden', 'Frances Hodgson Burnett', 'A classic tale of transformation and healing.', '1.pdf'),
    (2, 'Journey to the Center of the Earth', 'Jules Verne', 'An adventure into the unknown depths.', '2.pdf')
ON CONFLICT (id) DO NOTHING;

-- Insert sample purchase with Auth0 user ID
-- Replace 'auth0|12345' with a real Auth0 user ID from your system
INSERT INTO purchases (auth0_user_id, book_id) VALUES 
    ('auth0|12345', 1)  -- This user owns Book 1
ON CONFLICT (auth0_user_id, book_id) DO NOTHING;

-- Verify tables were created
SELECT 'Books table created' AS status;
SELECT 'Purchases table created (OAuth version)' AS status;
SELECT 'Sample data: User auth0|12345 owns Book 1' AS status;