import { onAuthStateChanged } from "firebase/auth";
import { createContext, useEffect, useState } from "react";
import PropTypes from "prop-types";
import { auth } from "../../firebaseconfig";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false); 
    });

    return () => unsubscribe();
  }, []);


  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <AuthContext.Provider value={{ currentUser }}>
      {children}
    </AuthContext.Provider>
  );
};


AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
