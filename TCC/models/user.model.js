const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: [true, 'Nome de usuário é obrigatório'],
        unique: true,
        trim: true,
        minlength: [3, 'Nome de usuário deve ter pelo menos 3 caracteres']
    },
    password: {
        type: String,
        required: [true, 'Senha é obrigatória'],
        minlength: [6, 'Senha deve ter pelo menos 6 caracteres']
    },
    role: {
        type: String,
        enum: ['admin', 'editor'],
        default: 'editor'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Middleware para hash da senha antes de salvar
userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next();
    
    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

// Método para comparar senhas
userSchema.methods.comparePassword = async function(candidatePassword) {
    try {
        return await bcrypt.compare(candidatePassword, this.password);
    } catch (error) {
        throw error;
    }
};

const User = mongoose.model('User', userSchema);

module.exports = User; 