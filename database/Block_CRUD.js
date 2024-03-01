import pg from 'pg';
import dotenv from 'dotenv';
import { v4 as uuidv4 } from 'uuid';

dotenv.config();

const Pool = pg.Pool
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
})

const CREATE_BLOCK_QUERY = 'INSERT INTO blocks (id, userid, block_type, position, parent, properties, children) VALUES ($1, $2, $3, $4, $5, $6, $7);';
const INSERT_PROPERTY_QUERY = 'INSERT INTO properties (id, blockid, property_name, value) VALUES ($1, $2, $3, $4);';
const UPDATE_BLOCK_QUERY = 'UPDATE blocks SET block_type=$1, position=$2, parent=$3, properties=$4, children=$5 WHERE id=$6';
const GET_BLOCK_QUERY = 'SELECT * FROM blocks WHERE id=$1;';
const GET_PROPERTIES_QUERY = 'SELECT * FROM properties WHERE blockid=$1;';
const GET_PAGES_QUERY = 'SELECT * FROM blocks WHERE block_type=$1 AND userid=$2;';
const GET_BLOCKS_QUERY = 'SELECT * FROM blocks WHERE parent=$1 ORDER BY position';


export async function insertBlock(block) {
    block.id = uuidv4();
    await pool.query(CREATE_BLOCK_QUERY, [block.id, block.user, block.block_type, block.position, block.parent, block.properties, block.children]);
    await insertProperties(block.propertiesList, block.id);
    return block.id;
}

export async function insertProperties(propertiesList, blockId){
    propertiesList.forEach(async (property) => {
        property.id = uuidv4();
        await pool.query(INSERT_PROPERTY_QUERY, [property.id, blockId, property.property_name, property.value]);
    });
}

export async function updateBlock(block) {
    await pool.query(UPDATE_BLOCK_QUERY, [block.block_type, block.position, block.parent, block.properties, block.children, block.id]);
}

export async function getBlockById(blockId){
    let block = await pool.query(GET_BLOCK_QUERY, [blockId]);
    return block;
}

export async function getProperties(blockId) {
    let propertiesList = (await pool.query(GET_PROPERTIES_QUERY, [blockId])).rows;
    return propertiesList;
}

export async function getAllPageBlocks(userId) {
    let pages = await pool.query(GET_PAGES_QUERY, ['page',userId]);
    pages = pages.rows;
    let pageList = []
    for (const page of pages) {
        page.propertiesList = await getProperties(page.id);
        pageList.push(page);
    }
    return pageList;
}

export async function getBlocks(pageId) {
    console.log("Page Id: ", pageId);
    let blocks = await pool.query(GET_BLOCKS_QUERY, [pageId]);
    blocks = blocks.rows;
    let blockList = []
    for(const block of blocks) {
        block.propertiesList = await getProperties(block.id);
        blockList.push(block);
    }
    return blockList;
}


