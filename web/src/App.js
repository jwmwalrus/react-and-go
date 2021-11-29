import React, { Fragment, useState, useEffect } from 'react';
import {
    BrowserRouter as Router,
    Switch,
    Route,
    Link,
} from 'react-router-dom';

import Admin from './components/Admin.js';
import EditMovie from './components/EditMovie.js';
import Genres from './components/Genres.js';
import GraphQL from './components/GraphQL.js';
import Home from './components/Home.js';
import Login from './components/Login.js';
import Movies from './components/Movies.js';
import OneGenre from './components/OneGenre.js';
import OneMovie from './components/OneMovie.js';
import OneMovieGraphQL from './components/OneMovieGraphQL.js';

const App = () => {
    const [jwt, setJwt] = useState('');

    useEffect(() => {
        try {
            const t = window.localStorage.getItem('jwt');
            if (t && jwt === '') {
                setJwt(JSON.parse(t));
            }
        } catch (e) {
            console.error(e);
        }
    }, [jwt]);

    const handleJwtChange = (jwt) => {
        setJwt(jwt);
    };

    const logout = () => {
        setJwt('');
        window.localStorage.removeItem('jwt');
    };

    let loginLink;
    if (jwt === '') {
        loginLink = <Link to="/login">Login</Link>;
    } else {
        loginLink = <Link to="/logout" onClick={logout}>Logout</Link>;
    }

    return (
        <Router>
            <div className="container">
                <div className="row">
                    <div className="col mt-3">
                        <h1 className="mt-3">Go Watch a Movie!</h1>
                    </div>
                    <div className="col mt-3 text-end">
                        {loginLink}
                    </div>
                </div>
                <hr className="mb-3"></hr>

                <div className="row">
                    <div className="col-md-2">
                        <nav>
                            <ul className="list-group">
                                <li className="list-group-item">
                                    <Link to="/">Home</Link>
                                </li>
                                <li className="list-group-item">
                                    <Link to="/movies">Movies</Link>
                                </li>
                                <li className="list-group-item">
                                    <Link to="/genres">Genres</Link>
                                </li>
                                {jwt !== '' && (
                                    <Fragment>
                                        <li className="list-group-item">
                                            <Link to="/admin/movie/0">Add Movie</Link>
                                        </li>
                                        <li className="list-group-item">
                                            <Link to="/admin">Manage Catalogue</Link>
                                        </li>
                                    </Fragment>
                                )}
                                <li className="list-group-item">
                                    <Link to="/graphql">GraphQL</Link>
                                </li>
                            </ul>
                        </nav>
                    </div>
                    <div className="col-md-10">
                        <Switch>
                            <Route path="/movies/:movieId" component={OneMovie} />
                            <Route path="/moviesgraphql/:movieId" component={OneMovieGraphQL} />
                            <Route path="/movies">
                                <Movies />
                            </Route>
                            <Route path="/genres/:genreId" component={OneGenre} />
                            <Route
                                exact
                                path="/login"
                                component={(props) => (
                                    <Login {...props} handleJwtChange={handleJwtChange} />
                                )}
                            />
                            <Route exact path="/genres">
                                <Genres />
                            </Route>
                            <Route exact path="/graphql">
                                <GraphQL />
                            </Route>
                            <Route
                                path="/admin/movie/:movieId"
                                component={(props) => (
                                    <EditMovie {...props} jwt={jwt} />
                                )}
                            />
                            <Route
                                path="/admin"
                                component={(props) => (
                                    <Admin {...props} jwt={jwt} />
                                )}
                            />
                            <Route path="/">
                                <Home />
                            </Route>
                        </Switch>
                    </div>
                </div>
            </div>
        </Router>
    );
};

export default App;
