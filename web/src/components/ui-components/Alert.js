import React from 'react';

const DEFAULT_ALERT_STATUS = {
    type: 'd-none',
    message: '',
};

const Alert = (props) => {
    const { type, message } = props;
    return (
        <div className={`alert ${type}`} role="alert">
            {message}
        </div>
    );
};

export {
    Alert as default,
    DEFAULT_ALERT_STATUS,
};
