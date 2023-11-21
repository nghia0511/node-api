import express from 'express';
const app = express()

const HOST_NAME = 'localhost';
const PORT = 3000;

app.get('/', function (req, res) {
  res.send('Hello World')
})

app.listen(PORT, HOST_NAME, () => {
  console.log(`Server listening on ${HOST_NAME}:${PORT}`)
});