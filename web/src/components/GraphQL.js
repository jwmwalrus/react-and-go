import React, { Fragment, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

import Alert from './ui-components/Alert.js';
import Input from './form-components/Input.js';

const { REACT_APP_API_URL } = process.env;

const GraphQL = () => {
    const [movies, setMovies] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [isLoaded, setIsLoaded] = useState(false);
    const [alert, setAlert] = useState({
        type: 'd-none',
        message: '',
    });

    const getList = async () => {
        try {
            const payload = `
                {
                    list {
                        id
                        title
                        runtime
                        year
                        description
                    }
                }
                `;

            const headers = new Headers();
            headers.set('Content-Type', 'application/json');

            const reqOptions = {
                method: 'POST',
                body: payload,
                headers,
            };

            const res = await fetch(`${REACT_APP_API_URL}/v1/graphql`, reqOptions);
            const data = await res.json();
            if (res.status !== 200) {
                throw new Error(data.error.message);
            }
            const { list } = data.data;
            setMovies(list);
        } catch (e) {
            setAlert({ type: 'alert-error', message: e.message });
            console.error(e);
        }
        setIsLoaded(true);
    };

    const performSearch = async () => {
        try {
            const payload = `
                {
                    search(titleContains: "${searchTerm}") {
                        id
                        title
                        description
                        runtime
                        year
                    }
                }
                `;

            const headers = new Headers();
            headers.set('Content-Type', 'application/json');

            const reqOptions = {
                method: 'POST',
                body: payload,
                headers,
            };

            const res = await fetch(`${REACT_APP_API_URL}/v1/graphql`, reqOptions);
            const data = await res.json();
            if (res.status !== 200) {
                throw new Error(data.error.message);
            }
            const { search } = data.data;
            if (search.length > 0) {
                setMovies(search);
            } else {
                setMovies([]);
            }
            setMovies(search);
        } catch (e) {
            setAlert({ type: 'alert-error', message: e.message });
            console.error(e);
        }
        setIsLoaded(true);
    };

    useEffect(() => {
        getList();
    }, []);

    const handleChange = (evt) => {
        const { value } = evt.target;
        setSearchTerm(value);

        if (value === '') {
            getList();
            return;
        }

        performSearch();
    };

    if (!isLoaded) {
        return <p>Loading...</p>;
    }

    return (
        <Fragment>
            <h2>GraphQL</h2>
            <Alert
                type={alert.type}
                message={alert.message}
            />
            <hr />
            <Input
                title={'Search'}
                type={'text'}
                name={'search'}
                value={searchTerm}
                handleChange={handleChange}
            />
            <div className="list-group">
                {movies.map((m) => (
                    <Link
                        to={`/moviesgraphql/${m.id}`}
                        className="list-group-item list-group-item-action"
                        key={m.id}>
                        <strong>{m.title}</strong>
                        <br />
                        <small className="text-muted">({m.year} - {m.runtime})</small>
                        <br />
                        {m.description.slice(0, 100)}...
                    </Link>
                ))}
            </div>
        </Fragment>
    );
};

export default GraphQL;
