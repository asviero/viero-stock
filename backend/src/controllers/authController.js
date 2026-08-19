const { db } = require('../config/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

exports.login = (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ error: 'Usuário e senha são obrigatórios.' });
    }

    try {
        // Busca o usuário no banco de dados
        const stmt = db.prepare('SELECT * FROM users WHERE username = ?');
        const user = stmt.get(username);

        if (!user) {
            return res.status(401).json({ error: 'Usuário não encontrado.' });
        }

        // Compara a senha enviada em texto plano com o hash salvo no banco
        const passwordIsValid = bcrypt.compareSync(password, user.password_hash);

        if (!passwordIsValid) {
            return res.status(401).json({ error: 'Senha incorreta.' });
        }

        // Gera o Token JWT com duração de 12 horas (um turno de festa)
        const token = jwt.sign(
            { id: user.id, username: user.username, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '12h' }
        );

        // Retorna sucesso com o token e os dados básicos do usuário
        res.status(200).json({
            message: 'Login realizado com sucesso',
            token: token,
            user: {
                id: user.id,
                username: user.username,
                role: user.role
            }
        });
    } catch (error) {
        console.error('Erro no login:', error);
        res.status(500).json({ error: 'Erro interno no servidor.' });
    }
};

// Lista todos os usuários (sem as senhas)
exports.getUsers = (req, res) => {
    try {
        const stmt = db.prepare('SELECT id, username, role, created_at FROM users ORDER BY role, username');
        const users = stmt.all();
        res.status(200).json(users);
    } catch (error) {
        console.error('Erro ao buscar usuários:', error);
        res.status(500).json({ error: 'Erro interno ao buscar usuários.' });
    }
};

// Cria um novo usuário
exports.createUser = (req, res) => {
    const { username, password, role } = req.body;

    if (!username || !password || !role) {
        return res.status(400).json({ error: 'Usuário, senha e cargo são obrigatórios.' });
    }

    try {
        const passwordHash = bcrypt.hashSync(password, 10);
        const stmt = db.prepare('INSERT INTO users (username, password_hash, role) VALUES (?, ?, ?)');
        stmt.run(username, passwordHash, role);
        
        res.status(201).json({ message: 'Usuário criado com sucesso!' });
    } catch (error) {
        if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
            return res.status(400).json({ error: 'Este nome de usuário já está em uso.' });
        }
        console.error('Erro ao criar usuário:', error);
        res.status(500).json({ error: 'Erro interno ao criar usuário.' });
    }
};