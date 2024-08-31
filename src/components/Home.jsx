// src/components/Home.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import HackathonCard from './HackathonCard';
import './Home.css'; // Import the CSS file for styling

const Home = () => {
  const [hackathons, setHackathons] = useState([]);

  useEffect(() => {
    axios.get('http://localhost:5000/api/hackathons')
      .then(response => {
        setHackathons(response.data);
      })
      .catch(error => console.error('Error fetching hackathons:', error));
  }, []);

  return (
    <div className="container">
      <h1>Welcome to the Hackathon Portal</h1>
      <h2>Upcoming Hackathons</h2>
      <div className="hackathon-container">
        {hackathons.length > 0 ? (
          hackathons.map(hackathon => (
            <div className="hackathon-card" key={hackathon._id}>
              <h3>{hackathon.name}</h3>
              <p>{hackathon.description}</p>
              <a href={hackathon.link} target="_blank" rel="noopener noreferrer">Learn More</a>
            </div>
          ))
        ) : (
          <p>No hackathons available.</p>
        )}
      </div>
    </div>
  );
};

export default Home;
