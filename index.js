const express = require('express');

const PORT = 3000;
const app = express();

app.use('./public')

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));

