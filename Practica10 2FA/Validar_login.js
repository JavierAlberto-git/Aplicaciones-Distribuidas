// =====================
// CONFIG DNS (opcional)
// =====================
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
// FUNCIÓN HASH SHA-256
// =====================
function hashSHA256(password) {
  return crypto
    .createHash("sha256")
    .update(password)
    .digest("hex");
}

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
  const dbName = "2FA";
  const collectionName = "usuarios";

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
// VALIDAR LOGIN
// =====================
app.post("/usuarios/validar_login", async (req, res) => {

  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({
      error: "Faltan credenciales"
    });
  }

  try {

    // 🔐 Hash de la contraseña recibida
    const hashedPassword = hashSHA256(password);

    // 🔍 Buscar usuario
    const user = await collection.findOne({
      username: username,
      password: hashedPassword
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Credenciales inválidas"
      });
    }

    res.json({
      success: true,
      message: "Login correcto",
      user: {
        username: user.username
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