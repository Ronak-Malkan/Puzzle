import { useEffect, useState } from "react";
import { ReactComponent as Plus } from "../../Utils/Plus.svg";
import { ReactComponent as Page } from "../../Utils/page.svg";

import "./side_navbar.css";


const SideNavbar = ({showSideNavBar, selectPage, setPage}) => {
    const [name, setName] = useState('');
    const [token, setToken] = useState('');
    const [pageList, setPageList] = useState([]);

    useEffect(() => {
        setName(localStorage.getItem('username'));
        setToken(localStorage.getItem('token'));
    }, []);

    useEffect(() => {
        fetchPageList();
    }, [token])

    const fetchPageList = () => {
        if(token !== '') {
            fetch('api/block/pages', {
                method: 'GET',
                headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
                }
            })
            .then(res => res.json())
            .then(res => {
                if(res.message === 'pages retrieved') {
                    console.log(res.pages);
                    setPageList(res.pages);
                }else {
                    console.log(res.error);
                }
            })
        }
    }

    const addNewPage = () => {
        if(token !== ''){
            const pageData = {
                block_type: "page",
                position: 0,
                parent: null,
                properties: true,
                children: false,
                propertiesList: [
                    {
                        "property_name": "title",
                        "value": "Untitled"
                    }
                ]
            }

            fetch('api/block/create', {
                method: 'POST',
                headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(pageData)
            })
            .then(res => res.json())
            .then(res => {
                if(res.message === 'block created') {
                    pageData.id = res.id;
                    let pages = pageList;
                    pages.push(pageData);
                    setPageList(pages);
                }else {
                    console.log(res.error);
                }
            })
        }
    }

    const provideClassName = (pageId) => {
        if(pageId === selectPage) {
            return 'page-item selected-page';
        }
        else {
            return 'page-item';
        }
    }

    const handlePageClick = (e) => {
        console.log(e.target.dataset.pageid);
        setPage(e.target.dataset.pageid);
    }

    return (
        <div className="side-navbar-container">
            {
                showSideNavBar && 
                <div>
                    <h2 className="name">{name}</h2>
                    <div className="add-new-page" onClick={addNewPage}>
                        <Plus/>
                        &nbsp;
                        Add New Page
                    </div>
                    <div className="page-list-container">
                        {pageList.map((page) =>{
                            let title;
                            for(let property of page.propertiesList){
                                if(property.property_name === 'title') title = property.value;
                            }
                            return (
                                <div onClick={handlePageClick} className={provideClassName(page.id)} key={page.id} data-pageid={`${page.id}`}>
                                    <Page/>
                                    &nbsp;&nbsp;
                                    {title}
                                </div>
                            );
                        })}
                    </div>
                </div>
            }           
        </div>
    )
}

export default SideNavbar;