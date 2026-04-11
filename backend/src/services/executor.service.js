const prisma = require('../database/prisma');

/**
 * Simulate step execution based on type.
 * In production, replace with real integrations.
 */
async function executeStep(step) {
  const delay = (ms) => new Promise((r) => setTimeout(r, ms));

  switch (step.type) {
    case 'delay': {
      const ms = step.config?.ms || 1000;
      await delay(ms);
      return { waited: ms };
    }
    case 'http_request': {
      const { url, method = 'GET' } = step.config || {};
      // Simulated response
      return { url, method, status: 200, body: { ok: true } };
    }
    case 'email': {
      const { to, subject } = step.config || {};
      return { sent: true, to, subject };
    }
    case 'condition': {
      const { expression } = step.config || {};
      return { evaluated: true, expression, result: true };
    }
    default:
      return { executed: true, type: step.type };
  }
}

/**
 * Execute a workflow run step by step.
 */
async function executeWorkflow(workflow, runId) {
  try {
    // Mark run as RUNNING
    await prisma.workflowRun.update({
      where: { id: runId },
      data: { status: 'RUNNING' },
    });

    const logs = [];

    for (const step of workflow.steps) {
      // Create StepRun record
      const stepRun = await prisma.stepRun.create({
        data: {
          workflowRunId: runId,
          stepId: step.id,
          status: 'RUNNING',
        },
      });

      try {
        const output = await executeStep(step);
        logs.push({ stepId: step.id, name: step.name, status: 'SUCCESS', output });

        await prisma.stepRun.update({
          where: { id: stepRun.id },
          data: { status: 'SUCCESS', output },
        });
      } catch (stepErr) {
        const errMsg = stepErr.message || 'Step failed';
        logs.push({ stepId: step.id, name: step.name, status: 'FAILED', error: errMsg });

        await prisma.stepRun.update({
          where: { id: stepRun.id },
          data: { status: 'FAILED', error: errMsg },
        });

        // Fail the entire run on step failure
        await prisma.workflowRun.update({
          where: { id: runId },
          data: { status: 'FAILED', finishedAt: new Date(), error: errMsg, logs },
        });
        return;
      }
    }

    // All steps passed
    await prisma.workflowRun.update({
      where: { id: runId },
      data: { status: 'SUCCESS', finishedAt: new Date(), logs },
    });

    console.log(`✅ Workflow run ${runId} completed successfully`);
  } catch (err) {
    console.error(`❌ Workflow run ${runId} failed:`, err);
    await prisma.workflowRun.update({
      where: { id: runId },
      data: { status: 'FAILED', finishedAt: new Date(), error: err.message },
    }).catch(() => {});
  }
}
//exporting the module
module.exports = { executeWorkflow };
