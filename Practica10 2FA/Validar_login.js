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

const axios = require("axios");

// =====================
// GENERAR CÓDIGO 4 DÍGITOS
// =====================
function generarCodigo() {
  // Genera un número entre 1000 y 9999
  return Math.floor(1000 + Math.random() * 9000).toString();
}

// =====================
// ENVIAR MENSAJE TELEGRAM
// =====================
async function enviarTelegram(chat_id, codigo) {
  // Token que me pasaste de BotFather
  const BOT_TOKEN = "8764679530:AAH_XomQ3KrtuKtDwYkyCNTq_1EXv_7owJo";
  const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;

  try {
    await axios.post(url, {
      chat_id: chat_id,
      text: `🔐 Tu código de verificación 2FA es: ${codigo}`
    });
    console.log(`✅ Mensaje enviado con éxito al ID: ${chat_id}`);
  } catch (error) {
    console.error("❌ Error en la API de Telegram:", error.response?.data || error.message);
    throw new Error("No se pudo enviar el mensaje por Telegram");
  }
}

// =====================
// ENDPOINT 2FA
// =====================
app.post("/usuarios/validar_login/2FA", async (req, res) => {
  const { identifier } = req.body;

  if (!identifier) {
    return res.status(400).json({ error: "Falta identifier" });
  }

  try {
    // 🔍 1. Buscar usuario (Usa la colección donde tienes a 'javi')
    const user = await collection.findOne({
      $or: [
        { username: identifier },
        { email: identifier }
      ]
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Usuario no encontrado"
      });
    }

    // 🛠 VALIDACIÓN: Usamos 'telegram_id' que es el nombre en tu BD
    if (!user.telegram_id) {
      return res.status(400).json({
        success: false,
        message: "El usuario no tiene un ID de Telegram vinculado"
      });
    }

    // 🔢 2. Generar código
    const codigo = generarCodigo();

    // 📦 3. Guardar en BD '2FA' -> Colección 'DobleAutenticacion'
    // Asegúrate de que 'client' esté inicializado en tu archivo principal
    const db2FA = client.db("2FA"); 
    const dobleAuthCollection = db2FA.collection("DobleAutenticacion");

    await dobleAuthCollection.insertOne({
      username: user.username,
      codigo: codigo,
      creadoEn: new Date(),
      usado: false
    });

    // 📲 4. Enviar por Telegram usando el telegram_id de la base de datos
    await enviarTelegram(user.telegram_id, codigo);

    res.json({
      success: true,
      message: "Código 2FA enviado por Telegram exitosamente"
    });

  } catch (error) {
    console.error("🔴 Error general en 2FA:", error);
    res.status(500).json({
      success: false,
      error: "Ocurrió un error al procesar la autenticación"
    });
  }
});
