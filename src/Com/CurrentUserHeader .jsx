import { Avatar } from "@mui/material";
import { signOut } from "firebase/auth";
import LogoutIcon from "@mui/icons-material/Logout";
import { useContext, useState } from "react";
import MoreVertIcon from "@mui/icons-material/MoreVert";

import { auth } from "../../firebaseconfig";

import { AuthContext } from "../Contexts/AuthContext";

const CurrentUserHeader = () => {
  const { currentUser } = useContext(AuthContext);
  console.log(currentUser);
  const [toggleMore, setToggleMore] = useState(false);
  return (
    <div className="relative h-16 bg-[#121212] text-white border-b border-slate-200 flex justify-between items-center py-2 px-4">
  
      <div className="flex items-center gap-3">
        {currentUser.photoURL ? (
          <Avatar src={currentUser.photoURL} />
        ) : (
          <Avatar>{currentUser.displayName?.[0]}</Avatar>
        )}
        <h4 className="text-lg font-semibold">{currentUser.displayName}</h4>
      </div>
      <div>
        <div
          className={`cursor-pointer p-2 ${
            toggleMore ? "bg-black" : ""
          } rounded-full`}
          onClick={() => setToggleMore(!toggleMore)}
        >
          <MoreVertIcon />
        </div>
        {toggleMore && (
          <div className="absolute py-2 bg-white border rounded shadow top-14 right-4 w-44">
            {/* <Link to="/profile">
              <div className="flex items-center gap-2 px-5 py-2 cursor-pointer hover:bg-slate-100 text-slate-700">
                <PersonOutlineOutlinedIcon /> Profile
              </div>
            </Link> */}
            <div
              className="flex items-center gap-2 px-5 py-2 cursor-pointer hover:bg-slate-100 text-slate-700"
              onClick={() => signOut(auth)}
            >
              <LogoutIcon /> Logout
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CurrentUserHeader;