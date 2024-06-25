import CurrentUserHeader from "./CurrentUserHeader "
import User from "./User"


function Sidebar() {
  return (
  <>
  <div className="border-e bg-[#121212]    lg:w-[400px]  text-white h-full flex flex-col">
    <CurrentUserHeader/>
    <User/>
    </div>
  </>
  )
}

export default Sidebar