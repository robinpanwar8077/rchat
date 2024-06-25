import SearchIcon from "@mui/icons-material/Search";
import {AuthContext} from "../Contexts/AuthContext"
import { useContext, useEffect, useState } from "react";
import { where, query, collection, getDocs,setDoc,updateDoc,getDoc,doc,serverTimestamp, onSnapshot } from "firebase/firestore";
import { db } from "../../firebaseconfig";
import { Avatar } from "@mui/material";
import { ChatContext, } from "../Contexts/Chatauth";
import { chooesuser } from "../Contexts/ChooesUser"
const User = () => {
const {currentUser} =useContext(AuthContext)

const{dispatch} =useContext(ChatContext)
  const [username, setUsername] = useState("");
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);
  const[chats ,setChats] = useState([]);
 
const {setUserClick} =useContext(chooesuser)
  useEffect(()=>{
const getChats=()=>{
  const unsub =onSnapshot(doc(db,"userchats",currentUser.uid),(doc)=>{setChats(doc.data())})

  return ()=>{
    unsub()
  }

}
currentUser.uid&& getChats()


  },[currentUser.uid])
 console.log(chats);
  const handleSearch = async () => {
    const q = query(collection(db, "users"), where("displayName", "==", username));

    try {
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        querySnapshot.forEach((doc) => {
          setUser(doc.data());
        });
      } else {
        setUser(null);
        setError("No user found");
      }
    } catch (error) {
      console.log(error);
      setError("Error fetching user");
    }
  };

  const handleKeyDown = (e) => {
    if (e.code === "Enter") {
      handleSearch();
    }
  };

  console.log(user);
  const handleSelected = async () => {
    if (currentUser.length === 0) return;  
  
    const selectedUser = user;
    const combinedId = currentUser.uid > selectedUser.uid ? currentUser.uid + selectedUser.uid : selectedUser.uid + currentUser.uid;
   console.log(combinedId);
    try {
      const res = await getDoc(doc(db, "chats", combinedId));
      if (res.exists()) {
        await setDoc(doc(db, "chats", combinedId), { messages: [] });
  
        await updateDoc(doc(db, "userchats", currentUser.uid), {
          [`${combinedId}.userinfo`]: {
            uid: selectedUser.uid,
            displayName: selectedUser.displayName,
            photoURL:selectedUser.photoURL
          },
          [`${combinedId}.date`]: serverTimestamp(),
        });
      console.log("ok");
        await updateDoc(doc(db, "userchats", selectedUser.uid), {
          [`${combinedId}.userinfo`]: {
            uid: currentUser.uid,
            displayName: currentUser.displayName,
            photoURL:currentUser.photoURL
          },
          [`${combinedId}.date`]: serverTimestamp(),
        });
        console.log("ok2");
        setUser(null)
        setUsername("")
      }
    } catch (error) {
      console.log(error);
    }
  };

  const userSelected=(u)=>{
    console.log("object,",u);
   dispatch({type:"CHANGE_USER",payload:u})
   setUserClick(true)
  }
  console.log(chats);

  return (

    <div className="overflow-y-auto  h-[calc(100vh-128px)] p-2">
      <div className="flex flex-col mr-4 ">
        <div className="flex bg-[#121212]   border-[#CCCFD0] border-[1px] items-center gap-2 px-4  text-sm py-2 m-2    rounded-lg  w-full">
          <SearchIcon className="w-20 h-auto text-slate-500" />
          <input
            type="text"
            className="w-full text-white outline-none bg-inherit"
            placeholder="Search user..."
            onChange={(e) => setUsername(e.target.value)}
            value={username}
            onKeyDown={handleKeyDown}
          />
        </div>
        {error && <div className="text-red-500">{error}</div>}
      {user && (
        <div onClick={() => handleSelected(user)}   className="flex items-center gap-2 p-3 rounded-lg cursor-pointer">
        <Avatar src={user.photoURL} />
          <div>
            <h4>{user.displayName}</h4>
          
          </div>
        </div>
      )}
      </div>
     
      {Object.entries(chats).sort((a,b)=>b[1].date-a[1].date).map((chat)=>(

        <div  key={chat[0]}  onClick={()=>userSelected(chat[1].userinfo)} className="flex items-center gap-2 p-3 rounded-lg cursor-pointer">
        <Avatar src={chat[1].userinfo.photoURL} />
          <div>
            <h4>{chat[1].userinfo.displayName}</h4>
            {/* <h6>{chat[1].lastmessage.text}</h6> */}
          
          </div>
        </div>


      ))}
    </div>
  );
};

export default User;
