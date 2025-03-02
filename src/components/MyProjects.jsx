import React from 'react'
import Navbar from './Navbar'
import FirstSectionHome from './FirstSectionHome'
import Projectsuggestions from './Projectsuggestions'
import { useProfile } from '../context/ProfileContext'

function MyProjects() {
  const { userRole } = useProfile();

  return (
    <div>
      <Navbar/>
      <FirstSectionHome/>
      <Projectsuggestions/>
      {userRole === 'developer' ? (
        <div>Developer Projects View</div>
      ) : (
        <div>HR Projects View</div>
      )}
    </div>
  )
}

export default MyProjects