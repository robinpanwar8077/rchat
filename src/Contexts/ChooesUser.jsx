import  { createContext, useState } from "react";
import PropTypes from 'prop-types';


export const chooesuser = createContext();

export const ChoosenUserProvider = ({ children }) => {
    const [userClick, setUserClick] = useState(false);
  
    return (
      <chooesuser.Provider value={{ userClick, setUserClick }}>
        {children}
      </chooesuser.Provider>
    );
  };
  
  ChoosenUserProvider.propTypes = {
    children: PropTypes.node.isRequired,
  };