import React, { Fragment, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

import Alert, { DEFAULT_ALERT_STATUS } from './ui-components/Alert.js';

const { REACT_APP_API_URL } = process.env;

const Genres = () => {
    const [genres, setGenres] = useState([]);
    const [isLoaded, setIsLoaded] = useState(false);
    const [alert, setAlert] = useState(DEFAULT_ALERT_STATUS);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await fetch(`${REACT_APP_API_URL}/v1/genres`);
                const data = await res.json();
                if (res.status !== 200) {
                    throw new Error(data.error.message);
                }
                setGenres(data.genres);
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
            <h2>Genres</h2>
            <Alert
                type={alert.type}
                message={alert.message}
            />
            <hr />
            <div className="list-group">
                {genres.map((g) => (
                    <Link
                        key={g.id}
                        className="list-group-item list-group-item-action"
                        to={{
                            pathname: `/genres/${g.id}`,
                            genreName: g.genreName,
                        }}
                    >
                        {g.genreName}
                    </Link>
                ))}
            </div>
        </Fragment>
    );
};

export default Genres;
