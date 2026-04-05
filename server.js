const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');

const app = express();
app.use(cors());
app.use(express.json());

const planos = {
    diario: 1,
    semanal: 7,
    mensal: 30,
    trimensal: 90,
    lifetime: 9999
};

let keys = [];

// gerar key
app.post('/generate', (req, res) => {
    const { plano } = req.body;

    const dias = planos[plano] || 1;
    const key = uuidv4().split('-')[0].toUpperCase();

    keys.push({
        key,
        hwid: null,
        expires: Date.now() + (1000 * 60 * 60 * 24 * dias),
        plano,
        banned: false
    });

    res.json({ key });
});

// validar key
app.post('/validate', (req, res) => {
    const { key, hwid } = req.body;

    const k = keys.find(x => x.key === key);

    if (!k) return res.json({ valid: false, msg: "Key inválida" });
    if (k.banned) return res.json({ valid: false, msg: "Banida" });
    if (Date.now() > k.expires)
        return res.json({ valid: false, msg: "Expirada" });

    if (!k.hwid) {
        k.hwid = hwid;
    } else if (k.hwid !== hwid) {
        return res.json({ valid: false, msg: "HWID inválido" });
    }

    res.json({
        valid: true,
        expires: k.expires,
        plano: k.plano
    });
});

// listar keys
app.get('/keys', (req, res) => {
    res.json(keys);
});

app.listen(3000, () => console.log("API rodando na porta 3000"));