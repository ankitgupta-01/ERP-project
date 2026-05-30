const router = require('express').Router();
const ctrl   = require('../controllers/publicController');

// Public — no auth
router.get('/view/:token',      ctrl.getPublicInvoice);
router.post('/download/:token', ctrl.trackDownload);

// Protected — require auth (add your existing auth middleware here)
router.post('/share/:invoiceId',   ctrl.createShareLink);
router.get('/stats/:invoiceId',    ctrl.getShareStats);
router.delete('/share/:invoiceId', ctrl.revokeShare);

module.exports = router;