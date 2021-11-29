import React from 'react';

const Input = (props) => {
    const {
        name,
        title,
        type,
        value,
        placeholder,
        handleChange,
        className,
        errorDiv,
        errorMsg,
    } = props;
    return (
        <div className="mb-3">
            <label className="form-label" htmlFor={name}>{title}</label>
            <input
                id={name}
                className={`form-control ${className}`}
                type={type}
                name={name}
                value={value}
                placeholder={placeholder}
                onChange={handleChange}
            />
            <div className={errorDiv}>{errorMsg}</div>
        </div>
    );
};

export default Input;
