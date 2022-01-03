const express = require('express');
const { MongoClient } = require('mongodb');
const ObjectId = require('mongodb').ObjectId;
const app = express();
const cors = require('cors');
require('dotenv').config();
const port = process.env.PORT || 5000;
// middle wear
app.use(cors());
app.use(express.json())
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.gz6qn.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function run() {
    try {
        await client.connect();
        console.log('connected');
        const database = client.db('car_shop');
        const carCollection = database.collection('cars');
        const orderCollection = database.collection('orders');
        const userCollection = database.collection('users')
        const reviewCollection = database.collection('reviews')

        //   get API
        app.get('/cars', async (req, res) => {
            const result = await carCollection.find({}).toArray()
            res.send(result)
        })
        // get single item
        app.get('/cars/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await carCollection.findOne(query);
            res.json(result)
        })
        // delete
        app.delete('/cars/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            console.log(query);
            const result = await carCollection.deleteOne(query);
            res.json(result)
        })
        // post api
        app.post('/orders', async (req, res) => {
            const order = req.body;
            const result = await orderCollection.insertOne(order)
            console.log(order)
            res.json(result)
        })
        // post api
        app.post('/addservice', async (req, res) => {
            const service = req.body
            const result = await carCollection.insertOne(service)
            res.json(result)
        })
       
        // reviews
        app.post('/review',async(req,res) =>{
            const review = req.body;
            const result = await reviewCollection.insertOne(review);
            res.json(result)
        })
         // get review
         app.get('/review',async(req,res) =>{
             const result = await reviewCollection.find({}).toArray();
             res.send(result)
         })
        app.get('/allorders',async(req,res) =>{
            const cursor = orderCollection.find({});
            const orders = await cursor.toArray();
            res.json(orders)
        })
        app.get('/orders', async (req, res) => {
            const email = req.query.email;
            // const query = { email: email }
            const cursor = orderCollection.find({email});
            const orders = await cursor.toArray();
            res.json(orders)
        })
        // app.delete('/orders/:id',async(req,res) =>{
        //     const id = req.params.id;
        //     const query = { _id: ObjectId(id) };
           
        //     const result = await orderCollection.deleteOne(query);
        //     console.log(result)
        //     res.json(result)
        // })
        app.delete('/orders/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            console.log(query);
            const result = await orderCollection.deleteOne(query);
            res.json(result)
        })
         // update order 
         app.put('/orders/:id', async (req, res) => {
            const id = req.params.id;
            const updateOrder = req.body;
            const filter = { _id: ObjectId(id) };
            const options = { upsert: true };
            const updateDoc = {
                $set: {
                    status: updateOrder.order.status
                }
            }
            const result = await orderCollection.updateOne(filter, updateDoc, options)

            console.log("updating ", updateOrder);
            res.json(result);
        })
        //    post user
        app.post('/users', async (req, res) => {
            const user = req.body;
            const result = await userCollection.insertOne(user);
            res.json(result)
        })
        app.get('/users/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email: email };
            const user = await userCollection.findOne(query);
            let isAdmin = false;
            if (user?.role === 'admin') {
                isAdmin = true
            };
            res.json({ admin: isAdmin })
        })
        // admin api
        app.put('/users/admin',async (req, res) => {
            const user = req.body;
            const filter = { email: user.email };
            const updateDoc = { $set: { role: 'admin' } };
            const result = await userCollection.updateOne(filter, updateDoc);
            res.json(result);
        })
    }

    finally {
        // await client.close()

    }

}
run().catch(console.dir)



app.get('/', (req, res) => {
    res.send('hell world')
});
app.listen(port, () => {
    console.log('runnig port', port);
})
