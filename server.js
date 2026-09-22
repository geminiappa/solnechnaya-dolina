const express = require('express');
const mongoose = require('mongoose');
const path = require('path');

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Подключение к MongoDB (используйте переменную окружения MONGO_URI на Render или локальную строку)
const MONGO_URI = process.env.MONGO_URI || 'mongodb+srv://admin:ivanryseki228@cluster0.xcwevz2.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';

mongoose.connect(MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('✅ Успешное подключение к MongoDB');
}).catch(err => {
  console.error('❌ Ошибка подключения к MongoDB:', err);
});

// Схема сохранения игрока
const playerSchema = new mongoose.Schema({
  playerId: { type: String, required: true, unique: true },
  data: { type: Object, required: true },
  updatedAt: { type: Date, default: Date.now }
});

const PlayerSave = mongoose.model('PlayerSave', playerSchema);

// API: Получить сохранение
app.get('/api/save/:playerId', async (req, res) => {
  try {
    const save = await PlayerSave.findOne({ playerId: req.params.playerId });
    if (!save) {
      return res.status(404).json({ error: 'Сохранение не найдено' });
    }
    res.json(save.data);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// API: Сохранить прогресс
app.post('/api/save', async (req, res) => {
  try {
    const { playerId, data } = req.body;
    if (!playerId || !data) {
      return res.status(400).json({ error: 'Неверные данные' });
    }

    await PlayerSave.findOneAndUpdate(
      { playerId },
      { data, updatedAt: Date.now() },
      { upsert: true, new: true }
    );

    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Сервер запущен на порту ${PORT}`);
});