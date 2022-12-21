import "./App.css";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Chat from "./Components/Chat/Chat";
import Login from "./Components/Login/Login";
import Register from "./Components/Register/Register";
import PrivateRoute from "./utils/privateRoute";
import RefreshLogin from "./utils/refreshLogin";
import { RoomProvider } from "./utils/roomContext";

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route
            path="/"
            element={
              <PrivateRoute>
                <RoomProvider>
                  <Chat />
                </RoomProvider>
              </PrivateRoute>
            }
          />
          <Route
            path="/login"
            element={
              <RefreshLogin>
                <Login />
              </RefreshLogin>
            }
          />
          <Route path="/register" element={<Register />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
