const router = require('express').Router();
const ctrl = require('../controllers/invoiceController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.post('/', ctrl.createInvoice);
router.get('/', ctrl.getAllInvoices);
router.get('/:id', ctrl.getInvoice);
router.put('/:id', ctrl.updateInvoice);
router.delete('/:id', ctrl.deleteInvoice);

module.exports = router;
