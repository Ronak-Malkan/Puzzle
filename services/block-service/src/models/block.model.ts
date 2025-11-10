import { v4 as uuidv4 } from 'uuid';
import { query } from '../config/database';
import {  Block, CreateBlockDTO, UpdateBlockDTO, Property } from '../types/block.types';

export const createBlock = async (blockData: CreateBlockDTO): Promise<string> => {
  const id = uuidv4();
  const {
    user_id,
    block_type,
    position,
    parent_id,
    page_id,
    properties = false,
    children = false,
  } = blockData;

  await query(
    `INSERT INTO blocks (id, user_id, block_type, position, parent_id, page_id, properties, children)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
    [id, user_id, block_type, position, parent_id, page_id || null, properties, children]
  );

  // Insert properties if provided
  if (blockData.properties_list && blockData.properties_list.length > 0) {
    for (const prop of blockData.properties_list) {
      await query(
        'INSERT INTO properties (block_id, property_name, value) VALUES ($1, $2, $3)',
        [id, prop.property_name, prop.value]
      );
    }
  }

  return id;
};

export const getBlockById = async (id: string): Promise<Block | null> => {
  const result = await query('SELECT * FROM blocks WHERE id = $1', [id]);

  if (result.rows.length === 0) {
    return null;
  }

  const block = result.rows[0];

  // Get properties if the block has them
  if (block.properties) {
    const propsResult = await query(
      'SELECT property_name, value FROM properties WHERE block_id = $1',
      [id]
    );
    block.properties_list = propsResult.rows;
  }

  return block;
};

export const getBlocksByPageId = async (pageId: string): Promise<Block[]> => {
  const result = await query(
    'SELECT * FROM blocks WHERE page_id = $1 ORDER BY position ASC',
    [pageId]
  );

  const blocks = result.rows;

  // Fetch properties for each block
  for (const block of blocks) {
    if (block.properties) {
      const propsResult = await query(
        'SELECT property_name, value FROM properties WHERE block_id = $1',
        [block.id]
      );
      block.properties_list = propsResult.rows;
    }
  }

  return blocks;
};

export const getAllPages = async (userId: number): Promise<Block[]> => {
  const result = await query(
    `SELECT * FROM blocks WHERE user_id = $1 AND block_type = 'page' ORDER BY position ASC`,
    [userId]
  );

  const pages = result.rows;

  // Fetch properties for each page
  for (const page of pages) {
    const propsResult = await query(
      'SELECT property_name, value FROM properties WHERE block_id = $1',
      [page.id]
    );
    page.properties_list = propsResult.rows;
  }

  return pages;
};

export const updateBlock = async (blockData: UpdateBlockDTO): Promise<void> => {
  const { id, block_type, position, parent_id } = blockData;

  const updates: string[] = [];
  const values: any[] = [];
  let paramCounter = 1;

  if (block_type !== undefined) {
    updates.push(`block_type = $${paramCounter++}`);
    values.push(block_type);
  }

  if (position !== undefined) {
    updates.push(`position = $${paramCounter++}`);
    values.push(position);
  }

  if (parent_id !== undefined) {
    updates.push(`parent_id = $${paramCounter++}`);
    values.push(parent_id);
  }

  updates.push(`updated_at = NOW()`);
  values.push(id);

  await query(
    `UPDATE blocks SET ${updates.join(', ')} WHERE id = $${paramCounter}`,
    values
  );
};

export const updateProperty = async (
  blockId: string,
  property: Property
): Promise<void> => {
  await query(
    `UPDATE properties SET value = $1 WHERE block_id = $2 AND property_name = $3`,
    [property.value, blockId, property.property_name]
  );
};

export const updatePositions = async (
  blockUpdates: { id: string; position: number }[]
): Promise<void> => {
  for (const update of blockUpdates) {
    await query('UPDATE blocks SET position = $1 WHERE id = $2', [
      update.position,
      update.id,
    ]);
  }
};

export const deleteBlock = async (id: string): Promise<void> => {
  // Delete properties first
  await query('DELETE FROM properties WHERE block_id = $1', [id]);

  // Delete the block (children will be deleted by CASCADE)
  await query('DELETE FROM blocks WHERE id = $1', [id]);
};
