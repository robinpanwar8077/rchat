import { createContext, useReducer, useContext } from "react";
import PropTypes from 'prop-types';  
import { AuthContext } from "../Contexts/AuthContext";
export const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
  const { currentUser } = useContext(AuthContext); 

  const INITIAL_STATE = {
    chatId: "null",
    user: {}
  };

  const chatReducer = (state, action) => {
    switch(action.type) {
      case "CHANGE_USER":
        return {
          user: action.payload,
          chatId: currentUser.uid > action.payload.uid
            ? currentUser.uid + action.payload.uid
            : action.payload.uid + currentUser.uid
        };
      default:
        return state;
    }
  };

  const [state, dispatch] = useReducer(chatReducer, INITIAL_STATE);

  return (
    <ChatContext.Provider value={{ data: state, dispatch }}>
      {children}
    </ChatContext.Provider>
  );
};

ChatProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
