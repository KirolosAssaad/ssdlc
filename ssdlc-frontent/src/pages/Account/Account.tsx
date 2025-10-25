import React, { useState, useEffect } from 'react';
import { User, Book, Download, Settings, Smartphone, Loader2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { bookService, userService } from '../../api';
import BookCard from '../../components/BookCard/BookCard';
import { Book as BookType } from '../../types';

const Account: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'profile' | 'library' | 'settings'>('profile');
  const [purchasedBooks, setPurchasedBooks] = useState<BookType[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user && activeTab === 'library') {
      loadPurchasedBooks();
    }
  }, [user, activeTab]);

  const loadPurchasedBooks = async () => {
    try {
      setLoading(true);
      const books = await bookService.getUserPurchasedBooks();
      setPurchasedBooks(books);
    } catch (error) {
      console.error('Error loading purchased books:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterDevice = async () => {
    try {
      const deviceId = navigator.userAgent + Date.now();
      const deviceName = `${navigator.platform} - ${new Date().toLocaleDateString()}`;
      
      await userService.registerDevice({
        deviceId,
        deviceName,
      });
      
      alert('Device registered successfully!');
      // Refresh user data
      window.location.reload();
    } catch (error) {
      console.error('Error registering device:', error);
      alert('Failed to register device. Please try again.');
    }
  };

  const handleUnregisterDevice = async () => {
    if (confirm('Are you sure you want to unregister this device? You will lose access to downloaded books.')) {
      try {
        await userService.unregisterDevice();
        alert('Device unregistered successfully!');
        // Refresh user data
        window.location.reload();
      } catch (error) {
        console.error('Error unregistering device:', error);
        alert('Failed to unregister device. Please try again.');
      }
    }
  };

  if (!user) {
    return (
      <div className="container" style={{ textAlign: 'center', padding: '3rem 0' }}>
        <p>Please log in to access your account.</p>
      </div>
    );
  }

  const tabs = [
    { id: 'profile' as const, label: 'Profile', icon: User },
    { id: 'library' as const, label: 'My Library', icon: Book },
    { id: 'settings' as const, label: 'Settings', icon: Settings },
  ];

  return (
    <div className="container">
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ 
          color: 'var(--color-dark-brown)',
          marginBottom: '0.5rem'
        }}>
          My Account
        </h1>
        <p style={{ color: '#666' }}>
          Manage your profile, library, and account settings
        </p>
      </div>

      {/* Tab Navigation */}
      <div style={{ 
        borderBottom: '2px solid #eee',
        marginBottom: '2rem'
      }}>
        <div style={{ display: 'flex', gap: '2rem' }}>
          {tabs.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  background: 'none',
                  border: 'none',
                  padding: '1rem 0',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  color: activeTab === tab.id ? 'var(--color-medium-brown)' : '#666',
                  borderBottom: activeTab === tab.id ? '2px solid var(--color-medium-brown)' : '2px solid transparent',
                  fontWeight: activeTab === tab.id ? '600' : '400',
                  fontSize: '1rem'
                }}
              >
                <Icon size={18} />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'profile' && (
        <div className="grid grid-2">
          <div className="card">
            <h3 style={{ 
              marginBottom: '1.5rem',
              color: 'var(--color-dark-brown)'
            }}>
              Personal Information
            </h3>
            
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ 
                display: 'block',
                fontWeight: '600',
                marginBottom: '0.5rem',
                color: 'var(--color-dark-brown)'
              }}>
                Full Name
              </label>
              <p style={{ color: '#666' }}>
                {user.firstName} {user.lastName}
              </p>
            </div>
            
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ 
                display: 'block',
                fontWeight: '600',
                marginBottom: '0.5rem',
                color: 'var(--color-dark-brown)'
              }}>
                Email Address
              </label>
              <p style={{ color: '#666' }}>
                {user.email}
              </p>
            </div>
            
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ 
                display: 'block',
                fontWeight: '600',
                marginBottom: '0.5rem',
                color: 'var(--color-dark-brown)'
              }}>
                Member Since
              </label>
              <p style={{ color: '#666' }}>
                {new Date(user.createdAt).toLocaleDateString()}
              </p>
            </div>
            
            <button className="btn btn-primary">
              Edit Profile
            </button>
          </div>

          <div className="card">
            <h3 style={{ 
              marginBottom: '1.5rem',
              color: 'var(--color-dark-brown)'
            }}>
              Account Statistics
            </h3>
            
            <div style={{ 
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '1rem',
              marginBottom: '1.5rem'
            }}>
              <div style={{ 
                textAlign: 'center',
                padding: '1rem',
                backgroundColor: 'var(--color-cream)',
                borderRadius: 'var(--border-radius)'
              }}>
                <div style={{ 
                  fontSize: '2rem',
                  fontWeight: 'bold',
                  color: 'var(--color-medium-brown)'
                }}>
                  {user.purchasedBooks.length}
                </div>
                <div style={{ color: '#666', fontSize: '0.9rem' }}>
                  Books Owned
                </div>
              </div>
              
              <div style={{ 
                textAlign: 'center',
                padding: '1rem',
                backgroundColor: 'var(--color-cream)',
                borderRadius: 'var(--border-radius)'
              }}>
                <div style={{ 
                  fontSize: '2rem',
                  fontWeight: 'bold',
                  color: 'var(--color-medium-brown)'
                }}>
                  {user.registeredDevice ? '1' : '0'}
                </div>
                <div style={{ color: '#666', fontSize: '0.9rem' }}>
                  Registered Device
                </div>
              </div>
            </div>
            
            <div style={{ 
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '1rem',
              backgroundColor: user.registeredDevice ? '#f0f9ff' : '#fef3c7',
              borderRadius: 'var(--border-radius)',
              border: `1px solid ${user.registeredDevice ? '#0ea5e9' : '#f59e0b'}`
            }}>
              <Smartphone size={20} color={user.registeredDevice ? '#0ea5e9' : '#f59e0b'} />
              <div>
                <div style={{ fontWeight: '600', fontSize: '0.9rem' }}>
                  {user.registeredDevice ? 'Device Registered' : 'No Device Registered'}
                </div>
                <div style={{ fontSize: '0.8rem', color: '#666' }}>
                  {user.registeredDevice 
                    ? 'You can download books on this device' 
                    : 'Register a device to download books'
                  }
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'library' && (
        <div>
          <div style={{ 
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '2rem'
          }}>
            <h3 style={{ color: 'var(--color-dark-brown)' }}>
              My Library ({purchasedBooks.length} books)
            </h3>
          </div>
          
          {loading ? (
            <div style={{ 
              display: 'flex', 
              justifyContent: 'center', 
              alignItems: 'center',
              padding: '3rem',
              color: 'var(--color-medium-brown)'
            }}>
              <Loader2 size={32} className="animate-spin" style={{ marginRight: '0.5rem' }} />
              Loading your library...
            </div>
          ) : purchasedBooks.length > 0 ? (
            <div className="grid grid-4">
              {purchasedBooks.map(book => (
                <BookCard 
                  key={book.id} 
                  book={book} 
                  isPurchased={true}
                />
              ))}
            </div>
          ) : (
            <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
              <Book size={48} color="#ccc" style={{ marginBottom: '1rem' }} />
              <h4 style={{ marginBottom: '0.5rem', color: 'var(--color-dark-brown)' }}>
                No Books Yet
              </h4>
              <p style={{ color: '#666', marginBottom: '1.5rem' }}>
                Start building your digital library by purchasing some books.
              </p>
              <a href="/" className="btn btn-primary">
                Browse Books
              </a>
            </div>
          )}
        </div>
      )}

      {activeTab === 'settings' && (
        <div className="grid grid-2">
          <div className="card">
            <h3 style={{ 
              marginBottom: '1.5rem',
              color: 'var(--color-dark-brown)'
            }}>
              Device Management
            </h3>
            
            <p style={{ 
              color: '#666',
              marginBottom: '1.5rem',
              lineHeight: '1.6'
            }}>
              BookVault allows you to register one device for downloading and reading your purchased books offline.
            </p>
            
            {user.registeredDevice ? (
              <div>
                <div style={{ 
                  padding: '1rem',
                  backgroundColor: '#f0f9ff',
                  borderRadius: 'var(--border-radius)',
                  marginBottom: '1rem',
                  border: '1px solid #0ea5e9'
                }}>
                  <div style={{ fontWeight: '600', marginBottom: '0.5rem' }}>
                    Current Device: {user.registeredDevice}
                  </div>
                  <div style={{ fontSize: '0.9rem', color: '#666' }}>
                    Registered on {new Date().toLocaleDateString()}
                  </div>
                </div>
                <button 
                  className="btn btn-outline"
                  onClick={handleUnregisterDevice}
                >
                  Unregister Device
                </button>
              </div>
            ) : (
              <div>
                <button 
                  className="btn btn-primary"
                  onClick={handleRegisterDevice}
                >
                  Register This Device
                </button>
              </div>
            )}
          </div>

          <div className="card">
            <h3 style={{ 
              marginBottom: '1.5rem',
              color: 'var(--color-dark-brown)'
            }}>
              Account Security
            </h3>
            
            <div style={{ marginBottom: '1rem' }}>
              <button className="btn btn-secondary" style={{ width: '100%', marginBottom: '0.5rem' }}>
                Change Password
              </button>
            </div>
            
            <div style={{ marginBottom: '1rem' }}>
              <button className="btn btn-outline" style={{ width: '100%', marginBottom: '0.5rem' }}>
                Update Email Address
              </button>
            </div>
            
            <div style={{ 
              padding: '1rem',
              backgroundColor: '#fef2f2',
              borderRadius: 'var(--border-radius)',
              border: '1px solid #fca5a5',
              marginTop: '2rem'
            }}>
              <h4 style={{ color: '#dc2626', marginBottom: '0.5rem' }}>
                Danger Zone
              </h4>
              <p style={{ fontSize: '0.9rem', color: '#666', marginBottom: '1rem' }}>
                Once you delete your account, there is no going back. Please be certain.
              </p>
              <button 
                className="btn"
                style={{ 
                  backgroundColor: '#dc2626',
                  color: 'white',
                  fontSize: '0.9rem'
                }}
              >
                Delete Account
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Account;