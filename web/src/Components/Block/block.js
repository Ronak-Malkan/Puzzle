import { useContext, useEffect, useRef, useState } from "react";
import ContentEditable from 'react-contenteditable';

import "./block.css";
import { BlockContext } from "../../context/block-context";
import { BLOCK_TYPES } from "../../Utils/block_types";
import sanitizeHtml from 'sanitize-html';

const Block = ({block, newBlockRef, createBlock}) => {
    const jwtToken = useRef('');
    const [content, setContent] = useState('');
    const contentRef = useRef('');
    const {setBlockList, focusId, blockListRef} = useContext(BlockContext);
    const blockRef = useRef(null);

    const sanitizeHTMLConfig = {
        disallowedTagsMode: 'discard',
        allowedTags: [
        ],
    }

    useEffect(() => {
        for(let property of block.propertiesList) {
            if(property.property_name === 'title') {
                setContent(property.value);
                contentRef.current = property.value;
            }
        }
        jwtToken.current = localStorage.getItem('token');
    }, [])

    useEffect(() => {
        if(focusId === block.id && blockRef.current !== null){
            setTimeout(() => blockRef.current.focus(), 0);
        }
    }, [focusId])
    

    const updateProperty = (value) => {
        let propData = {
            blockId: block.id,
            property: {
                property_name: 'title',
                value: value
            }
        }
        fetch('api/block/updateprop', {
            method: 'POST',
            headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${jwtToken.current}`
            },
            body: JSON.stringify(propData)
        })
        .then(res => res.json())
        .then(res => {
            if(res.message !== 'property updated') {
                console.log(res.error);
            }
        })
    }

    const onBlockBlur = (e) => {
        updateProperty(e.target.innerHTML);
    }

    const onBlockKeyDown = (e, nextFocus, type) => {
        if(e.key === 'Enter'){
            e.preventDefault();
            updateProperty(e.target.textContent);
            if(nextFocus === 0) setTimeout(() => newBlockRef.current.focus(), 0);
            else if(nextFocus === 1) {
                createBlock('', type, 1);
            }
        }
        else if(e.key === 'Backspace' && (contentRef.current === '' || contentRef.current === '<br>')) {
            fetch('api/block/delete', {
                method: 'DELETE',
                headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${jwtToken.current}`
                },
                body: JSON.stringify({blockId: block.id})
            })
            .then(res => res.json())
            .then(res => {
                if(res.message === 'block deleted') {
                    setTimeout(() => newBlockRef.current.focus(), 0);
                    const updatedList = blockListRef.current.filter((Block) => Block.id !== block.id);
                    setBlockList([...updatedList]);
                }
            })
        }
    }

    const handleBlockChange = (e) => {
        //const sanitizedHTML = sanitizeHtml(e.target.value, sanitizeHTMLConfig);
        setContent(e.target.value);
        contentRef.current = e.target.value;
    }

    const displayBlock = () => {
        if(block.block_type ===  BLOCK_TYPES.TEXT) {
            return (
                <div>
                    <ContentEditable innerRef={blockRef} className="block-text" placeholder="Enter text" onChange={handleBlockChange} onBlur={onBlockBlur} onKeyDown={(e) => onBlockKeyDown(e, 0, '')} tagName="p" disabled={false} html={content}/>
                </div>
            )
        }
        else if(block.block_type === BLOCK_TYPES.HEADING1) {
            return (
                <div>
                    <ContentEditable innerRef={blockRef} className="block-heading1" placeholder="Enter Heading 1" onChange={handleBlockChange} onBlur={onBlockBlur} onKeyDown={(e) => onBlockKeyDown(e, 0, '')} tagName="h1" disabled={false} html={content}/>
                </div>
            )
        }
        else if(block.block_type === BLOCK_TYPES.HEADING2) {
            return (
                <div>
                    <ContentEditable innerRef={blockRef} className="block-heading2" placeholder="Enter Heading 2" onChange={handleBlockChange} onBlur={onBlockBlur} onKeyDown={(e) => onBlockKeyDown(e, 0, '')} tagName="h2" disabled={false} html={content}/>
                </div>
            )
        }
        else if(block.block_type === BLOCK_TYPES.HEADING3) {
            return (
                <div>
                    <ContentEditable innerRef={blockRef} className="block-heading3" placeholder="Enter Heading 3" onChange={handleBlockChange} onBlur={onBlockBlur} onKeyDown={(e) => onBlockKeyDown(e, 0, '')} tagName="h3" disabled={false} html={content}/>
                </div>
            )
        }
        else if(block.block_type === BLOCK_TYPES.UNORDEREDLIST) {
            return (
                <ul>
                    <ContentEditable innerRef={blockRef} className="block-ul" placeholder="Enter List item" onChange={handleBlockChange} onBlur={onBlockBlur} onKeyDown={(e) => onBlockKeyDown(e, 1, BLOCK_TYPES.UNORDEREDLIST)} tagName="li" disabled={false} html={content}/>
                </ul>
            )
        }
    }

    return (
        <>
            {displayBlock()}
        </>
    )
}

export default Block;