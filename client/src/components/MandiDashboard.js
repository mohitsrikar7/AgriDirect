import React, { useState, useEffect } from "react";
import { fetchMandiData } from "../mandiOptions";

const MandiDashboard = () => {
  const [state, setState] = useState("Andhra Pradesh"); // default state
  const [mandiRecords, setMandiRecords] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const getData = async () => {
      setLoading(true);
      const data = await fetchMandiData(state);
      setMandiRecords(data);
      setLoading(false);
    };
    getData();
  }, [state]);

  return (
    <div>
      <h2>Mandi Prices for {state}</h2>

      {/* Dropdown to change state */}
      <select value={state} onChange={(e) => setState(e.target.value)}>
        <option value="Andhra Pradesh">Andhra Pradesh</option>
        <option value="Telangana">Telangana</option>
        <option value="Tamil Nadu">Tamil Nadu</option>
        <option value="Karnataka">Karnataka</option>
        <option value="Maharashtra">Maharashtra</option>
        <option value="Uttar Pradesh">Uttar Pradesh</option>
      </select>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <table border="1" style={{ marginTop: "20px" }}>
          <thead>
            <tr>
              <th>Commodity</th>
              <th>Market</th>
              <th>District</th>
              <th>Variety</th>
              <th>Grade</th>
              <th>Min Price</th>
              <th>Max Price</th>
              <th>Modal Price</th>
            </tr>
          </thead>
          <tbody>
            {mandiRecords.map((record, index) => (
              <tr key={index}>
                <td>{record.commodity}</td>
                <td>{record.market}</td>
                <td>{record.district}</td>
                <td>{record.variety}</td>
                <td>{record.grade}</td>
                <td>{record.min_price}</td>
                <td>{record.max_price}</td>
                <td>{record.modal_price}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default MandiDashboard;
