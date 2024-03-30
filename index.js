import express from 'express';
import dotenv from 'dotenv';
import * as path  from 'path';
import router from './routes/index.js';
import { getGlobals } from 'common-es'
const { __dirname } = getGlobals(import.meta.url)

const app = express()

dotenv.config()
const port = process.env.PORT

app.use(express.json());
app.use(express.static('./web/build'));

app.use("/api", router);

app.get('*', (req, res) => {
    res.sendFile(__dirname + '/web/build/'+'index.html');
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})