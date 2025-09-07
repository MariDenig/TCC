const User = require('../models/userModel');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Controller para registro de usuário
exports.registerUser = async (req, res) => {
  console.log("Chegou aqui");
  try {
    const { nome, sobrenome, email, senha } = req.body;
    // Verifica se o e-mail já existe
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'E-mail já cadastrado.' });
    }
    // Hash da senha
    const hashedPassword = await bcrypt.hash(senha, 10);
    // Cria novo usuário
    const newUser = new User({ nome, sobrenome, email, senha: hashedPassword });
    await newUser.save();
    res.status(201).json({ message: 'Usuário cadastrado com sucesso!' });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao cadastrar usuário.', error });
  }
};

// Controller para login de usuário
exports.loginUser = async (req, res) => {
  try {
    const { email, senha } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'E-mail ou senha inválidos.' });
    }
    const isMatch = await bcrypt.compare(senha, user.senha);
    if (!isMatch) {
      return res.status(400).json({ message: 'E-mail ou senha inválidos.' });
    }
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });
    res.json({ token, user: { nome: user.nome, sobrenome: user.sobrenome, email: user.email } });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao fazer login.', error });
  }
};
