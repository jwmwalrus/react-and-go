import React, { Fragment, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

import Alert, { DEFAULT_ALERT_STATUS } from './ui-components/Alert.js';

const { REACT_APP_API_URL } = process.env;

const Movies = () => {
    const [movies, setMovies] = useState([]);
    const [isLoaded, setIsLoaded] = useState(false);
    const [alert, setAlert] = useState(DEFAULT_ALERT_STATUS);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await fetch(`${REACT_APP_API_URL}/v1/movies`);
                const data = await res.json();
                if (res.status !== 200) {
                    throw new Error(data.error.message);
                }
                setMovies(data.movies);
            } catch (e) {
                console.error(e);
                setAlert({ type: 'alert-error', message: e.message });
            }
            setIsLoaded(true);
        };

        fetchData();
    }, []);

    if (!isLoaded) {
        return <p>Loading...</p>;
    }

    return (
        <Fragment>
            <h2>Choose a Movie</h2>
            <Alert
                type={alert.type}
                message={alert.message}
            />
            <hr />
            <div className="list-group">
                {movies.map((m) => (
                    <Link
                        key={m.id}
                        className="list-group-item list-group-item-action"
                        to={`/movies/${m.id}`}
                    >
                        {m.title}
                    </Link>
                ))}
            </div>
        </Fragment>
    );
};

export default Movies;
