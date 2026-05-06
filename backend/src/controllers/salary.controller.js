const prisma = require('../database/prisma');

const getSalarySimulation = async (req, res, next) => {
  try {
    const { employeeId } = req.params;
    const now = new Date();
    const m = req.query.month ? parseInt(req.query.month) - 1 : now.getMonth();
    const y = req.query.year  ? parseInt(req.query.year)      : now.getFullYear();
    const start = new Date(y, m, 1);
    const end   = new Date(y, m + 1, 0);

    const employee = await prisma.employee.findUnique({ where: { id: employeeId } });
    if (!employee) return res.status(404).json({ error: 'Employee not found' });

    const attendances = await prisma.attendance.findMany({
      where: { employeeId, date: { gte: start, lte: end } },
    });
    const salaryLogs = await prisma.actionLog.findMany({
      where: {
        employeeId, status: 'SUCCESS',
        actionType: { in: ['DeductSalary', 'AddBonus'] },
        executedAt: { gte: start, lte: end },
      },
      include: { rule: { select: { name: true } } },
    });

    let totalDeductions = 0, totalBonuses = 0;
    for (const log of salaryLogs) {
      const r = log.result || {};
      if (log.actionType === 'DeductSalary') totalDeductions += r.deductionAmount || 0;
      if (log.actionType === 'AddBonus')     totalBonuses    += r.bonusAmount     || 0;
    }

    res.json({
      employee:   { id: employee.id, name: employee.name, department: employee.department, role: employee.role },
      month: m + 1, year: y,
      attendance: {
        workingDays:    end.getDate(),
        presentDays:    attendances.filter(a => ['PRESENT','HALF_DAY'].includes(a.status)).length,
        absentDays:     attendances.filter(a => a.status === 'ABSENT').length,
        overtimeHours:  attendances.reduce((s, a) => s + (a.overtime || 0), 0),
      },
      salary: {
        baseSalary:      employee.baseSalary,
        totalDeductions, totalBonuses,
        netSalary:       employee.baseSalary - totalDeductions + totalBonuses,
      },
      modifications: salaryLogs.map(l => ({
        type:   l.actionType,
        rule:   l.rule?.name,
        amount: l.result?.deductionAmount || l.result?.bonusAmount || 0,
        date:   l.executedAt,
      })),
    });
  } catch (err) { next(err); }
};

const getAllSalaries = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;
    
    // Determine the period to calculate for
    let start, end;
    if (startDate && endDate) {
      start = new Date(startDate);
      end = new Date(endDate);
    } else {
      const now = new Date();
      const m = req.query.month ? parseInt(req.query.month) - 1 : now.getMonth();
      const y = req.query.year  ? parseInt(req.query.year)      : now.getFullYear();
      start = new Date(y, m, 1);
      end   = new Date(y, m + 1, 0);
    }

    // 1. Get all employees
    const employees = await prisma.employee.findMany({ where: { status: 'ACTIVE' } });

    // 2. Get any stored records for this period (to show 'PAID' status if exists)
    const storedRecords = await prisma.salaryRecord.findMany({
      where: {
        inputDate:  { gte: start },
        outputDate: { lte: end },
      }
    });

    // 3. Generate simulation for all employees for this range
    const salaries = await Promise.all(employees.map(async (emp) => {
      // Check if we already have a stored record for this employee in this range
      const existing = storedRecords.find(r => r.employeeId === emp.id);
      
      if (existing) {
        return {
          id: existing.id,
          name: emp.name,
          department: emp.department,
          role: emp.role,
          baseSalary: existing.baseSalary,
          totalDeductions: existing.deductions,
          totalBonuses: existing.bonuses,
          netSalary: existing.netSalary,
          inputDate: existing.inputDate,
          outputDate: existing.outputDate,
          status: existing.status
        };
      }

      // If no stored record, simulate it
      const logs = await prisma.actionLog.findMany({
        where: { 
          employeeId: emp.id, 
          status: 'SUCCESS', 
          actionType: { in: ['DeductSalary', 'AddBonus'] }, 
          executedAt: { gte: start, lte: end } 
        },
      });

      let totalDeductions = 0, totalBonuses = 0;
      for (const l of logs) {
        const r = l.result || {};
        if (l.actionType === 'DeductSalary') totalDeductions += r.deductionAmount || 0;
        if (l.actionType === 'AddBonus')     totalBonuses    += r.bonusAmount     || 0;
      }

      return {
        id:         emp.id,
        name:       emp.name,
        department: emp.department,
        role:       emp.role,
        baseSalary: emp.baseSalary,
        totalDeductions,
        totalBonuses,
        netSalary:  emp.baseSalary - totalDeductions + totalBonuses,
        inputDate:  start,
        outputDate: end,
        status:     null // Will show as 'PROVISIONAL' in frontend
      };
    }));

    res.json(salaries);
  } catch (err) { next(err); }
};

const generateSalary = async (req, res, next) => {
  try {
    const { employeeId, startDate, endDate } = req.body;
    const start = new Date(startDate);
    const end = new Date(endDate);

    const employee = await prisma.employee.findUnique({ where: { id: employeeId } });
    if (!employee) return res.status(404).json({ error: 'Employee not found' });

    const logs = await prisma.actionLog.findMany({
      where: { employeeId, status: 'SUCCESS', actionType: { in: ['DeductSalary', 'AddBonus'] }, executedAt: { gte: start, lte: end } },
    });

    let totalDeductions = 0, totalBonuses = 0;
    for (const l of logs) {
      const r = l.result || {};
      if (l.actionType === 'DeductSalary') totalDeductions += r.deductionAmount || 0;
      if (l.actionType === 'AddBonus')     totalBonuses    += r.bonusAmount     || 0;
    }

    const netSalary = employee.baseSalary - totalDeductions + totalBonuses;

    const record = await prisma.salaryRecord.create({
      data: {
        employeeId,
        inputDate: start,
        outputDate: end,
        baseSalary: employee.baseSalary,
        deductions: totalDeductions,
        bonuses: totalBonuses,
        netSalary,
        status: 'PAID'
      }
    });

    res.status(201).json(record);
  } catch (err) { next(err); }
};

module.exports = { getSalarySimulation, getAllSalaries, generateSalary };
