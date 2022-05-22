const express = require('express')
const app = express()
const port = process.env.PORT || 5000
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const cors = require('cors')
app.use(cors())
app.use(express.json())
require('dotenv').config();
const jwt = require('jsonwebtoken');


const verifyJwt = (req, res, next) => {
    const authHeader = req.headers.authorization
    if (!authHeader) {
        return res.status(401).send({ message: "Unauthorized Access" })
    }
    const token = authHeader.split(' ')[1];
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, function (err, decoded) {
        if (err) {
            return res.status(403).send({ message: "Forbidden Access" })
        }
        req.decoded = decoded
        next()
    })
}


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.fnxrf.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });


async function run() {
    try {
        await client.connect()
        const partsCollection = client.db("Assignment_Twelve").collection("CarParts")
        const OrderCollection = client.db("Assignment_Twelve").collection("Order")

        const verifyAdmin = async (req, res, next) => {
            const requester = req.decoded.email;
            const requesterAccount = await userCollection.findOne({ email: requester });
            if (requesterAccount.role === 'admin') {
                next();
            }
            else {
                res.status(403).send({ message: 'forbidden' });
            }
        }

        app.get('/carParts', async (req, res) => {
            const query = {};
            const cursor = partsCollection.find(query);
            const carParts = await cursor.toArray();
            res.send(carParts);
        })

        app.get('/carParts/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const part = await partsCollection.findOne(query);
            res.send(part);
        });

        app.post('/myOrder', async (req, res) => {
            const Orders = req.body;
            const result = await OrderCollection.insertOne(Orders);
            res.send(result);
        });

    }
    finally {

    }
}

run().catch(console.dir)


app.get('/', (req, res) => {
    res.send('Mission Assignment 12!!!')
})

app.listen(port, () => {
    console.log(`BackEnd is Running ${port}`)
})
