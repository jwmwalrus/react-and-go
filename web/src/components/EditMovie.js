import React, { Fragment, useState, useEffect } from 'react';
import { Link, useParams, useHistory } from 'react-router-dom';
import { confirmAlert } from 'react-confirm-alert';

import Input from './form-components/Input.js';
import Select from './form-components/Select.js';
import TextArea from './form-components/TextArea.js';
import Alert, { DEFAULT_ALERT_STATUS } from './ui-components/Alert.js';

import 'react-confirm-alert/src/react-confirm-alert.css';
import './EditMovie.css';

const { REACT_APP_API_URL } = process.env;

const MPAA_RATINGS = [
    { id: 'G', value: 'G' },
    { id: 'PG', value: 'PG' },
    { id: 'PG13', value: 'PG13' },
    { id: 'R', value: 'R' },
    { id: 'NC17', value: 'NC17' },
];

const EditMovie = (props) => {
    const { movieId } = useParams();
    const history = useHistory();

    const [movie, setMovie] = useState({
        id: 0,
        title: '',
        releaseDate: '',
        runtime: '',
        mpaaRating: '',
        rating: '',
        description: '',
    });
    const [isLoaded, setIsLoaded] = useState(false);
    const [errors, setErrors] = useState([]);
    const [alert, setAlert] = useState(DEFAULT_ALERT_STATUS);

    const resetAlert = () => setAlert(DEFAULT_ALERT_STATUS);

    useEffect(() => {
        if (props.jwt === '') {
            history.push('/login');
            return;
        }

        const fetchData = async () => {
            try {
                const res = await fetch(`${REACT_APP_API_URL}/v1/movie/${movieId}`);
                const data = await res.json();
                if (res.status !== 200) {
                    throw new Error(data.error.message);
                }
                const {
                    title,
                    runtime,
                    mpaaRating,
                    rating,
                    description,
                } = data.movie;
                const releaseDate = new Date(data.movie.releaseDate);
                setMovie({
                    id: movieId,
                    title,
                    runtime,
                    mpaaRating,
                    rating,
                    description,
                    releaseDate: releaseDate.toISOString().split('T')[0],
                });
            } catch (e) {
                console.error(e);
                setAlert({ type: 'alert-error', message: e.message });
            }
            setIsLoaded(true);
        };

        if (movieId > 0) {
            fetchData();
        } else {
            setIsLoaded(true);
        }
    }, [movieId, history, props.jwt]);

    const handleSubmit = (evt) => {
        evt.preventDefault();
        resetAlert();

        const errors = [];

        if (movie.title === '') {
            errors.push('title');
        }

        setErrors(errors);

        if (errors.length > 0) {
            return false;
        }

        const postMovie = async () => {
            try {
                const fd = new FormData(evt.target);
                const payload = Object.fromEntries(fd.entries());
                const headers = new Headers();
                headers.append('Content-Type', 'application/json');
                headers.append('Authorization', `Bearer ${props.jwt}`);

                const reqOptions = {
                    method: 'POST',
                    body: JSON.stringify(payload),
                    headers,
                };

                const res = await fetch(`${REACT_APP_API_URL}/v1/admin/editmovie`, reqOptions);
                const data = await res.json();
                if (res.status !== 200) {
                    throw new Error(data.error.message);
                }
                history.push('/admin');
            } catch (e) {
                console.error(e);
                setAlert({ type: 'alert-error', message: e.message });
            }
        };

        postMovie();
        return true;
    };

    const handleChange = (evt) => {
        const { value, name } = evt.target;
        setMovie({
            ...movie,
            [name]: value,
        });
    };

    const hasError = (key) => errors.indexOf(key) !== -1;

    const confirmDelete = () => {
        resetAlert();

        confirmAlert({
            title: 'Delete Movie?',
            message: 'Are you sure?',
            buttons: [
                {
                    label: 'Yes',
                    onClick: async () => {
                        try {
                            const headers = new Headers();
                            headers.append('Content-Type', 'application/json');
                            headers.append('Authorization', `Bearer ${props.jwt}`);

                            const reqOptions = {
                                method: 'DELETE',
                                headers,
                            };

                            const res = await fetch(`${REACT_APP_API_URL}/v1/admin/deletemovie/${movieId}`, reqOptions);
                            if (res.status !== 204) {
                                const data = await res.json();
                                throw new Error(data.err0r.message);
                            }
                            history.push('/admin');
                        } catch (e) {
                            setAlert({ type: 'alert-error', message: e.message });
                            console.error(e);
                        }
                    },
                },
                {
                    label: 'No',
                    onClick: () => {},
                },
            ],
        });
    };

    if (!isLoaded) {
        return <p>loading...</p>;
    }

    return (
        <Fragment>
            <h2>Add/Edit Movie</h2>
            <Alert
                type={alert.type}
                message={alert.message}
            />
            <hr />
            <form onSubmit={handleSubmit}>
                <input
                    id="id"
                    type="hidden"
                    name="id"
                    value={movie.id}
                    onChange={handleChange}
                />
                <Input
                    title={'Title'}
                    className={hasError('title') ? 'is-invalid' : ''}
                    type={'text'}
                    name={'title'}
                    value={movie.title}
                    handleChange={handleChange}
                    errorDiv={hasError('title') ? 'text-danger' : 'd-none'}
                    errorMsg={'Please enter a title'}
                />
                <Input
                    title={'Release Date'}
                    type={'date'}
                    name={'releaseDate'}
                    value={movie.releaseDate}
                    handleChange={handleChange}
                />
                <Input
                    title={'runtime'}
                    type={'text'}
                    name={'runtime'}
                    value={movie.runtime}
                    handleChange={handleChange}
                />
                <Select
                    title={'Mpaa Rating'}
                    name={'mpaaRating'}
                    value={movie.mpaaRating}
                    handleChange={handleChange}
                    options={MPAA_RATINGS}
                />
                <Input
                    title={'rating'}
                    type={'text'}
                    name={'rating'}
                    value={movie.rating}
                    handleChange={handleChange}
                />
                <TextArea
                    title={'Description'}
                    name={'description'}
                    value={movie.description}
                    handleChange={handleChange}
                />

                <hr />

                <button className="btn btn-primary">Save</button>
                <Link className="btn btn-warning ms-1" to="/admin">Cancel</Link>
                { movie.id > 0 && (
                    <a href="#!" className="btn btn-danger" onClick={() => confirmDelete()}>Delete</a>
                )}
            </form>
        </Fragment>
    );
};

export default EditMovie;
