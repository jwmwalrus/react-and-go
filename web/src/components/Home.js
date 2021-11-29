import React from 'react';

import TicketImg from '../images/movie_tickets.jpg';

import './Home.css';

const Home = () => (
    <div className="text-center">
        <h2>Home</h2>
        <hr />
        <img src={TicketImg} alt="movie ticket" />
        <hr />
        <div className="tickets"></div>
    </div>
);

export default Home;
