import React, { useEffect, useState } from "react";
import axios from "axios";
import { MANDI_STATES, MANDI_CROPS } from "../../constants/mandiOptions";

const MandiDashboard = () => {
  
  const [data, setData] = useState([]);
  const [state, setState] = useState("Andhra Pradesh"); // default state
  const [crop, setCrop] = useState(""); // default: all crops
  const [loading, setLoading] = useState(false);

  // Fetch Mandi data from backend
  const fetchMandiData = async () => {
    try {
      setLoading(true);
      const response = await axios.get("/api/mandi-data", {
        params: {
          state,
          commodity: crop
        },
      });
      setData(response.data);
    } catch (error) {
      console.error("Error fetching mandi data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMandiData();
  }, [state, crop]);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Mandi Prices Dashboard</h1>

      {/* Filters */}
      <div className="flex gap-4 mb-4">
        <select
          value={state}
          onChange={(e) => setState(e.target.value)}
          className="border p-2"
        >
          {MANDI_STATES.map((st) => (
            <option key={st} value={st}>{st}</option>
          ))}
        </select>

        <select
          value={crop}
          onChange={(e) => setCrop(e.target.value)}
          className="border p-2"
        >
          <option value="">All Crops</option>
          {MANDI_CROPS.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>

        <button
          onClick={fetchMandiData}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Refresh
        </button>
      </div>

      {/* Table */}
      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="table-auto border-collapse border border-gray-300 w-full">
            <thead>
              <tr className="bg-gray-100">
                <th className="border px-4 py-2">Market</th>
                <th className="border px-4 py-2">Commodity</th>
                <th className="border px-4 py-2">Variety</th>
                <th className="border px-4 py-2">Grade</th>
                <th className="border px-4 py-2">Arrival Date</th>
                <th className="border px-4 py-2">Min Price</th>
                <th className="border px-4 py-2">Max Price</th>
                <th className="border px-4 py-2">Modal Price</th>
              </tr>
            </thead>
            <tbody>
              {data.length > 0 ? (
                data.map((item, idx) => (
                  <tr key={idx}>
                    <td className="border px-4 py-2">{item.market}</td>
                    <td className="border px-4 py-2">{item.commodity}</td>
                    <td className="border px-4 py-2">{item.variety}</td>
                    <td className="border px-4 py-2">{item.grade}</td>
                    <td className="border px-4 py-2">{item.arrival_date}</td>
                    <td className="border px-4 py-2">{item.min_price}</td>
                    <td className="border px-4 py-2">{item.max_price}</td>
                    <td className="border px-4 py-2">{item.modal_price}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="text-center p-4">
                    No records found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default MandiDashboard;
