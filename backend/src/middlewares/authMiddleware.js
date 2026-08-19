const jwt = require('jsonwebtoken');

exports.verifyToken = (req, res, next) => {
    // O token geralmente vem no header: "Authorization: Bearer <token>"
    const authHeader = req.headers['authorization'];
    
    if (!authHeader) {
        return res.status(403).json({ error: 'Nenhum token fornecido. Acesso negado.' });
    }

    const token = authHeader.split(' ')[1]; // Separa o "Bearer" do token em si

    if (!token) {
        return res.status(403).json({ error: 'Formato de token inválido.' });
    }

    try {
        // Valida o token usando a chave do .env
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Injeta os dados do usuário na requisição de outras rotas
        req.user = decoded;
        next(); // Permite que a requisição continue
    } catch (err) {
        return res.status(401).json({ error: 'Token inválido ou expirado.' });
    }
};

// Middleware extra para checar se o usuário é Admin
exports.requireAdmin = (req, res, next) => {
    if (req.user && req.user.role === 'ADMIN') {
        next();
    } else {
        return res.status(403).json({ error: 'Acesso restrito apenas para Administradores.' });
    }
};