import { useEffect, useState } from "react";
import TopNavbar from "../../Components/Top_Navbar/top_navbar";
import SideNavbar from "../../Components/Side_Navbar/side_navbar";
import PageDisplay from "../../Components/Page_Display/page_display";
import { useNavigate } from "react-router-dom";

import "./home.css";

const Home = () => {
   const [showSideNavBar, setShow] = useState(true);
   const [className, setClassName] = useState();
   const [selectPage, setPage] = useState('');
   const [selectedPageName, setPageName] = useState('');
   const [pageList, setPageList] = useState([]);
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
   }, [])

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
         <SideNavbar 
            showSideNavBar={showSideNavBar} selectPage={selectPage} setPage={setPage} setPageName={setPageName} pageList={pageList} setPageList={setPageList}
         />
         <TopNavbar showSideNavBar={showSideNavBar} setShow={setShow} selectedPageName={selectedPageName}/>
         <PageDisplay selectPage={selectPage} selectedPageName={selectedPageName} pageList={pageList} setPageList={setPageList} setPageName={setPageName}/>
      </div>
   );
};

export default Home;