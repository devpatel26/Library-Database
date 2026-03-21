import React from 'react';
import AccountInfo from '../components/AccountInfo';
import { dummyUsers } from '../data/dummy'; 

const AccountInfoPage = () => {
  const selectedUser = dummyUsers && dummyUsers.length > 0 ? dummyUsers[0] : null;

  return (
    <div className="account-page-container" style={{ maxWidth: '1000px', margin: '0 auto', padding: '40px 20px' }}>
      <header style={{ marginBottom: '30px' }}>
        <h1 style={{ fontSize: '2rem', color: '#2c3e50' }}>Library Account Dashboard</h1>
        <p style={{ color: '#7f8c8d' }}>View your profile details and track your borrowed items below.</p>
      </header>

      {}
      <AccountInfo userData={selectedUser} />
      
      <footer style={{ marginTop: '50px', fontSize: '0.8rem', color: '#bdc3c7', textAlign: 'center' }}>
        <p>© 2026 Library Database System - Group Project</p>
      </footer>
    </div>
  );
};

export default AccountInfoPage;

