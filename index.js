const express = require('express')
const cors = require('cors')
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config()
const port = process.env.PORT || 5000

const app = express();


app.use(cors())
app.use(express.json())



const uri = `mongodb+srv://${process.env.DB_user}:${process.env.DB_password}@cluster0.4jfewjr.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
async function run(){
try{
const postsColletion = client.db('heroJobTask').collection('posts')

app.post('/posts',async(req,res)=>{
    const post = req.body;
    const result = await postsColletion.insertOne(post);
    res.send(result)
})

app.get('/posts',async(req,res)=>{
   
    let query={}        
     cursor = postsColletion.find(query)       
    const posts = await cursor.sort({date : -1}).toArray()
    res.send(posts)
})
app.get('/posts/:id',async(req,res)=>{
    const id = req.params.id;    
    const query = {_id:ObjectId(id)}
    const result = await postsColletion.findOne(query)
    res.send(result);
})

}
finally{

}
}
run().catch(console.log())

app.get('/',async(req,res)=>{
    res.send('hero task runing')
})








app.listen(port,()=>console.log(`runing on,${port}`))