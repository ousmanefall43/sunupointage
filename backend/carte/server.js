require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const bcrypt = require('bcrypt');
const { SerialPort } = require('serialport');
const { ReadlineParser } = require('@serialport/parser-readline');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*' },
});

const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Connexion à MongoDB
mongoose
  .connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connectée'))
  .catch((err) => console.error('Erreur de connexion MongoDB:', err));

// Modèle utilisateur
const User = mongoose.model(
  'User',
  new mongoose.Schema(
    {
      nom: String,
      prenom: String,
      email: { type: String, unique: true },
      password: String,
      rfidUID: { type: String, unique: true },
      api_token: String,
      role: { type: String, enum: ['admin', 'vigile', 'user'], default: 'user' },
    },
    { collection: 'utilisateurs' }
  )
);

// Modèle pointage
const Pointage = mongoose.model(
  'Pointage',
  new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false },
    nom: { type: String, required: false },
    prenom: { type: String, required: false },
    rfidUID: { type: String, required: true },
    status: { type: String, enum: ['AUTHORIZED', 'DENIED'], required: true },
    date: { type: String, required: true },
    firstTime: { type: String, required: false },
    secondTime: { type: String, default: null },
    createdAt: { type: Date, default: Date.now },
  })
);

// Communication avec Arduino via USB
const port = new SerialPort({ path: '/dev/ttyUSB0', baudRate: 9600 });
const parser = port.pipe(new ReadlineParser({ delimiter: '\n' }));

// Middleware pour vérifier l'authentification via JWT
const verifyToken = (req, res, next) => {
  const token = req.header('Authorization');
  if (!token) {
    return res.status(403).json({ message: 'Token manquant' });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Token invalide' });
  }
};

// Middleware pour vérifier si l'utilisateur est admin
const isAdmin = (req, res, next) => {
  if (!req.user.role || req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Accès interdit. Vous devez être admin.' });
  }
  next();
};

parser.on('data', async (data) => {
  const rawUID = data.trim();
  const uid = rawUID.replace(/^Carte détectée :\s*/, '').toUpperCase();

  console.log(`UID nettoyé reçu : ${uid}`);

  try {
    const user = await User.findOne({ rfidUID: uid });
    const now = new Date();
    const date = now.toISOString().split('T')[0]; // Date actuelle (format YYYY-MM-DD)
    const time = now.toTimeString().split(' ')[0]; // Heure actuelle (format HH:mm:ss)

    if (user) {
      console.log(`Accès autorisé pour : ${user.nom} ${user.prenom}`);

      // Création du token JWT
      const token = jwt.sign(
        { id: user._id, nom: user.nom, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
      );
      user.api_token = token;
      await user.save();

      // Vérification s'il existe déjà un pointage pour cet utilisateur et cette date
      const existingPointage = await Pointage.findOne({ userId: user._id, date });

      if (existingPointage) {
        existingPointage.secondTime = time;
        await existingPointage.save();

        console.log('Deuxième pointage enregistré :', existingPointage);
        io.emit('rfid', {
          status: 'AUTHORIZED',
          uid,
          token,
          user,
          pointage: existingPointage,
        });
      } else {
        const newPointage = new Pointage({
          userId: user._id,
          nom: user.nom,
          prenom: user.prenom,
          rfidUID: uid,
          status: 'AUTHORIZED',
          date,
          firstTime: time,
        });
        await newPointage.save();

        console.log('Premier pointage enregistré :', newPointage);
        io.emit('rfid', {
          status: 'AUTHORIZED',
          uid,
          token,
          user,
          pointage: newPointage,
        });
      }
    } else {
      console.log('Accès refusé : UID non reconnu');
      
      // Suppression de l'enregistrement dans la base de données
      io.emit('rfid', { status: 'DENIED', uid });
    }
  } catch (error) {
    console.error('Erreur lors de la vérification de l\'UID:', error);
    io.emit('rfid', { status: 'ERROR', message: 'Erreur serveur' });
  }
});

// Endpoint /login
app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }
    if (!bcrypt.compareSync(password, user.password)) {
      return res.status(401).json({ message: 'Mot de passe incorrect' });
    }

    const token = jwt.sign({ id: user._id, nom: user.nom, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });
    user.api_token = token;
    await user.save();
    
    res.json({ message: 'Connexion réussie', api_token: token, role: user.role });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error });
  }
});

// Endpoint /events pour connexion RFID
app.post('/events', async (req, res) => {
  const { rfidUID } = req.body;
  try {
    const user = await User.findOne({ rfidUID });
    if (!user) {
      return res.status(404).json({ message: 'Carte RFID non reconnue' });
    }

    const token = jwt.sign({ id: user._id, nom: user.nom, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });
    user.api_token = token;
    await user.save();

    res.json({ message: 'Connexion via RFID réussie', api_token: token, role: user.role });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error });
  }
});
// Endpoint /admin pour récupérer les utilisateurs
app.get('/admin/users', verifyToken, isAdmin, async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la récupération des utilisateurs', error });
  }
});
// Simuler le contrôle du servomoteur
app.post('/api/servo/set-angle', (req, res) => {
  const { angle } = req.body;

  if (angle === 90) {
    console.log('Servo déplacé à 90°');
    res.send({ message: 'Servo déplacé à 90°' });
  } else if (angle === 0) {
    console.log('Servo déplacé à 0°');
    res.send({ message: 'Servo déplacé à 0°' });
  } else {
    console.log('Commande inconnue reçue :', angle);
    res.status(400).send({ error: 'Commande inconnue reçue' });
  }
});

// Lancer le serveur
server.listen(PORT, () => {
  console.log(`Serveur démarré sur le port ${PORT}`);
});
