// server/routes/admin.js
const express         = require('express');
const router          = express.Router();
const auth            = require('../middleware/auth');
const role            = require('../middleware/role');
const adminController = require('../controllers/adminController');

// Protect every /api/admin route
router.use(auth, role('admin'));

// ─── User management ────────────────────────────────────────────────
// list + filter
router
  .route('/users')
  .get(adminController.listUsers);            // GET  /api/admin/users

// get, update, delete
router
  .route('/users/:id')
  .get   (adminController.getUser)            // GET    /api/admin/users/:id
  .put   (adminController.updateUser)         // PUT    /api/admin/users/:id
  .delete(adminController.deleteUser);        // DELETE /api/admin/users/:id

// status-only endpoint (alias)
router
  .patch('/users/:id/status',                  // PATCH  /api/admin/users/:id/status
         adminController.changeStatus);

// impersonation
router
  .post('/users/:id/impersonate',
        adminController.impersonateUser);     // POST   /api/admin/users/:id/impersonate

// ─── Advanced reports & metrics ────────────────────────────────────
router.get('/metrics',                        // GET    /api/admin/metrics
           adminController.getMetrics);

router.get('/reports/user-activity',          // GET    /api/admin/reports/user-activity
           adminController.userActivity);

router.get('/reports/summary-trends',         // GET    /api/admin/reports/summary-trends
           adminController.summaryTrends);

router.get('/reports/export/:type',           // GET    /api/admin/reports/export/users|summaries
           adminController.exportData);

module.exports = router;
