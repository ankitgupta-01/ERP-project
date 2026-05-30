const router = require('express').Router();
const Counter = require('../models/Counter');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/next/:type', async (req, res) => {
  try {
    const prefix = req.params.type === 'QUOTATION' ? 'QUO' : 'INV';
    const counter = await Counter.findById(`${req.user.id}:${prefix}`);
    const seq = (counter?.seq || 0) + 1;
    const year = new Date().getFullYear().toString().slice(-2);
    res.json({ next: `${prefix}-${year}-${String(seq).padStart(3, '0')}` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
