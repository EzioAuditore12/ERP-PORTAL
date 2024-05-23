const express = require('express');
const path = require('path');

const PORT = 3000;
const app = express();

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

const userstore = {}; // Define the userstore object

app.post('/register', (req, res) => {
    const { username, password } = req.body;
    const id = `user_${Date.now()}`;

    const user = {
        id,
        username,
        password
    };

    userstore[id] = user;

    console.log(`Registration is successful: ${JSON.stringify(userstore[id])}`);

    return res.json({ success: true, id });
});

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
