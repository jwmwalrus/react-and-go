import React from 'react';

const TextArea = (props) => {
    const {
        name,
        title,
        value,
        placeholder,
        handleChange,
    } = props;
    return (
        <div className="mb-3">
            <div className="form-label" htmlFor={name}>{title}</div>
            <textarea
                id={name}
                className="form-control"
                name={name}
                cols="30"
                rows="3"
                value={value}
                placeholder={placeholder}
                onChange={handleChange}
            />
        </div>
    );
};

export default TextArea;
