require("node:dns/promises").setServers(["1.1.1.1", "8.8.8.8"]);

const express = require("express");
const { MongoClient } = require("mongodb");

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));


let client;
let database;
let collection;

// =====================
// CONEXIÓN A MONGO
// =====================
async function connectDB() {

  const uri = "mongodb+srv://javieralberto1728_db_user:BJYhlzhfxlVfT3tF@cluster0.5qnxasc.mongodb.net/?appName=Cluster0";

  client = new MongoClient(uri);
  await client.connect();

  console.log("Conectado a MongoDB");
}

// =====================
// PREPARAR BD Y COLECCIÓN
// =====================
function prepareDB() {
  const dbName = "projectsDB";   // BD nueva
  const collectionName = "projects";

  database = client.db(dbName);
  collection = database.collection(collectionName);
}

// =====================
// FUNCIÓN AUTO-INCREMENT
// =====================
async function getNextSequence(name) {

  const result = await database.collection("counters").findOneAndUpdate(
    { _id: name },
    { $inc: { sequence_value: 1 } },
    {
      returnDocument: "after",
      upsert: true
    }
  );

  // 🔥 Validación clave
  if (!result.value) {
    throw new Error("No se pudo obtener el contador");
  }

  return result.value.sequence_value;
}

// =====================
// ENDPOINT DE PRUEBA
// =====================
app.get("/ping", (req, res) => {
  console.log("ping recibido");
  res.send("pong");
});

// =====================
// INSERTAR PROYECTOS
// =====================
app.post("/projects/insert", async (req, res) => {

  const projects = req.body;

  if (!Array.isArray(projects)) {
    return res.status(400).json({ error: "Se espera un arreglo de proyectos" });
  }

  try {

    // Asignar _id autoincremental
    for (let project of projects) {
      project._id = await getNextSequence("projectId");
    }

    const result = await collection.insertMany(projects);

    res.json({
      message: `${result.insertedCount} proyectos insertados correctamente`
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.toString() });
  }
});

// =====================
// INICIAR SERVIDOR
// =====================
async function startServer() {
  try {
    await connectDB();
    prepareDB();

    app.listen(3000, () => {
      console.log("Servidor corriendo en puerto 3000");
    });

  } catch (error) {
    console.error("Error al iniciar:", error);
  }
}

startServer();