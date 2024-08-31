// src/components/ProfileCard.jsx
import React from 'react';
import './ProfileCard.css'; // Import the CSS file for styling

const ProfileCard = ({ profile, onRequest }) => {
  return (
    <div className="profile-card">
      <h3>{profile.name}</h3>
      <p>Email: <a href={`mailto:${profile.email}`}>{profile.email}</a></p>
      <p>Skills: {profile.tags.join(', ')}</p>
      {profile.LinkedInURL && (
        <p>
          LinkedIn: <a href={profile.LinkedInURL} target="_blank" rel="noopener noreferrer">
            {profile.LinkedInURL}
          </a>
        </p>
      )}
      <button className="request-button" onClick={() => onRequest(profile.id)}>
        Invite
      </button>
    </div>
  );
};

export default ProfileCard;
