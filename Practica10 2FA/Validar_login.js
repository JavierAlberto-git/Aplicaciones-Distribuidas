require("node:dns/promises").setServers(["1.1.1.1", "8.8.8.8"]);

const express = require("express");
const { MongoClient } = require("mongodb");
const crypto = require("crypto");

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

let client;
let database;
let collection;

// =====================
// HASH SHA-256
// =====================
function hashSHA256(password) {
  return crypto
    .createHash("sha256")
    .update(password)
    .digest("hex");
}

// =====================
// CONEXIÓN
// =====================
async function connectDB() {
  const uri = "mongodb+srv://javieralberto1728_db_user:BJYhlzhfxlVfT3tF@cluster0.5qnxasc.mongodb.net/?appName=Cluster0";

  client = new MongoClient(uri);
  await client.connect();

  console.log("Conectado a MongoDB");
}

// =====================
// BD Y COLECCIÓN
// =====================
function prepareDB() {
  const dbName = "2FA";
  const collectionName = "Users"; // 👈 corregido

  database = client.db(dbName);
  collection = database.collection(collectionName);
}

// =====================
// HEARTBEAT
// =====================
app.get("/usuarios", (req, res) => {
  res.json({
    status: "OK",
    message: "Servicio activo"
  });
});

// =====================
// LOGIN (USERNAME O EMAIL)
// =====================
app.post("/usuarios/validar_login", async (req, res) => {

  const { identifier, password } = req.body;
  // identifier puede ser username o email

  if (!identifier || !password) {
    return res.status(400).json({
      error: "Faltan credenciales"
    });
  }

  try {

    const hashedPassword = hashSHA256(password);

    // 🔍 Buscar por username o email
    const user = await collection.findOne({
      $or: [
        { username: identifier },
        { email: identifier }
      ]
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Usuario no existe"
      });
    }

    // 🔐 Validar password
    if (user.password !== hashedPassword) {
      return res.status(401).json({
        success: false,
        message: "Password incorrecto"
      });
    }

    // ✅ Login correcto
    res.json({
      success: true,
      message: "Login correcto",
      user: {
        username: user.username,
        email: user.email
      }
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Error interno"
    });
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