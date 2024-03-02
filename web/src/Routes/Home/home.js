import { useEffect, useState } from "react";
import TopNavbar from "../../Components/Top_Navbar/top_navbar";
import SideNavbar from "../../Components/Side_Navbar/side_navbar";
import PageDisplay from "../../Components/Page_Display/page_display";

import "./home.css";

const Home = () => {
   const [showSideNavBar, setShow] = useState(true);
   const [className, setClassName] = useState();
   const [selectPage, setPage] = useState('');

   useEffect(()=> {
      if(showSideNavBar) {
         setClassName('home-container show-side-navbar');
      }
      else {
         setClassName('home-container hide-side-navbar');
      }
   }, [showSideNavBar])

   return (
      <div className={className}>
         <SideNavbar showSideNavBar={showSideNavBar} selectPage={selectPage} setPage={setPage}/>
         <TopNavbar showSideNavBar={showSideNavBar} setShow={setShow} />
         <PageDisplay/>
      </div>
   );
};

export default Home;