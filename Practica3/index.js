const express = require("express");
const crypto = require("crypto");
const app = express();

app.use(express.json());

/* -------------------------------------------
   Función auxiliar para validar cadenas
--------------------------------------------*/
function validarCadenas(req, res, campos) {
    for (let campo of campos) {
        if (!(campo in req.body)) {
            res.json({
                error: `El parámetro '${campo}' es requerido`
            });
            return false;
        }
        if (typeof req.body[campo] !== "string") {
            res.json({
                error: `El parámetro '${campo}' debe ser una cadena`
            });
            return false;
        }
    }
    return true;
}

/* -------------------------------------------
   i. mascaracteres
--------------------------------------------*/
app.post("/mascaracteres", (req, res) => {
    if (!validarCadenas(req, res, ["cad1", "cad2"])) return;

    const { cad1, cad2 } = req.body;

    const resultado = cad1.length >= cad2.length ? cad1 : cad2;

    res.json({ resultado });
});

/* -------------------------------------------
   ii. menoscaracteres
--------------------------------------------*/
app.post("/menoscaracteres", (req, res) => {
    if (!validarCadenas(req, res, ["cad1", "cad2"])) return;

    const { cad1, cad2 } = req.body;

    const resultado = cad1.length <= cad2.length ? cad1 : cad2;

    res.json({ resultado });
});

/* -------------------------------------------
   iii. numcaracteres
--------------------------------------------*/
app.post("/numcaracteres", (req, res) => {
    if (!validarCadenas(req, res, ["cadena"])) return;

    res.json({
        cadena: req.body.cadena,
        numCaracteres: req.body.cadena.length
    });
});

/* -------------------------------------------
   iv. palindroma
--------------------------------------------*/
app.post("/palindroma", (req, res) => {
    if (!validarCadenas(req, res, ["cadena"])) return;

    const cad = req.body.cadena.toLowerCase();
    const invertida = cad.split("").reverse().join("");

    res.json({
        cadena: req.body.cadena,
        palindroma: cad === invertida
    });
});

/* -------------------------------------------
   v. concat
--------------------------------------------*/
app.post("/concat", (req, res) => {
    if (!validarCadenas(req, res, ["cad1", "cad2"])) return;

    res.json({
        resultado: req.body.cad1 + req.body.cad2
    });
});

/* -------------------------------------------
   vi. applysha256
--------------------------------------------*/
app.post("/applysha256", (req, res) => {
    if (!validarCadenas(req, res, ["cadena"])) return;

    const hash = crypto.createHash("sha256")
                       .update(req.body.cadena)
                       .digest("hex");

    res.json({
        original: req.body.cadena,
        sha256: hash
    });
});

/* -------------------------------------------
   vii. verifysha256
--------------------------------------------*/
app.post("/verifysha256", (req, res) => {
    if (!validarCadenas(req, res, ["cadenaNormal", "cadenaEncriptada"])) return;

    const hash = crypto.createHash("sha256")
                       .update(req.body.cadenaNormal)
                       .digest("hex");

    res.json({
        coincide: hash === req.body.cadenaEncriptada
    });
});

/* -------------------------------------------
   Servidor
--------------------------------------------*/
app.listen(3000, () => {
    console.log("Servidor ejecutándose en http://localhost:3000");
});
