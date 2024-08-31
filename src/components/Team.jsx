// src/components/Team.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ProfileCard from './ProfileCard';
import './Team.css';

const Team = () => {
  const [profiles, setProfiles] = useState([]);
  const [filteredProfiles, setFilteredProfiles] = useState([]);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    axios.get('http://localhost:5000/api/profiles')
      .then(response => {
        setProfiles(response.data);
        setFilteredProfiles(response.data);
      })
      .catch(error => console.error('Error fetching profiles:', error));
  }, []);

  const handleFilterChange = (e) => {
    const filterValue = e.target.value.toLowerCase();
    setFilter(filterValue);

    const filtered = profiles.filter(profile =>
      profile.tags.some(tag => tag.toLowerCase().includes(filterValue))
    );
    setFilteredProfiles(filtered);
  };

  return (
    <div className="container">
      <h2>Profiles</h2>
      <input
        type="text"
        className="search-bar"
        placeholder="Filter by tag"
        value={filter}
        onChange={handleFilterChange}
      />
      <div className="profile-list">
        {filteredProfiles.length > 0 ? (
          filteredProfiles.map(profile => (
            <ProfileCard key={profile._id} profile={profile} />
          ))
        ) : (
          <p>No profiles found.</p>
        )}
      </div>
    </div>
  );
};

export default Team;
