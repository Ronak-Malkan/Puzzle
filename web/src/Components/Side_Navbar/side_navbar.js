import { useEffect, useState } from "react";
import { ReactComponent as Plus } from "../../Utils/Plus.svg";

import "./side_navbar.css";

const SideNavbar = ({showSideNavBar}) => {
    const [name, setName] = useState('');
    useEffect(() => {

        setName(localStorage.getItem('username'))
    }, [])
    return (
        <div className="side-navbar-container">
            {
                showSideNavBar && 
                <div>
                    <h2 className="name">{name}</h2>
                    <h4 className="add-new-page">
                        <Plus/>
                        &nbsp;
                        Add New Page
                    </h4>
                </div>
            }           
        </div>
    )
}

export default SideNavbar;