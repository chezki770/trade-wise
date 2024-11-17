// src/Pages/Learn.js
import React from "react";
import "./Learn.css"; // Importing the CSS file for styling

const Learn = () => {
  return (
    <div>
      <h1>Learn Page</h1>
      <div className="video-gallery">
        {/* You can replace videoID1 and videoID2 with actual YouTube video IDs */}
        <iframe
          width="560"
          height="315"
          src="https://www.youtube.com/embed/videoID1"
          title="YouTube video player"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        ></iframe>

        <iframe
          width="560"
          height="315"
          src="https://www.youtube.com/embed/videoID2"
          title="YouTube video player"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        ></iframe>

        {/* Add more videos as needed */}
      </div>
    </div>
  );
};

export default Learn;
