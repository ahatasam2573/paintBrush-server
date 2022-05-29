const express = require('express');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const jwt = require('jsonwebtoken')
const cors = require('cors');
require('dotenv').config();
const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.truyx.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

function verifyJWT(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).send({ message: 'Unauthorized access' });
    }
    const token = authHeader.split(' ')[1];
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, function (error, decoded) {
        if (error) {
            return res.status(403).send({ message: 'Forbidden Access' })
        }
        req.decoded = decoded;
        next();
    });
}

async function run() {
    try {
        await client.connect();
        const itemCollection = client.db('paint_brush').collection('items');
        const orderCollection = client.db('paint_brush').collection('orders')
        const userCollection = client.db('paint_brush').collection('users')


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

        app.put('/user/:email', verifyJWT, async (req, res) => {
            const email = req.params.email;
            const user = req.body;
            const filter = { email: email };
            const option = { upsert: true };
            const updateDoc = {
                $set: user,
            };
            const result = await userCollection.updateOne(filter, updateDoc, option);
            const token = jwt.sign({ email: email }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' });
            res.send({ result, token });
        })
        app.put('/user/admin/:email', verifyJWT, async (req, res) => {
            const email = req.params.email;

            const filter = { email: email }
            const updateDoc = {
                $set: { role: 'admin' },
            };
            const result = await userCollection.updateOne(filter, updateDoc);
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

        app.get('/admin/:email', async (req, res) => {
            const email = req.params.email;
            const user = await userCollection.findOne({ email: email })
            const isAdmin = user.role === 'admin';
            res.send({ admin: isAdmin });
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