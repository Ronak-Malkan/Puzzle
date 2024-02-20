const express = require('express')
const dotenv = require('dotenv');
const path = require('path');

const app = express()

dotenv.config()
const port = process.env.PORT

app.use(express.static(path.resolve(__dirname, './web/build')));

app.get('/api', (req, res) => {
  res.json({message: 'Hello World!'})
})

app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, './web/build', 'index.html'));
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})