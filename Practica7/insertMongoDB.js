// Importación del framework Express para crear el servidor web
var express = require("express");

// Se crea la aplicación Express.
// Este objeto contendrá todos los endpoints (servicios REST)
var app = express();

// Importación del cliente oficial de MongoDB
const { MongoClient } = require("mongodb");

// Variable donde se almacenará el cliente de MongoDB
var client = 0;

// Variables para almacenar el nombre de la base de datos y colección
var dbName = "";
var collectionName = "";

// Referencias a la base de datos y a la colección
var database = 0;
var collection = 0;

// Middleware de Express para permitir recibir datos en formato JSON
app.use(express.json());

// Middleware para permitir recibir datos codificados en URL
app.use(express.urlencoded({ extended: true }));

/*
Función que prepara las referencias a la base de datos y colección.
Se ejecuta después de establecer la conexión con MongoDB.
*/
function prepareDB() {

  // Nombre de la base de datos
  dbName = "myDatabase";

  // Nombre de la colección dentro de la base de datos
  collectionName = "recipes";

  // Obtiene la referencia a la base de datos
  database = client.db(dbName);

  // Obtiene la referencia a la colección
  collection = database.collection(collectionName); 
}

/*
Función asíncrona que establece la conexión con MongoDB Atlas
*/
async function connectDB() {

  // URI de conexión al cluster de MongoDB
  const uri =
    "mongodb+srv://javieralberto1728_db_user:BJYhlzhfxlVfT3tF@cluster0.5qnxasc.mongodb.net/?appName=Cluster0";

  // Creación del cliente MongoDB
  client = new MongoClient(uri);

  // Se establece la conexión con la base de datos
  await client.connect();
}

/*
Endpoint raíz del servidor
GET /
Devuelve un mensaje simple en formato JSON
*/
app.get("/", async function (request, response) {

  r = {
    message: "Nothing to send",
  };

  response.json(r);
});

/*
Servicio GET que recibe parámetros desde la URL (query parameters)

Ejemplo de llamada:
https://typesofwebservices.noesierra.repl.co/serv001?id=Nope&token=2345678dhuj43567fgh&geo=123456789,1234567890
*/
app.get("/serv001", async function (req, res) {

  // Obtiene los parámetros de la URL
  const user_id = req.query.id;
  const token = req.query.token;
  const geo = req.query.geo;

  // Construye la respuesta
  r = {
    user_id: user_id,
    token: token,
    geo: geo,
  };

  // Devuelve respuesta JSON
  res.json(r);
});

/*
Servicio GET similar al anterior.
También recibe parámetros por query string.
*/
app.get("/serv0010", async function (req, res) {

  const user_id1 = req.query.id;
  const token1 = req.query.token;
  const geo1 = req.query.geo;

  r1 = {
    user_id: user_id1,
    token: token1,
    geo: geo1,
  };

  res.json(r1);
});

/*
Servicio POST que recibe los datos en el BODY de la petición
(formato JSON)

Ejemplo de payload:

{
    "id": "nope",
    "token": "ertydfg456Dfgwerty",
    "geo": "12345678,34567890"
}
*/
app.post("/serv002", async function (req, res) {

  // Obtiene datos enviados en el body
  const user_id = req.body.id;
  const token = req.body.token;
  const geo = req.body.geo;

  // Construye respuesta
  r = {
    user_id: user_id,
    token: token,
    geo: geo,
  };

  // Devuelve JSON
  res.json(r);
});

/*
Servicio POST que recibe parámetros como parte de la URL
(usando parámetros dinámicos)

Ejemplo de llamada:
https://typesofwebservices.noesierra.repl.co/serv003/1234567
*/
app.post("/serv003/:info", async function (req, res) {

  // Obtiene el parámetro de la URL
  const info = req.params.info;

  let r = { info: info };

  res.json(r);
});

/*
Servicio POST que inserta documentos en la base de datos MongoDB
*/
app.post("/receipt/insert", async function (req, res) {

  // Documento que se insertará en la colección
  const recipes = [
    {
      name: "elotes cocidos",
      ingredients: [
        "corn",
        "mayonnaise",
        "cotija cheese",
        "sour cream",
        "lime",
      ],
      prepTimeInMinutes: 35,
    },
  ];

  let result = "";

  try {

    // Inserta múltiples documentos en la colección
    const insertManyResult = await collection.insertMany(recipes);

    console.log(
      `${insertManyResult.insertedCount} documents successfully inserted.\n`,
    );

    result = `${insertManyResult.insertedCount} documents successfully inserted.`;

  } catch (err) {

    // Manejo de error si la inserción falla
    console.error(
      `Something went wrong trying to insert the new documents: ${err}\n`,
    );

    result = `Something went wrong trying to insert the new documents: ${err}`;
  }

  // Respuesta JSON con el resultado
  let r = { result: result };

  res.json(r);
});

/*
Inicio del servidor en el puerto 3000
*/
app.listen(3000, function () {

  console.log("Aplicación ejemplo, escuchando el puerto 3000!");

  // Conexión a MongoDB
  connectDB();

  // Preparación de la base de datos y colección
  prepareDB();
});