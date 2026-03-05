require("node:dns/promises").setServers(["1.1.1.1", "8.8.8.8"]);
const MongoClient = require('mongodb').MongoClient;

function iterateFunc(doc) {
  console.log(JSON.stringify(doc, null, 4));
}

async function listDatabases(client) {
  databasesList = await client.db().admin().listDatabases();
  console.log("Databases:");
  databasesList.databases.forEach(db => console.log(` - ${db.name}`));
}

async function findAllData(client) {
  const cursor = await client.db("sample_mflix").collection("movies").find({}).limit(2);
  const results = await cursor.toArray();
  console.log("Title: ", results[0]['title']);
  console.log("Películas encontradas:");
  console.log(JSON.stringify(results, null, 2));
}

async function main() {
  const uri = "mongodb+srv://javieralberto1728_db_user:BJYhlzhfxlVfT3tF@cluster0.5qnxasc.mongodb.net/?appName=Cluster0";
  const client = new MongoClient(uri); // ← Sin opciones
  try {
    await client.connect();
    await listDatabases(client);
    await findAllData(client);
  } catch (e) {
    console.error(e);
  } finally {
    await client.close();
  }
}

main().catch(console.error);