const express = require('express');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

// ===== BANCO SIMPLES (MEMÓRIA) =====
let keys = {};

// ===== GERAR KEY =====
function gerarKey() {
    return 'KEY-' + Math.random().toString(36).substring(2, 10).toUpperCase();
}

// ===== TEMPOS =====
function getTempo(tipo) {
    const now = Date.now();

    switch (tipo) {
        case "diaria": return now + (24 * 60 * 60 * 1000);
        case "semanal": return now + (7 * 24 * 60 * 60 * 1000);
        case "mensal": return now + (30 * 24 * 60 * 60 * 1000);
        case "trimensal": return now + (90 * 24 * 60 * 60 * 1000);
        case "lifetime": return 9999999999999;
        default: return null;
    }
}

// ===== GERAR KEY VIA PAINEL =====
app.get('/gerar', (req, res) => {
    const tipo = req.query.tipo;

    if (!tipo) return res.send("tipo invalido");

    const key = gerarKey();
    const expira = getTempo(tipo);

    keys[key] = {
        expira,
        hwid: null
    };

    res.send({
        key,
        tipo,
        expira
    });
});

// ===== VALIDAR KEY =====
app.get('/validar', (req, res) => {
    const key = req.query.key;
    const hwid = req.query.hwid;

    if (!keys[key]) {
        return res.send("invalido");
    }

    const dados = keys[key];

    // expirou
    if (Date.now() > dados.expira) {
        delete keys[key];
        return res.send("expirado");
    }

    // bind HWID
    if (!dados.hwid) {
        dados.hwid = hwid;
    } else if (dados.hwid !== hwid) {
        return res.send("hwid_mismatch");
    }

    res.send("valido");
});

// ===== LISTAR KEYS =====
app.get('/keys', (req, res) => {
    res.json(keys);
});

// ===== ROOT =====
app.get('/', (req, res) => {
    res.send("API ONLINE 🚀");
});

// ===== START =====
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log("Servidor rodando na porta " + PORT);
});
