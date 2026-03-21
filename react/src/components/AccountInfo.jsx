import React from 'react';
const AccountInfo = ({ userData }) => {
  if (!userData) return <p>Loading profile...</p>;

  return (
    <div className="profile-container" style={{ padding: '20px', border: '1px solid #ddd', borderRadius: '12px', backgroundColor: '#f9f9f9' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>User Profile</h2>
        <button 
          onClick={() => alert('Edit Profile functionality coming soon!')}
          style={{ padding: '8px 16px', cursor: 'pointer', borderRadius: '5px', border: '1px solid #007bff', backgroundColor: '#fff', color: '#007bff' }}
        >
          Edit Profile
        </button>
      </div>

      <div className="profile-info" style={{ marginBottom: '30px', lineHeight: '1.6' }}>
        {}
        <p><strong>Name:</strong> {userData?.firstName} {userData?.lastName}</p>
        <p><strong>Email:</strong> {userData?.email}</p>
        <p><strong>Member ID:</strong> {userData?.memberId || 'N/A'}</p>
        <p><strong>Status:</strong> <span style={{ color: 'green' }}>Active</span></p>
      </div>

      <hr />

      <div className="borrowed-books-section" style={{ marginTop: '20px' }}>
        <h3>Currently Borrowed Books</h3>
        {userData?.borrowedBooks && userData.borrowedBooks.length > 0 ? (
          <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px' }}>
            <thead>
              <tr style={{ backgroundColor: '#eee', textAlign: 'left' }}>
                <th style={{ padding: '10px', borderBottom: '1px solid #ccc' }}>Title</th>
                <th style={{ padding: '10px', borderBottom: '1px solid #ccc' }}>Due Date</th>
              </tr>
            </thead>
            <tbody>
              {userData.borrowedBooks.map((book, index) => (
                <tr key={index}>
                  <td style={{ padding: '10px', borderBottom: '1px solid #eee' }}>{book.title}</td>
                  <td style={{ padding: '10px', borderBottom: '1px solid #eee', color: 'red' }}>{book.dueDate}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No books currently checked out.</p>
        )}
      </div>
    </div>
  );
};

export default AccountInfo;

