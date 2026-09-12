const { spawnSync } = require('node:child_process');

function run(command, args) {
  const result = spawnSync(command, args, { stdio: 'inherit', shell: process.platform === 'win32' });
  if (result.status !== 0) process.exit(result.status || 1);
}

const npx = process.platform === 'win32' ? 'npx.cmd' : 'npx';
run(npx, ['prisma', 'generate']);

if (/^postgres(?:ql)?:\/\//i.test(process.env.DATABASE_URL || '')) {
  run(npx, ['prisma', 'db', 'push', '--skip-generate']);
} else {
  console.warn('DATABASE_URL is not configured; building in non-persistent demo mode.');
}

run(npx, ['next', 'build']);
