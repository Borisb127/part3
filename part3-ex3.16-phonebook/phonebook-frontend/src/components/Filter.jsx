


import React from 'react';

// Filter component
const Filter = ({ filterName, handleFilterChange }) => {
    return (
    <div>
        filter shown with: <input value={filterName} onChange={handleFilterChange}/>
    </div>
    )
}

export default Filter