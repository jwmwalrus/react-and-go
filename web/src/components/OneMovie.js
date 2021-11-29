import React, { Fragment, useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

import Alert, { DEFAULT_ALERT_STATUS } from './ui-components/Alert.js';

const { REACT_APP_API_URL } = process.env;

const OneMovie = () => {
    const { movieId } = useParams();

    const [movie, setMovie] = useState({});
    const [isLoaded, setIsLoaded] = useState(false);
    const [alert, setAlert] = useState(DEFAULT_ALERT_STATUS);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await fetch(`${REACT_APP_API_URL}/v1/movie/${movieId}`);
                const data = await res.json();
                if (res.status !== 200) {
                    throw new Error(data.error.message);
                }

                const { movie } = data;
                if (movie.genres) {
                    movie.genres = Object.values(movie.genres);
                } else {
                    movie.genres = [];
                }
                setMovie(movie);
            } catch (e) {
                console.error(e);
                setAlert({ type: 'alert-error', message: e.message });
            }
            setIsLoaded(true);
        };

        fetchData();
    }, [movieId]);

    if (!isLoaded) {
        return <p>Loading...</p>;
    }

    return (
        <Fragment>
            <h2>Movie: {movie.title} ({movie.year})</h2>
            <Alert
                type={alert.type}
                message={alert.message}
            />
            <hr />

            <div className="float-start">
                <small>Rating: {movie.mpaaRating}</small>
            </div>

            <div className="float-end">
                {movie.genres.map((m, idx) => (
                    <span className="badge badge-secondary me-1" key={idx}>
                        {m}
                    </span>
                ))}
            </div>

            <table className="table table-compact table-striped">
                <thead></thead>
                <tbody>
                    <tr>
                        <td><strong>Title:</strong></td>
                        <td>{movie.title}</td>
                    </tr>
                    <tr>
                        <td><strong>Description:</strong></td>
                        <td>{movie.description}</td>
                    </tr>
                    <tr>
                        <td><strong>Run time:</strong></td>
                        <td>{movie.runtime}</td>
                    </tr>
                </tbody>
            </table>
        </Fragment>
    );
};

export default OneMovie;
