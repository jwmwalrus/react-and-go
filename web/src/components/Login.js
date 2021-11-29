import React, { Fragment, useState } from 'react';
import { useHistory } from 'react-router-dom';

import Input from './form-components/Input.js';
import Alert, { DEFAULT_ALERT_STATUS } from './ui-components/Alert.js';

const { REACT_APP_API_URL } = process.env;

const Login = (props) => {
    const history = useHistory();

    const [credentials, setCredentials] = useState({ email: '', password: '' });
    const [errors, setErrors] = useState([]);
    const [alert, setAlert] = useState(DEFAULT_ALERT_STATUS);

    const handleJwtChange = (jwt) => props.handleJwtChange(jwt);

    const handleSubmit = (evt) => {
        evt.preventDefault();

        const errors = [];
        if (credentials.email === '') {
            errors.push('email');
        }
        if (credentials.password === '') {
            errors.push('password');
        }

        setErrors(errors);
        if (errors.length > 0) {
            return false;
        }

        const postLogin = async () => {
            try {
                const fd = new FormData(evt.target);
                const payload = Object.fromEntries(fd.entries());

                const reqOptions = {
                    method: 'POST',
                    body: JSON.stringify(payload),
                };

                const res = await fetch(`${REACT_APP_API_URL}/v1/signin`, reqOptions);
                const data = await res.json();
                if (res.status !== 200) {
                    throw new Error(data.error.message);
                }

                handleJwtChange(Object.values(data)[0]);
                window.localStorage.setItem('jwt', JSON.stringify(Object.values(data)[0]));
                history.push('/admin');
            } catch (e) {
                setAlert({ type: 'alert-error', message: e.message });
                console.error(e);
            }
        };

        postLogin();

        return true;
    };

    const handleChange = (evt) => {
        const { value, name } = evt.target;
        setCredentials({
            ...credentials,
            [name]: value,
        });
    };

    const hasError = (key) => errors.indexOf(key) !== -1;

    return (
        <Fragment>
            <h2>Login</h2>
            <Alert
                type={alert.type}
                message={alert.message}
            />
            <hr />
            <form onSubmit={handleSubmit}>
                <Input
                    title={'Email'}
                    type={'email'}
                    name={'email'}
                    value={credentials.email}
                    handleChange={handleChange}
                    className={hasError('email') ? 'is-invalid' : ''}
                    errorDiv={hasError('email') ? 'text-danger' : 'd-none'}
                    errorMsg={'Please enter a valid email address'}
                />
                <Input
                    title={'Password'}
                    type={'password'}
                    name={'password'}
                    value={credentials.password}
                    handleChange={handleChange}
                    className={hasError('password') ? 'is-invalid' : ''}
                    errorDiv={hasError('password') ? 'text-danger' : 'd-none'}
                    errorMsg={'Please enter a password'}
                />

                <hr />

                <button className="btn btn-primary">Login</button>
            </form>
        </Fragment>
    );
};

export default Login;
