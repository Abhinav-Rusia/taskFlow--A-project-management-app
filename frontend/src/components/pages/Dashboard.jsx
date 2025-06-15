import { useState } from "react";
import axios from "axios";



const Dashboard = () => {

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await axios.get("http://localhost:3000/api/test");
        setData(response.data);
        setLoading(false);
      } catch (error) {
      setError(error.message || "An error occurred");
      setLoading(false);
      }
    }

  return (
    <div>
      <h1 className="text-center">Dashboard Component</h1>
      <p>{data}</p>
      {error && <p style={{color: 'red'}}>{error}</p>}

      {loading ? "Loading..." : <button disabled={loading} onClick={fetchData}>Fetch Data</button>}
    </div>
  );
};

export default Dashboard;
