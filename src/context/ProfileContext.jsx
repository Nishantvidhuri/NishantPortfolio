import React, { createContext, useState, useContext } from 'react';

const ProfileContext = createContext();

export const useProfile = () => useContext(ProfileContext);

export const ProfileProvider = ({ children }) => {
  const [userRole, setUserRole] = useState('');

  const updateUserRole = (role) => {
    setUserRole(role);
  };

  return (
    <ProfileContext.Provider value={{ userRole, updateUserRole }}>
      {children}
    </ProfileContext.Provider>
  );
}; 