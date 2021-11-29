import React from 'react';

const Select = (props) => {
    const {
        name,
        title,
        value,
        placeholder,
        handleChange,
        options,
    } = props;
    return (
        <div className="mb-3">
            <label className="class-label" htmlFor={name}>{title ?? ' '}</label>
            <select
                id={name}
                className="form-select"
                name={name}
                value={value}
                onChange={handleChange}
            >
                <option className="form-select" value="">{placeholder ?? 'Choose...'}</option>
                {
                    options.map((o) => (
                        <option key={o.id} className="form-select" value={o.value} >{o.value}</option>
                    ))
                }
            </select>
        </div>
    );
};

export default Select;
