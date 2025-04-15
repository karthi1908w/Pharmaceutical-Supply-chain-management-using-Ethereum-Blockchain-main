import React from "react";
import "./NotFound.css";
import bgGif from "../assets/bg.gif"; 

const NotFound = () => {
  return (
    <div className="not-found-container">
      <img src={bgGif} alt="404 Background" className="background-gif" />
      <div className="content">
        <h1>404</h1>
        <h2>Oops! Page Not Found</h2>
        <p>The page you are looking for might have been removed or temporarily unavailable.</p>
        <a href="/">Go Back Home</a>
      </div>
    </div>
  );
};

export default NotFound;