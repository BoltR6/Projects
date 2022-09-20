const { MongoClient, ServerApiVersion } = require('mongodb');
const fs = require('fs');
const uri = "mongodb+srv://bolt:pogging@cluster0.bxh4r.mongodb.net/Cluster0?retryWrites=true&w=majority";
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
console.log('Loading List...')
//const FULL = JSON.parse(fs.readFileSync('data/all.txt'));
console.log('Loaded!')

async function run() {
  try {
    await client.connect();
    const database = client.db("wordle");
    const all_db = database.collection("all");
		/**
		let num = 0;
		for (const [k, v] of Object.entries(FULL)) {
  		await all_db.insertOne({key:k, value:v});
			console.log('bingus')
		}
		**/
    console.log(await all_db.findOne({key:"r|a,e,o|s3|r1"}))
  } finally {
    await client.close();
  }
}
run().catch(console.dir);