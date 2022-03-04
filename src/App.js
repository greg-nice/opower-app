// import logo from './logo.svg';
import './App.css';
import React, { useEffect, useState } from 'react';


function App() {
  // return (
  //   <div className="App">
  //     <header className="App-header">
  //       <img src={logo} className="App-logo" alt="logo" />
  //       <p>
  //         Edit <code>src/App.js</code> and save to reload.
  //       </p>
  //       <a
  //         className="App-link"
  //         href="https://reactjs.org"
  //         target="_blank"
  //         rel="noopener noreferrer"
  //       >
  //         Learn React
  //       </a>
  //     </header>
  //   </div>
  // );
  const [results, setResults] = useState(null);

  useEffect(() => {
    (async () => {
      const response = await fetch("https://u50g7n0cbj.execute-api.us-east-1.amazonaws.com/v2/locations?limit=50&page=1&offset=0&sort=desc&radius=1000&country_id=US&order_by=lastUpdated&dumpRaw=false");
      const data = await response.json();
      console.log(data);
      setResults(data.results);
    })();
  }, []);

  // const render = (status: Status) => {
  //   return <h1>{status}</h1>;
  // };

  if (!results) {
    return <div>Hello from homepage! There are no results.</div>;
  }

  return (
    <div>
      <div>RESULTS:
        {results.map(result => {
          return (
            <div key={result.id} className="result-card">
              <div>
                <div>Id: {result.id}</div>
                <div>Name: {result.name}</div>
                <div>Country: {result.country}</div>
                <div>Entity: {result.entity}</div>
                <div>Country: {result.country}</div>
                <div>Sources: {`[${result.sources.length} sources]`}</div>
                <div>Mobile: {String(result.isMobile)}</div>
                <div>Analysis: {String(result.isAnalysis)}</div>
                <div>Parameters: {`[${result.parameters.length} parameters]`}</div>
                <div>Sensor Type: {result.sensorType}</div>
                <div>Coordinates: {`(Lat: ${result.coordinates.latitude}, Lon: ${result.coordinates.longitude})`}</div>
                <div>Last Updated: {result.lastUpdated}</div>
                <div>First Updated: {result.firstUpdated}</div>
                <div>Measurements: {result.measurements}</div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  );
}

export default App;
