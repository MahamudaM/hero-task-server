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
const userColletion = client.db('heroJobTask').collection('users')

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

// comment api
app.put('/posts/:id',async(req,res)=>{
    const id = req.params.id;    
    const filter= {_id:ObjectId(id)}
    const options = { upsert: true };
    const comment = {
        $push:{
            comment:req.body.comment          
         }
    }   
    const result = await postsColletion.updateOne(filter,comment,options)
    res.send(result)
})

// like api
app.put('/likes/:id',async(req,res)=>{
    const id = req.params.id;    
    const filter= {_id:ObjectId(id)}
    const options = { upsert: true };
    const like = {
        $push:{
            likes:req.body.like          
         }
    }   
    const result = await postsColletion.updateOne(filter,like,options)
    res.send(result)
})
/*
get biggest like object
aggregate( [
  { $unwind : "$l" },
  { $group : { _id : "$_id", len : { $sum : 1 } } },
  { $sort : { len : -1 } },
  { $limit : 25 }
] )

 { $project: { 'descip':1, 'postImg':1, 'comment':1,'likes':1} },
            { $sort : { 'likes' : -1 }} ,
             {$limit : 3} , 
             
             descip,postImg,_id,comment,likes ,descip : "$descip",postImg : "$postImg", 
*/
app.get('/likePosts',async(req,res)=>{      
    const posts = await postsColletion.aggregate( [
       { $unwind : "$likes" }, 
  { $group : { _id : {descip : "$descip",postImg : "$postImg",}, len : { $sum : 1} } },
  { $sort : { len : -1 } },
  { $limit :3 } ,          
     
      ] ).toArray()
    res.send(posts)
})

// get most like post details


/*======================
 user collection api
 =======================*/
/*
query = req.body.email
doesExist = await userCollection.findOne(query)
If !doesExist
userCollection.insertOne(user)
return res.json({msg})
else
res.json({existmsg})
 */
app.post('/users',async(req,res)=>{
    const users = req.body;
    const result = await userColletion.insertOne(users);
    res.send(result)
})

app.get('/users',async(req,res)=>{
    const email = req.query.email;    
    const query = {email:email}
    const result = await userColletion.findOne(query)
    res.send(result);
})


// udate user info
app.put('/users/:id',async(req,res)=>{
    const id = req.params.id;
    const filter= {_id:ObjectId(id)}
    const options = { upsert: true };
    const updatedUser = {
        $set:{
            address:req.body.address,
            university:req.body.university,
            name:req.body.name,
            email:req.body.email
         }
    }
    
    const result = await userColletion.updateOne(filter,updatedUser,options)
    res.send(result)
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