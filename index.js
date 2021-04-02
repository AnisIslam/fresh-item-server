const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const MongoClient = require('mongodb').MongoClient;
const ObjectID = require('mongodb').ObjectID;

require('dotenv').config()

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.1ldzw.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;

const app = express()

app.use(bodyParser.json());
app.use(cors());
const port = 4000;

app.get('/', (req, res) => {
    res.send("hello from db. It's working.")
})

console.log(process.env.DB_USER);

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {
    const productsCollection = client.db("myShop").collection("products");
    const ordersCollection = client.db("myShop").collection("orders");
    console.log('db connected');

    //Post data at db server
    app.post('/addProduct', (req, res) => {
        const newProduct = req.body;
        console.log('adding new product', newProduct);
        productsCollection.insertOne(newProduct)
            .then(result => {
                console.log(result.insertedCount);
                res.send(result.insertedCount > 0)
            })
    })


    app.get('/products', (req, res) => {
        productsCollection.find({})
            .toArray((err, items) => {
                res.send(items);
            })
    })

    app.get('/checkOut/:name', (req, res) => {
        productsCollection.find({ name: req.params.name })
            .toArray((err, items) => {
                res.send(items[0]);
            });
    });

    app.delete('/deleteProduct/:id', (req, res) => {
        const id = ObjectID(req.params.id);
        // console.log('delete this', id);
        productsCollection.findOneAndDelete({ _id: id })
            .then(documents => res.send(!!documents.value))

    })

    // For order
    app.post('/addOrder', (req, res) => {
        const order = req.body;
        console.log(order);
        ordersCollection.insertOne(order)
            .then(result => {
                res.send(result.insertedCount > 0)
            })
    })

    // Find orders by mail
    app.get('/orders', (req, res) => {
        ordersCollection.find({ email: req.query.email })
            .toArray((err, documents) => {
                res.send(documents);
            })
    })

});

app.listen(process.env.PORT || port)
