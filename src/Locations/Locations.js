 import React, {useEffect, useState} from 'react';
 import './Locations.css';

 function Locations() {
    const [validationErrors, setValidationErrors] = useState([]);
    const [results, setResults] = useState(null);
    const [filterBy, setFilterBy] = useState("all");
    const [filtered, setFiltered] = useState(null);
    const [submitted, setSubmitted] = useState(false);
    const [limit, setLimit] = useState(100);
    const [oneResult, setOneResult] = useState(null);
    const [oneResultDetails, setOneResultDetails] = useState(null);
    const [showOneResult, setShowOneResult] = useState(false);
    const [detailsLoaded, setDetailsLoaded] = useState(false);
    const [filterDetailBy, setFilterDetailBy] = useState("all");
    const [detailFiltered, setDetailFiltered] = useState(null);

    const validate = () => {
        const validationErrors = [];

        if (!limit || limit < 1 || limit > 1000 || Math.floor(limit) !== Number(limit)) validationErrors.push("Limit must be an integer between 1 and 1000.");

        return validationErrors;
    }

    useEffect(() => {
        if (results === null) {
            return;
        }
        if (filterBy === "all") {
            setFiltered(results);
            return;
        } else {
            setFiltered(results.filter(result => result.entity === filterBy));
            return;
        }
    }, [results, filterBy]);

    useEffect(() => {
        if (oneResultDetails === null) {
            return
        }
        if (filterDetailBy === "all") {
            setDetailFiltered(oneResultDetails);
            return;
        } else {
            setDetailFiltered(oneResultDetails.filter(detail => detail.parameter === filterDetailBy));
            return;
        }
    }, [oneResultDetails, filterDetailBy]);

    const handleSubmit = (e) => {
        e.preventDefault();
        const errors = validate();

        if (errors.length > 0) {
            setValidationErrors(errors);
        } else {
            setSubmitted(true);
            (async () => {
                const response = await fetch(`https://docs.openaq.org/v2/locations?limit=${Number(limit)}&page=1&offset=0&sort=desc&radius=1000&country_id=US&order_by=lastUpdated&entity=community&dumpRaw=false`)
                const data = await response.json();
                console.log("allLocations:", data);
                setResults(data.results);
            })();
            setValidationErrors([]);
        }
    };

    const handleResultClick = (result) => {
        setOneResult(result);
        (async () => {
            const response = await fetch(`https://u50g7n0cbj.execute-api.us-east-1.amazonaws.com/v2/measurements?&limit=100&page=1&offset=0&sort=desc&radius=1000&location_id=${result.id}&order_by=datetime`);
            const data = await response.json();
            console.log("oneLocation:", data);
            setOneResultDetails(data.results);
            setDetailsLoaded(true);
        })()
        setShowOneResult(true);
    };

    const handleCloseClick = () => {
        setShowOneResult(false);
        setOneResult(null);
        setOneResultDetails(null);
        setDetailsLoaded(false);
        setFilterDetailBy("all");
        setDetailFiltered(null);
    };

    useEffect(() => {
        if (showOneResult) {
            document.addEventListener("click", handleCloseClick);
            return () => document.removeEventListener("click", handleCloseClick);
        } else {
            return;
        }
    }, [showOneResult]);

    if (submitted && !results) {
        return <div className="section-container">Data is loading...</div>;
    }

    return (
        <div className="top-container">
            {!submitted &&
                <div>
                    <div className="section-container">
                        <div className="section-container">
                            <h3>Search for US Locations</h3>
                            <form onSubmit={handleSubmit}>
                                {validationErrors.length > 0 && (
                                    <div className="errors-list">
                                        <ul>
                                            {validationErrors.map(error => <li key={error}>{error}</li>)}
                                        </ul>
                                    </div>
                                )}
                                <label htmlFor="limit">Limit # of results: </label>
                                <input required type="number" value={limit} onChange={(e) => setLimit(e.target.value)}></input>
                                <button>Search</button>
                            </form>
                        </div>
                    </div>
                    <div className="spacer"></div>
                </div>
            }
            {submitted && <div className="section-container link" onClick={(e) => {
                e.preventDefault();
                setResults(null);
                setFilterBy("all");
                setFiltered(null);
                setSubmitted(false);
            }}>Back to search.</div>}
            {results && filtered && 
                <div>
                    <div className="section-container">
                        <div className="section-container">
                            <span>{results.length} total results, sorted by "Last Updated."</span>
                        </div>
                        <div className="section-container">
                            <label htmlFor="entity-select">Filter by entity type: </label>
                            <select name="entities" id="entity-select" onChange={(e) => setFilterBy(e.target.value)} value={filterBy}>
                                <option value="all">--Please choose an option--</option>
                                <option value="community">Community</option>
                                <option value="government">Government</option>
                                <option value="research">Research</option>
                            </select>
                        </div>
                        <div className="section-container">
                            {filterBy !== "all" && <span>{filtered.length} matching results.</span>}
                        </div>
                    </div>
                    <div className="results-grid">
                        {results && filtered && filtered.map(result => {
                            return (
                                <div key={result.id} className="result-card">
                                    <div>
                                        <div><span className="data-category">Name: </span><span className="result-name" onClick={() => handleResultClick(result)}>{result.name}</span></div>
                                        <div><span className="data-category">Id: </span>{result.id}</div>
                                        <div><span className="data-category">Entity: </span>{result.entity}{result.entity === "community" && " 🏠"}{result.entity === "government" && " 🏛️"}{result.entity === "research" && " 🔬"}</div>
                                        <div><span className="data-category">Country: </span>{result.country}</div>
                                        <div className="floatable" onMouseEnter={() => document.getElementById(`sources-${result.id}`).style.visibility = "visible"} onMouseLeave={() => document.getElementById(`sources-${result.id}`).style.visibility = "hidden"}><span className="data-category">Sources: </span>{`[${result.sources.length} ${result.sources.length === 1 ? "source" : "sources"}]`}</div>
                                        <div className="float" id={`sources-${result.id}`}>
                                            {result.sources.length > 0 && result.sources.map(source => {
                                                return (
                                                    <div key={source}>
                                                        <div><span className="data-category">Id: </span>{source.id}</div>
                                                        <div><span className="data-category">Url: </span>{source.url}</div>
                                                        <div><span className="data-category">Name: </span>{source.name}</div>
                                                    </div>
                                                )
                                            })}
                                        </div>
                                        <div><span className="data-category">Mobile: </span>{String(result.isMobile)}</div>
                                        <div><span className="data-category">Analysis: </span>{String(result.isAnalysis)}</div>
                                        <div><span className="data-category">Parameters: </span></div>
                                        {result.parameters.length > 0 &&
                                            result.parameters.sort((a, b) => (a.displayName > b.displayName) ? 1 : -1).map(parameter => {
                                                return (
                                                    <div key={parameter.id}>
                                                        <div className="floatable" onMouseEnter={() => document.getElementById(`parameters-${result.id}-${parameter.id}`).style.visibility = "visible"} onMouseLeave={() => document.getElementById(`parameters-${result.id}-${parameter.id}`).style.visibility = "hidden"}><span className='data-subcategory'>{parameter.displayName}: </span>{parameter.lastValue} <span className="small-text">(avg: {parameter.average.toFixed(2)})</span></div>
                                                        <div className="float" id={`parameters-${result.id}-${parameter.id}`}>
                                                            <div><span className="data-category">Display Name: </span><span className="parameter-name">{parameter.displayName}</span></div>
                                                            <div><span className="data-category">Id: </span>{parameter.id}</div>
                                                            <div><span className="data-category">Unit: </span>{parameter.unit}</div>
                                                            <div><span className="data-category">Count: </span>{parameter.count}</div>
                                                            <div><span className="data-category">Average: </span>{parameter.average}</div>
                                                            <div><span className="data-category">Last Value: </span>{parameter.lastValue}</div>
                                                            <div><span className="data-category">Parameter: </span>{parameter.parameter}</div>
                                                            <div><span className="data-category">ParameterId: </span>{parameter.parameterId}</div>
                                                            <div><span className="data-category">Last Updated: </span>{parameter.lastUpdated}</div>
                                                            <div><span className="data-category">First Updated: </span>{parameter.firstUpdated}</div>
                                                        </div>
                                                    </div>
                                                );
                                             })
                                        }
                                        <div><span className="data-category">Sensor Type: </span>{result.sensorType}</div>
                                        <div><span className="data-category">Coordinates: </span>{`Lat: ${result.coordinates.latitude}, Lon: ${result.coordinates.longitude}`}</div>
                                        <div><span className="data-category">Last Updated: </span>{result.lastUpdated}</div>
                                        <div><span className="data-category">First Updated: </span>{result.firstUpdated}</div>
                                        <div><span className="data-category">Measurements: </span>{result.measurements}</div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>
            }
            {showOneResult &&
                <div className="one-result-modal">
                    <div className="one-result-content" onClick={(e) => e.stopPropagation()}>
                        <div className="result-name detailview">{oneResult.name}</div>
                        <div><span className='data-category'>Id: </span>{oneResult.id}</div>
                        <br></br>
                        {!detailsLoaded && <div>Data is loading...</div>}
                        {detailsLoaded &&
                            <div>
                                <div className="section-container">
                                    <label htmlFor="entity-select">Filter by parameter type: </label>
                                    <select name="entities" id="entity-select" onChange={(e) => setFilterDetailBy(e.target.value)} value={filterDetailBy}>
                                        <option value="all">--Please choose an option--</option>
                                        <option value="pm1">pm1</option>
                                        <option value="um010">um010</option>
                                        <option value="pm10">pm10</option>
                                        <option value="um100">um100</option>
                                        <option value="pm25">pm25</option>
                                        <option value="um025">um025</option>
                                    </select>
                                </div>
                                <table>
                                    <thead>
                                        <tr>
                                            <th>Date</th>
                                            <th>Time</th>
                                            <th>Parameter</th>
                                            <th>Value</th>
                                            <th>Unit</th>
                                        </tr>
                                    </thead>
                                    <tbody className="table-body">
                                    {oneResultDetails && detailFiltered.length > 0 && detailFiltered.map((measurement, i) => {
                                        return (
                                            <tr key={i}>
                                                <td>{measurement.date.utc.slice(0,10)}</td>
                                                <td>{measurement.date.utc.slice(11,16)}</td>
                                                <td>{measurement.parameter}</td>
                                                <td>{measurement.value}</td>
                                                <td>{measurement.unit}</td>
                                            </tr>
                                        )
                                    })}
                                    </tbody>
                                </table>
                            </div>
                        }
                    </div>
                </div>
            }
        </div>
    );
}

export default Locations;