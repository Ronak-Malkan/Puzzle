import { useCallback, useContext, useEffect, useRef, useState } from "react";
import ContentEditable from 'react-contenteditable';

import "./block.css";
import { BlockContext } from "../../context/block-context";
import { BLOCK_TYPES } from "../../Utils/block_types";

const Block = ({block}) => {

    const [content, setContent] = useState('');

    useEffect(() => {
        console.log(block);
        for(let property of block.propertiesList) {
            if(property.property_name === 'title') setContent(property.value);
        }
    }, [])

    const displayBlock = () => {
        if(block.block_type ===  BLOCK_TYPES.TEXT) {
            return (
                <div>
                    <ContentEditable className="block-text" tagName="p" disabled={false} html={content}/>
                </div>
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