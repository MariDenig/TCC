const jwt = require('jsonwebtoken');
const User = require('../models/user.model');

const protect = async (req, res, next) => {
    try {
        // Verificar se o token existe no header
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ message: 'Não autorizado - Token não fornecido' });
        }

        // Extrair o token
        const token = authHeader.split(' ')[1];

        // Verificar o token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Buscar o usuário
        const user = await User.findById(decoded.userId).select('-password');
        if (!user) {
            return res.status(401).json({ message: 'Não autorizado - Usuário não encontrado' });
        }

        // Adicionar o usuário ao request
        req.user = user;
        next();
    } catch (error) {
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ message: 'Não autorizado - Token inválido' });
        }
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ message: 'Não autorizado - Token expirado' });
        }
        res.status(500).json({ message: 'Erro interno do servidor' });
    }
};

// Middleware para verificar se o usuário é admin
const isAdmin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        res.status(403).json({ message: 'Acesso negado - Requer privilégios de administrador' });
    }
};

module.exports = { protect, isAdmin }; 