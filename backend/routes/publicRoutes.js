const router = require('express').Router();
const ctrl = require('../controllers/publicController');
const { protect } = require('../middleware/authMiddleware');

router.get('/view/:token', ctrl.getPublicInvoice);
router.post('/download/:token', ctrl.trackDownload);

router.post('/share/:invoiceId', protect, ctrl.createShareLink);
router.get('/stats/:invoiceId', protect, ctrl.getShareStats);
router.delete('/share/:invoiceId', protect, ctrl.revokeShare);

module.exports = router;
