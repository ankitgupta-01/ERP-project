const router = require('express').Router();
const ctrl = require('../controllers/authController');
const { protect, requireAdmin } = require('../middleware/authMiddleware');

router.post('/register', ctrl.register);
router.post('/login', ctrl.login);
router.get('/profile', protect, ctrl.profile);
router.post('/logout', protect, ctrl.logout);
router.post('/forgot-password', ctrl.forgotPassword);
router.post('/reset-password', ctrl.resetPassword);

router.get('/admin/users', protect, requireAdmin, ctrl.getUsers);
router.get('/admin/analytics', protect, requireAdmin, ctrl.getAnalytics);
router.patch('/admin/users/:id/role', protect, requireAdmin, ctrl.updateUserRole);
router.delete('/admin/users/:id', protect, requireAdmin, ctrl.deleteUser);

module.exports = router;
