import React, {
    Fragment,
    useState,
    useEffect,
} from 'react';
import {
    Link,
    useParams,
    useLocation,
} from 'react-router-dom';

import Alert, { DEFAULT_ALERT_STATUS } from './ui-components/Alert.js';

const { REACT_APP_API_URL } = process.env;

const OneGenre = () => {
    const { genreId } = useParams();
    const { genreName } = useLocation();
    const [alert, setAlert] = useState(DEFAULT_ALERT_STATUS);

    const [movies, setMovies] = useState([]);
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await fetch(`${REACT_APP_API_URL}/v1/movies/${genreId}`);
                const data = await res.json();
                if (res.status !== 200) {
                    throw new Error(data.error.message);
                }

                let { movies } = data;

                if (!movies) {
                    movies = [];
                }

                setMovies(movies);
            } catch (e) {
                console.error(e);
                setAlert({ type: 'alert-error', message: e.message });
            }
            setIsLoaded(true);
        };

        fetchData();
    }, [genreId]);

    if (!isLoaded) {
        return <p>Loading...</p>;
    }

    return (
        <Fragment>
            <h2>Genre: {genreName}</h2>
            <Alert
                type={alert.type}
                message={alert.message}
            />
            <hr />
            <div className="list-group">
                {movies.map((m) => (
                    <Link key={m.id} to={`/movies/${m.id}`} className="list-group-item list-group-item-action">{m.title}</Link>
                ))}
            </div>
        </Fragment>
    );
};

export default OneGenre;
