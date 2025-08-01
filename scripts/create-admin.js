require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/user.model');

async function createAdminUser() {
    try {
        // Conectar ao MongoDB
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Conectado ao MongoDB');

        // Verificar se já existe um usuário admin
        const adminExists = await User.findOne({ role: 'admin' });
        if (adminExists) {
            console.log('Já existe um usuário administrador');
            process.exit(0);
        }

        // Criar usuário admin
        const adminUser = new User({
            username: 'admin',
            password: 'admin123', // Será hasheada automaticamente pelo middleware
            role: 'admin'
        });

        await adminUser.save();
        console.log('Usuário administrador criado com sucesso!');
        console.log('Username: admin');
        console.log('Senha: admin123');
        console.log('IMPORTANTE: Altere a senha após o primeiro login!');

    } catch (error) {
        console.error('Erro ao criar usuário administrador:', error);
    } finally {
        await mongoose.disconnect();
        process.exit(0);
    }
}

createAdminUser(); 