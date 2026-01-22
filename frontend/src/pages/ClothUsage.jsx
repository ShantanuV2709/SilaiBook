import { useEffect, useState } from "react";
import { fetchClothUsageHistory } from "../api/clothStock";

export default function ClothUsage() {
  const [history, setHistory] = useState([]);

  useEffect(() => {
    fetchClothUsageHistory().then(setHistory);
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h1 className="text-2xl font-bold mb-4">Cloth Usage History</h1>

      <div className="bg-white rounded shadow">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-200 text-left">
              <th className="p-2">Dealer</th>
              <th className="p-2">Type</th>
              <th className="p-2">Used (m)</th>
              <th className="p-2">Remaining</th>
              <th className="p-2">Date</th>
            </tr>
          </thead>
          <tbody>
            {history.map((h) => (
              <tr key={h._id} className="border-t">
                <td className="p-2">{h.dealer_name}</td>
                <td className="p-2">{h.cloth_type}</td>
                <td className="p-2 font-semibold">{h.used_meters}</td>
                <td className="p-2">{h.remaining_meters}</td>
                <td className="p-2">
                  {new Date(h.used_at).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {history.length === 0 && (
          <p className="p-4 text-gray-500">No usage recorded</p>
        )}
      </div>
    </div>
  );
}
