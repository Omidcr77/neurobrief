// server/routes/admin.js
const express       = require('express');
const router        = express.Router();
const auth          = require('../middleware/auth');
const role          = require('../middleware/role');
const adminController = require('../controllers/adminController');

// Protect every /api/admin route
router.use(auth, role('admin'));

// ─── User management ───
router
  .route('/users')
  .get(adminController.listUsers);            // GET /api/admin/users

router
  .route('/users/:id')
  .get   (adminController.getUser)            // GET  /api/admin/users/:id
  .put   (adminController.updateUser)         // PUT  /api/admin/users/:id
  .patch (adminController.changeStatus)       // PATCH/ api/admin/users/:id/status
  .delete(adminController.deleteUser);        // DELETE /api/admin/users/:id

router.post(
  '/users/:id/impersonate',
  adminController.impersonateUser             // POST /api/admin/users/:id/impersonate
);

// ─── Built-in metrics ───
router.get('/metrics',       adminController.getMetrics);          // GET /api/admin/metrics

// ─── Advanced reports ───
router.get(
  '/reports/user-activity',
  adminController.userActivity                  // GET /api/admin/reports/user-activity
);
router.get(
  '/reports/summary-trends',
  adminController.summaryTrends                 // GET /api/admin/reports/summary-trends
);
router.get(
  '/reports/export/:type',
  adminController.exportData                    // GET /api/admin/reports/export/users|summaries|logs
);

module.exports = router;
