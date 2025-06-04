const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/user.model');
const { protect } = require('../middleware/auth.middleware');

// Rota de login
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        // Validar dados de entrada
        if (!username || !password) {
            return res.status(400).json({ message: 'Por favor, forneça nome de usuário e senha' });
        }

        // Buscar usuário
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(401).json({ message: 'Credenciais inválidas' });
        }

        // Verificar senha
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Credenciais inválidas' });
        }

        // Gerar token JWT
        const token = jwt.sign(
            { userId: user._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({
            token,
            user: {
                id: user._id,
                username: user.username,
                role: user.role
            }
        });
    } catch (error) {
        console.error('Erro no login:', error);
        res.status(500).json({ message: 'Erro interno do servidor' });
    }
});

// Rota para verificar token (usado pelo frontend para validar sessão)
router.get('/verify', protect, (req, res) => {
    res.json({
        user: {
            id: req.user._id,
            username: req.user.username,
            role: req.user.role
        }
    });
});

module.exports = router; 