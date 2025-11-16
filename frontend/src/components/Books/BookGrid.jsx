import React from 'react';
import BookCard from './BookCard';
import { BookOpen } from 'lucide-react';

const BookGrid = ({ 
  books = [], 
  loading = false, 
  ownedBooks = [], 
  showPurchaseDate = false,
  emptyMessage = "No books found",
  emptySubMessage = "Try adjusting your search or browse our catalog"
}) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {[...Array(8)].map((_, index) => (
          <div key={index} className="card animate-pulse">
            <div className="h-64 bg-brown/10"></div>
            <div className="p-6 space-y-3">
              <div className="h-4 bg-brown/10 rounded w-3/4"></div>
              <div className="h-3 bg-brown/10 rounded w-1/2"></div>
              <div className="h-3 bg-brown/10 rounded w-full"></div>
              <div className="h-3 bg-brown/10 rounded w-2/3"></div>
              <div className="h-10 bg-brown/10 rounded"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!books || books.length === 0) {
    return (
      <div className="text-center py-16">
        <BookOpen className="h-16 w-16 text-brown/40 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-dark-brown mb-2">
          {emptyMessage}
        </h3>
        <p className="text-dark-brown/70">
          {emptySubMessage}
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {books.map((book) => {
        const isOwned = ownedBooks.some(ownedBook => ownedBook.id === book.id);
        
        return (
          <BookCard
            key={book.id}
            book={book}
            owned={isOwned}
            showPurchaseDate={showPurchaseDate}
          />
        );
      })}
    </div>
  );
};

export default BookGrid;