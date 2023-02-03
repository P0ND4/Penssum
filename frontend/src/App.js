import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import EventHandler from "./controllers/EventHandler"; // route and event handler
import Information from "./controllers/Information"; // Get all the information

import Main from "./router/Main"; // Main content
import Dashboard from "./router/Dashboard"; // Dashboard content

function App() {
  return (
    <Router>
      <Information>
        <EventHandler>
          <Routes>
            <Route path="/dashboard/*" element={<Dashboard />} />
            <Route path="*" element={<Main />} />
          </Routes>
        </EventHandler>
      </Information>
    </Router>
  );
}

export default App;