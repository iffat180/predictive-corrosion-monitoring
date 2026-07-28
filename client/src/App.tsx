import { Route, Routes } from "react-router-dom";
import { Layout } from "./components/Layout";
import { FleetDashboard } from "./pages/FleetDashboard";
import { AssetDetail } from "./pages/AssetDetail";
import { PriorityQueue } from "./pages/PriorityQueue";
import { Calibration } from "./pages/Calibration";

function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<FleetDashboard />} />
        <Route path="/assets/:id" element={<AssetDetail />} />
        <Route path="/priority" element={<PriorityQueue />} />
        <Route path="/calibration" element={<Calibration />} />
      </Route>
    </Routes>
  );
}

export default App;
