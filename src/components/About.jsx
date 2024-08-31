// src/components/About.jsx
import React from 'react';
import './About.css'; // Import the CSS file for styling

const About = () => {
  return (
    <div className="container">
      <h2 className="heading">About Us</h2>
      <p className="paragraph">
        Welcome to HackMatch, your go-to platform for connecting with like-minded individuals and building successful teams for hackathons.
      </p>
      <p className="paragraph">
        Our Mission: We aim to bridge the gap between individuals looking to participate in hackathons and teams seeking additional members. Whether you're an individual eager to join a hackathon but unsure how to find the right team, or a team in need of specific skills to complete your roster, we're here to help.
      </p>
      <p className="paragraph subheading">
        What We Offer:
      </p>
      <ul className="list">
        <li><strong>Team Matching:</strong> If you're a solo participant, our platform allows you to find and join teams that match your skills and interests. Customize your search based on your technical expertise, project interests, and personal preferences to find the perfect fit.</li>
        <li><strong>Team Expansion:</strong> For teams seeking additional members, our platform enables you to search for individuals with the specific skills and experience you need. Easily connect with potential team members who can help you achieve your hackathon goals.</li>
        <li><strong>Community Chat:</strong> Engage with our vibrant community through our chat feature. Discuss ideas, seek advice, and connect with other participants to form teams and collaborate on projects.</li>
      </ul>
      <p className="paragraph subheading">
        Why Choose Us:
      </p>
      <ul className="list">
        <li><strong>Tailored Connections:</strong> Our advanced matching algorithms ensure that you connect with individuals and teams that best align with your skills and interests.</li>
        <li><strong>Inclusive Environment:</strong> We provide a supportive space for individuals who may be shy or less social, making it easier for everyone to participate in hackathons.</li>
        <li><strong>Efficient Team Building:</strong> Quickly find and recruit team members or join a team with the right expertise, enhancing your hackathon experience and increasing your chances of success.</li>
      </ul>
      <p className="paragraph">
        Join HackMatch today and take the first step towards a productive and enjoyable hackathon experience.
      </p>
    </div>
  );
};

export default About;
