
import React from "react";
import "./style.css"; // Importing the CSS file for styling
// src/Pages/Learn.js
import React from "react";
import "./Learn.css"; // Importing the CSS file for styling

const Learn = () => {
  return (
    <div>
      <h1>Learn Page</h1>
      <div className="video-gallery">
<<<<<<< HEAD
        {/* First video */}
        <iframe
          width="560"
          height="315"
          src="https://www.youtube.com/embed/i5OZQQWj5-I?si=32KziB-KPjf0XzDk&amp;controls=0"
          title="YouTube video player"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          referrerPolicy="strict-origin-when-cross-origin"
          allowFullScreen
        ></iframe>

        {/* Second video */}
        <iframe
          width="560"
          height="315"
          src="https://www.youtube.com/embed/p7HKvqRI_Bo?si=UqTHBLF-Eh_vqBsk&amp;controls=0"
          title="YouTube video player"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          referrerPolicy="strict-origin-when-cross-origin"
          allowFullScreen
        ></iframe>

        {/* Third video */}
        <iframe
          width="560"
          height="315"
          src="https://www.youtube.com/embed/h88f6g_BNes?si=BwlF4xCShPlDiz1L&amp;controls=0"
          title="YouTube video player"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          referrerPolicy="strict-origin-when-cross-origin"
          allowFullScreen
        ></iframe>

        {/* Fourth video */}
        <iframe
          width="560"
          height="315"
          src="https://www.youtube.com/embed/ZCFkWDdmXG8?si=Er1sH9EFByt5SS5G&amp;controls=0"
          title="YouTube video player"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          referrerPolicy="strict-origin-when-cross-origin"
          allowFullScreen
        ></iframe>
=======
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
>>>>>>> 2dd31247dbee15cef8dfe4de24bd8b389e6ef30a
      </div>
    </div>
  );
};

export default Learn;
