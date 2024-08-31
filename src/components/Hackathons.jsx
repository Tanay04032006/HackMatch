// src/components/Hackathons.jsx
import React, { useState, useEffect } from 'react';
import HackathonCard from './HackathonCard';

const Hackathons = () => {
  const [hackathons, setHackathons] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchHackathons = async () => {
      try {
        const response = await fetch('/api/hackathons');

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        setHackathons(data);
      } catch (error) {
        console.error('Error fetching hackathons:', error.message);
        setError(error.message); // Set error message to display on the UI
      }
    };

    fetchHackathons();
  }, []);

  return (
    <div>
      <h2>Hackathons</h2>
      <div>
        {error ? (
          <p>Error: {error}</p>
        ) : hackathons.length > 0 ? (
          hackathons.map((hackathon) => (
            <HackathonCard key={hackathon._id} hackathon={hackathon} />
          ))
        ) : (
          <p>No hackathons available.</p>
        )}
      </div>
    </div>
  );
};

export default Hackathons;
