const express = require('express')
const app = express()
const port = process.env.PORT || 5000;
require('dotenv').config()
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

var cors = require('cors')
app.use(
    cors({
        origin: [
            "http://localhost:5173",
            
           
            
        ],
        credentials: true,
    })
);


app.use(express.json())

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.wods307.mongodb.net/?retryWrites=true&w=majority&appName=Cluste`;


const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});


async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        // await client.connect();

        const database = client.db("GadgetZone");
        const phonesCollection = database.collection("phones");


        app.get('/phones', async (req, res) => {
            const brand = req.query.brand; 
            const category = req.query.category; 
            const name = req.query.productname; 
            
            let query = {};

            if (brand && brand !== 'null') {
                query.brand = brand;
            }

            if (category && category !== 'null') {
                query.category = category;
            }

            if (name) {
                query.productname = { $regex: name, $options: "i" };
            }

            const page = parseInt(req.query.page);
            const size = parseInt(req.query.size);

          
            let price_query = {};
            let sortQuery = {};

          
            const sort = req.query.sort || "";
            if (sort === "asc") {
                price_query.price = 1; 
            } else if (sort === "dsc") {
                price_query.price = -1; 
            }

          
           
            const finalSortQuery = { ...price_query, ...sortQuery };

           
            const minPrice = parseFloat(req.query.minPrice) || 0;
            const maxPrice = parseFloat(req.query.maxPrice) || 1000;
            query.price = { $gte: minPrice, $lte: maxPrice };

          








            try {

                const allProducts = await phonesCollection.find(query)
                    .sort(finalSortQuery)
                    .skip(page * size)
                    .limit(size)
                    .toArray();

                // const result = await phonesCollection.find(query).toArray();
                // res.send(result);
                const count = await phonesCollection.countDocuments(query)
                // console.log(allProducts, count)

                res.send({
                    phones: allProducts,
                    count: count
                })
            } catch (error) {
                // console.error(error);
                res.status(500).send({ message: "Internal Server Error" });
            }
        });






        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });

        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('Gadged Zone server is running')
})

app.listen(port, () => {
    console.log(`Server is Running on port ${port}`)
})
