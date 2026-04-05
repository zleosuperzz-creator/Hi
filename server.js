const express = require("express");
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cors());

// ===== BANCO EM MEMÓRIA =====
let keys = {};

// ===== GERAR KEY =====
function gerarKey() {
    return "KEY-" + Math.random().toString(36).substring(2, 10).toUpperCase();
}

// ===== TEMPO =====
function getDuracao(tipo) {
    switch (tipo) {
        case "diaria": return 1;
        case "semanal": return 7;
        case "mensal": return 30;
        case "trimensal": return 90;
        case "lifetime": return 9999;
        default: return 0;
    }
}

// ===== GERAR KEY =====
app.post("/gerar", (req, res) => {
    const { tipo } = req.body;

    if (!tipo) return res.status(400).send("tipo invalido");

    const key = gerarKey();
    const dias = getDuracao(tipo);

    const expira = Date.now() + dias * 24 * 60 * 60 * 1000;

    keys[key] = {
        tipo,
        hwid: null,
        expira
    };

    res.json({
        key,
        tipo,
        expira
    });
});

// ===== VALIDAR KEY =====
app.get("/validar", (req, res) => {
    const { key, hwid } = req.query;

    if (!key || !hwid) return res.send("invalido");

    if (!keys[key]) return res.send("invalido");

    const data = keys[key];

    // expirou
    if (Date.now() > data.expira) {
        delete keys[key];
        return res.send("expirado");
    }

    // primeira vez (bind HWID)
    if (!data.hwid) {
        data.hwid = hwid;
        return res.send("valido");
    }

    // outro pc
    if (data.hwid !== hwid) {
        return res.send("hwid_mismatch");
    }

    return res.send("valido");
});

// ===== LISTAR KEYS =====
app.get("/keys", (req, res) => {
    res.json(keys);
});

// ===== DELETAR KEY =====
app.delete("/key/:key", (req, res) => {
    const key = req.params.key;

    if (keys[key]) {
        delete keys[key];
        return res.send("deletado");
    }

    res.send("nao existe");
});

// ===== ROOT =====
app.get("/", (req, res) => {
    res.send("API ONLINE 🚀");
});

// ===== START (OBRIGATÓRIO PRA RENDER) =====
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log("Servidor rodando na porta " + PORT);
});
