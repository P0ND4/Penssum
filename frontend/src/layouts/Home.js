import SidebarHome from "../screens/home/SidebarHome";
import Main from "../screens/home/Main";
import Statistics from "../screens/home/Statistics";

function Home() {
  return (
    <div className="home">
      {/*<SidebarHome/> */}
      <Main/>
      <Statistics/>
    </div>
  );
};

export default Home;