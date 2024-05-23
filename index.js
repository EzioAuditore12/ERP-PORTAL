const express = require('express');

const PORT = 3000;
const app = express();

app.use('./public')

app.use(express.json())

app.post('/register',(req,res)=>{
    const{username,password} = req.body
    const id=`${Date.now()}`

    const user={
        id,
        username,
        password
    }

    userstore[id]=user

    console.log(`Registeration is sucessful${userstore[id]}`)

    return res.json({id})
})


app.listen(PORT, () => console.log(`Server started on port ${PORT}`));

