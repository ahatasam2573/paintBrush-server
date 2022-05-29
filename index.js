const express = require('express');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const cors = require('cors');
require('dotenv').config();
const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.truyx.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
    try {
        await client.connect();
        const itemCollection = client.db('paint_brush').collection('items');
        const orderCollection = client.db('paint_brush').collection('orders')
        const userCollection = client.db('client').collection('users')


        app.get('/item', async (req, res) => {
            const query = {};
            const cursor = itemCollection.find(query);
            const items = await cursor.toArray();
            res.send(items);
        })
        app.get('/item/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) }
            const items = await itemCollection.findOne(query);
            res.send(items);
        })

        // app.get('/order', async (req, res) => {
        //     const purchase = req.query.purchase;
        //     const decodedEmail = req.decoded.email;
        //     if (purchase === decodedEmail) {
        //         const query = { purchase: purchase };
        //         const order = await orderCollection.find(query).toArray();
        //         res.send(order);
        //     }
        //     else {
        //         return res.status(403).send({ message: 'Forbidden Access' });
        //     }
        // })

        app.get('/user', async (req, res) => {
            const users = await userCollection.find().toArray();
            res.send(users);
        })

        app.put('/user/:email', async (req, res) => {
            const email = req.params.email;
            const user = req.body;
            const filter = { email: email };
            const option = { upsert: true };
            const updateDoc = {
                $set: user,
            };
            const result = await userCollection.updateOne(filter, updateDoc, option);
            res.send(result);
        })

        app.post('/order', async (req, res) => {
            const ordered = req.body;
            const query = { purchase: order.purchase, date: order.date, customer: order.customer };
            const exists = await orderCollection.findOne(query);
            if (exists) {
                return res.send({ success: false, order: exists });
            }
            const result = await orderCollection.insertOne(order);
            return res.send({ success: true, result });
        })

    }
    finally {

    }
}
run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('Welcome Paint Brush')
})

app.listen(port, () => {
    console.log(`Paint brush in on ${port}`);
})