import logo from './logo.svg';
import './App.css';
import { BrowserRouter as Router, Route, Routes, Outlet  } from 'react-router-dom';

// Components
import Sidebar from './components/sidebar/Sidebar';
import Topbar from './components/topbar/Topbar';
import Backbar from './components/topbar/Backbar';

// Pages
import Dashboard from './pages/Dashboard';
import ManageBrand from './pages/ManageBrand';
import ManageUser from './pages/ManageUser';
import ManageGame from './pages/ManageGame';
import Login from "./pages/Login";

function Layout() {
  return (
    <div className="layout">
      <Sidebar />
      <div className="content">
        <Topbar />
        <div className="page-content">
          {/* <Routes>
            <Route path="/dashboard" element={<Dashboard />} />
          </Routes> */}
          <Outlet />
        </div>
      </div>
    </div>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="" element={<Layout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/brand" element={<ManageBrand />} />
          <Route path="/user" element={<ManageUser />} />
          <Route path="/game" element={<ManageGame />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
