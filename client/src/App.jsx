import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import Register from "./pages/Register";
import Teams from "./pages/Teams";
import Matches from "./pages/Matches";
import Tournament from "./pages/Tournament";
import Events from "./pages/Events";
import Players from "./pages/Players";

const App = () => {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/register" element={<Register />} />
          <Route path="/teams" element={<Teams />} />
          <Route path="/matches" element={<Matches />} />
          <Route path="/events" element={<Events />} />
          <Route path="/players" element={<Players />} />
          <Route path="/tournament" element={<Tournament />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
};

export default App;