import { useEffect, useState } from "react";
import TopNavbar from "../../Components/Top_Navbar/top_navbar";
import SideNavbar from "../../Components/Side_Navbar/side_navbar";
import PageDisplay from "../../Components/Page_Display/page_display";
import { useNavigate } from "react-router-dom";
import { BlockContextProvider } from "../../context/block-context";

import "./home.css";

const Home = () => {
   const [showSideNavBar, setShow] = useState(true);
   const [className, setClassName] = useState();
   const navigate = useNavigate();

   useEffect(() => {
      let token = localStorage.getItem('token');
      fetch('api/checkjwt', {
         method: 'POST',
         headers: {
         Accept: 'application/json',
         'Content-Type': 'application/json',
         'Authorization': `Bearer ${token}`
         }
     })
     .then(res => res.json())
     .then(res => {
         if(res.message === 'Authorized') {
             console.log('Authorized');
             return;
         }else {
            console.log('Unauthorized');
             navigate("/");
         }
     })
   })

   useEffect(()=> {
      if(showSideNavBar) {
         setClassName('home-container show-side-navbar');
      }
      else {
         setClassName('home-container hide-side-navbar');
      }
   }, [showSideNavBar])

   return (
      <BlockContextProvider>
         <div className={className}>
            <SideNavbar 
               showSideNavBar={showSideNavBar}
            />
            <TopNavbar showSideNavBar={showSideNavBar} setShow={setShow}/>
            <PageDisplay/>
         </div>
      </BlockContextProvider>
   );
};

export default Home;