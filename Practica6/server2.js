require("node:dns/promises").setServers(["1.1.1.1", "8.8.8.8"]);
const MongoClient = require('mongodb').MongoClient;

function iterateFunc(doc) {
  console.log(JSON.stringify(doc, null, 4));
}

async function listDatabases(client) {
  const databasesList = await client.db().admin().listDatabases();
  console.log("Databases:");
  databasesList.databases.forEach(db => console.log(` - ${db.name}`));
}

async function findAllData(client) {

  console.log("\n===== COMMENTS =====");

  const commentsCursor = await client
    .db("sample_mflix")
    .collection("comments")
    .find({}, {
      projection: {
        _id: 1,
        name: 1,
        email: 1,
        movie_id: 1,
        text: 1
      }
    })
    .limit(5);

  const commentsResults = await commentsCursor.toArray();
  commentsResults.forEach(iterateFunc);

  console.log("\n===== EMBEDDED_MOVIES =====");

  const embeddedCursor = await client
    .db("sample_mflix")
    .collection("embedded_movies")
    .find({}, {
      projection: {
        _id: 1,
        title: 1,
        year: 1,
        runtime: 1,
        comments: 1
      }
    })
    .limit(5);

  const embeddedResults = await embeddedCursor.toArray();
  embeddedResults.forEach(iterateFunc);
}

async function main() {
  const uri = "mongodb+srv://javieralberto1728_db_user:BJYhlzhfxlVfT3tF@cluster0.5qnxasc.mongodb.net/?appName=Cluster0";
  const client = new MongoClient(uri);

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