import { useContext } from "react";
import { AuthContext } from "./Contexts/AuthContext.jsx";
import { Navigate, Route, Routes } from "react-router-dom";
import Home from "./pages/Home.jsx";
import Register from "./pages/Register.jsx";
import PropTypes from "prop-types";

const App = () => {

  
  const { currentUser } = useContext(AuthContext);
  
console.log(currentUser)

  const ProtectedRoute = ({ children }) => {
  
    if (!currentUser) {
      console.log("Navigating to /register");
      return <Navigate to="/register" />;
    }
    return children;
  };

  ProtectedRoute.propTypes = {
    children: PropTypes.node.isRequired,
  };

  return (
    <Routes>
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Home />
          </ProtectedRoute>
        }
      />
      <Route path="/register" element={<Register />} />
      <Route path="/*" element={<Navigate to="/" />} />
    </Routes>
  );
};

export default App;
