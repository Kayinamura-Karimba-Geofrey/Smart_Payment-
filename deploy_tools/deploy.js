const { NodeSSH } = require('node-ssh');
const path = require('path');

const ssh = new NodeSSH();

async function deploy() {
  try {
    console.log("Connecting to VPS...");

    await ssh.connect({
      host: '157.173.101.159',
      username: 'user265',
      password: '!MZ2Q9@R'
    });

    console.log("Connected successfully!");

    // Local path to zip
    const localZip = path.join(__dirname, '..', 'deploy.zip');
    const remoteZip = '/home/user265/deploy.zip';
    const projectDir = '/home/user265/EdgeWallet';

    console.log("Uploading deploy.zip...");
    await ssh.putFile(localZip, remoteZip);
    console.log("Upload complete!");

    console.log("Executing deployment commands on the server...");

    const commands = [
      `mkdir -p ${projectDir}`,
      `unzip -o ~/deploy.zip -d ${projectDir}`,
      `cd ${projectDir}/backend && npm install`,
      `cd ${projectDir}/frontend && npm install`,
      // Stop existing processes if they exist
      `pm2 stop edgewallet-backend || true`,
      `pm2 stop edgewallet-frontend || true`,
      // Start or restart backend
      `cd ${projectDir} && pm2 start backend/server.js --name edgewallet-backend || pm2 restart edgewallet-backend`,
      // Start or restart frontend
      `cd ${projectDir} && pm2 start frontend/server.js --name edgewallet-frontend || pm2 restart edgewallet-frontend`,
      `pm2 save`
    ];

    for (const cmd of commands) {
      console.log(`Running: ${cmd}`);
      const result = await ssh.execCommand(cmd, { cwd: '/home/user265' });
      if (result.stdout) console.log(`[STDOUT] ${result.stdout}`);
      if (result.stderr) console.error(`[STDERR] ${result.stderr}`);
    }

    console.log("Deployment completed successfully!");

  } catch (error) {
    console.error("Deployment failed:", error);
  } finally {
    ssh.dispose();
  }
}

deploy();
