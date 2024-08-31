// src/components/HackathonCard.jsx
import React from 'react';
import './HackathonCard.css'; // Import the CSS file

const HackathonCard = ({ hackathon }) => {
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <div className="card">
      <h3>{hackathon.name}</h3>
      <p className="description">Description:</p>
      <p className="description-content">{hackathon.description}</p>
      <p className="date"><strong>Date:</strong> {formatDate(hackathon.date)}</p>
      <p className="location"><strong>Location:</strong> {hackathon.location}</p>
    </div>
  );
};

export default HackathonCard;