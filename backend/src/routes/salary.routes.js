const router = require('express').Router();
const c = require('../controllers/salary.controller');
router.get('/',              c.getAllSalaries);
router.post('/generate',     c.generateSalary);
router.get('/:employeeId',   c.getSalarySimulation);
module.exports = router;
