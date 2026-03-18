require("node:dns/promises").setServers(["1.1.1.1", "8.8.8.8"]);
// Importación de Express
var express = require("express");
var app = express();

// MongoDB
const { MongoClient } = require("mongodb");

var client = 0;
var dbName = "";
var collectionName = "";
var database = 0;
var collection = 0;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

function prepareDB() {
  dbName = "projectsDB";  // ← NUEVA BD
  collectionName = "projects";

  database = client.db(dbName);
  collection = database.collection(collectionName);
}

async function connectDB() {
  const uri =
    "mongodb+srv://javieralberto1728_db_user:BJYhlzhfxlVfT3tF@cluster0.5qnxasc.mongodb.net/?appName=Cluster0";

  client = new MongoClient(uri);
  await client.connect();
}

// Endpoint raíz
app.get("/", async function (req, res) {
  res.json({ message: "API de proyectos funcionando" });
});

// INSERTAR 5 PROYECTOS
app.post("/projects/insert", async function (req, res) {

  // Aquí defines los 5 proyectos
  const projects = [
    {
      projectId: 2022640167,
      name: "Sistema IoT",
      owner: "Javier",
      budget: 15000,
      status: "activo",
      startDate: "2026-01-10"
    },
    {
      projectId: 2022640167,
      name: "App Movil",
      owner: "Ana",
      budget: 20000,
      status: "planeacion",
      startDate: "2026-02-01"
    },
    {
      projectId: 2022640167,
      name: "Red Empresarial",
      owner: "Luis",
      budget: 50000,
      status: "activo",
      startDate: "2025-12-15"
    },
    {
      projectId: 2022640167,
      name: "Sistema Web",
      owner: "Carlos",
      budget: 12000,
      status: "finalizado",
      startDate: "2025-10-20"
    },
    {
      projectId: 2022640167,
      name: "IA Chatbot",
      owner: "Maria",
      budget: 30000,
      status: "desarrollo",
      startDate: "2026-03-01"
    }
  ];

  let result = "";

  try {
    const insertManyResult = await collection.insertMany(projects);

    result = `${insertManyResult.insertedCount} proyectos insertados correctamente`;

  } catch (err) {
    result = `Error al insertar: ${err}`;
  }

  res.json({ result: result });
});

async function startServer() {
  try {
    await connectDB();
    prepareDB();

    app.listen(3000, function () {
      console.log("Servidor corriendo en puerto 3000");
    });

  } catch (error) {
    console.error("Error al conectar con MongoDB:", error);
  }
}

startServer();

app.get("/ping", (req, res) => {
  console.log("ping recibido");
  res.send("pong");
});