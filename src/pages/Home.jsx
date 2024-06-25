import  { useContext } from "react";
import Chat from "../Com/Chat";
import Sidebar from "../Com/Sidebar";
import { chooesuser } from "../Contexts/ChooesUser"

function Home() {
  const { userClick } = useContext(chooesuser);
  const isMobile = window.innerWidth <= 468; 

  return (
    <div className="flex min-h-screen min-w-screen">
      {isMobile && userClick ? (
        <Chat />
      ) : (
        <>
          <div className="w-[100vw] lg:w-[400px] sm:w-[300px]">
            <Sidebar />
          </div>
          <div className="flex-1 hidden sm:block">
            <Chat />
          </div>
        </>
      )}
    </div>
  );
}

export default Home;
