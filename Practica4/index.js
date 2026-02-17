const express = require("express");
const fs = require("fs");

const app = express();
app.use(express.json());

const PORT = 3000;
const FILE_PATH = "./tareas.json";

/* ========================= */
/* UTILIDADES TAREAS */
/* ========================= */

function leerTareas() {
    if (!fs.existsSync(FILE_PATH)) {
        fs.writeFileSync(FILE_PATH, JSON.stringify([]));
    }
    const data = fs.readFileSync(FILE_PATH);
    return JSON.parse(data);
}

function guardarTareas(tareas) {
    fs.writeFileSync(FILE_PATH, JSON.stringify(tareas, null, 2));
}

/* ========================= */
/* HEARTBEAT */
/* ========================= */

app.get("/", (req, res) => {
    res.json({
        status: "UP",
        timestamp: new Date()
    });
});

/* ========================= */
/* 1️⃣ SALUDO */
/* ========================= */

app.post("/saludo", (req, res) => {
    const { nombre } = req.body;
    res.json({
        mensaje: `Hola, ${nombre}`
    });
});

/* ========================= */
/* 2️⃣ CALCULADORA */
/* ========================= */

app.post("/calcular", (req, res) => {
    const { a, b, operacion } = req.body;
    let resultado;

    switch (operacion) {
        case "suma":
            resultado = a + b;
            break;
        case "resta":
            resultado = a - b;
            break;
        case "multiplicacion":
            resultado = a * b;
            break;
        case "division":
            if (b === 0) {
                return res.status(400).json({
                    error: "No se puede dividir entre cero"
                });
            }
            resultado = a / b;
            break;
        default:
            return res.status(400).json({
                error: "Operación inválida"
            });
    }

    res.json({ resultado });
});

/* ========================= */
/* 3️⃣ CRUD TAREAS */
/* ========================= */

app.post("/tareas", (req, res) => {
    const tareas = leerTareas();
    tareas.push(req.body);
    guardarTareas(tareas);
    res.json({ mensaje: "Tarea creada" });
});

app.get("/tareas", (req, res) => {
    const tareas = leerTareas();
    res.json(tareas);
});

app.put("/tareas/:id", (req, res) => {
    const id = parseInt(req.params.id);
    const tareas = leerTareas();

    const index = tareas.findIndex(t => t.id === id);
    tareas[index] = { ...tareas[index], ...req.body };

    guardarTareas(tareas);
    res.json({ mensaje: "Tarea actualizada" });
});

app.delete("/tareas/:id", (req, res) => {
    const id = parseInt(req.params.id);
    const tareas = leerTareas();
    const nuevas = tareas.filter(t => t.id !== id);

    guardarTareas(nuevas);
    res.json({ mensaje: "Tarea eliminada" });
});

/* ========================= */
/* 4️⃣ VALIDAR PASSWORD */
/* ========================= */

app.post("/validar-password", (req, res) => {
    const { password } = req.body;

    const esValida =
        password.length >= 8 &&
        /[A-Z]/.test(password) &&
        /[a-z]/.test(password) &&
        /[0-9]/.test(password);

    res.json({ esValida });
});

/* ========================= */
/* 5️⃣ CONVERTIR TEMPERATURA */
/* ========================= */

app.post("/convertir-temperatura", (req, res) => {
    let { valor, desde, hacia } = req.body;
    let celsius;

    if (desde === "C") celsius = valor;
    if (desde === "F") celsius = (valor - 32) * 5 / 9;
    if (desde === "K") celsius = valor - 273.15;

    let convertido;

    if (hacia === "C") convertido = celsius;
    if (hacia === "F") convertido = celsius * 9 / 5 + 32;
    if (hacia === "K") convertido = celsius + 273.15;

    res.json({
        valorOriginal: valor,
        valorConvertido: convertido
    });
});

/* ========================= */
/* 6️⃣ BUSCAR EN ARRAY */
/* ========================= */

app.post("/buscar", (req, res) => {
    const { array, elemento } = req.body;
    const indice = array.indexOf(elemento);

    res.json({
        encontrado: indice !== -1,
        indice
    });
});

/* ========================= */
/* 7️⃣ CONTAR PALABRAS */
/* ========================= */

app.post("/contar-palabras", (req, res) => {
    const { texto } = req.body;

    const palabras = texto.trim().split(/\s+/);
    const unicas = new Set(palabras);

    res.json({
        totalPalabras: palabras.length,
        totalCaracteres: texto.length,
        palabrasUnicas: unicas.size
    });
});

/* ========================= */
/* INICIAR SERVIDOR */
/* ========================= */

app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
