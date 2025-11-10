-- Create blocks table
CREATE TABLE IF NOT EXISTS blocks (
    id UUID PRIMARY KEY,
    user_id INTEGER NOT NULL,
    block_type VARCHAR(50) NOT NULL,
    position INTEGER NOT NULL DEFAULT 0,
    parent_id UUID REFERENCES blocks(id) ON DELETE CASCADE,
    page_id UUID REFERENCES blocks(id) ON DELETE CASCADE,
    properties BOOLEAN DEFAULT FALSE,
    children BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create properties table
CREATE TABLE IF NOT EXISTS properties (
    id SERIAL PRIMARY KEY,
    block_id UUID NOT NULL REFERENCES blocks(id) ON DELETE CASCADE,
    property_name VARCHAR(100) NOT NULL,
    value TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX idx_blocks_user_id ON blocks(user_id);
CREATE INDEX idx_blocks_page_id ON blocks(page_id);
CREATE INDEX idx_blocks_parent_id ON blocks(parent_id);
CREATE INDEX idx_blocks_type ON blocks(block_type);
CREATE INDEX idx_properties_block_id ON properties(block_id);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_blocks_updated_at BEFORE UPDATE ON blocks
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_properties_updated_at BEFORE UPDATE ON properties
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
