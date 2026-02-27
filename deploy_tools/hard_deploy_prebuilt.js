const { NodeSSH } = require('node-ssh');
const path = require('path');

const ssh = new NodeSSH();

async function hardDeploy() {
    try {
        console.log("Connecting to VPS...");

        await ssh.connect({
            host: '157.173.101.159',
            username: 'user265',
            password: '!MZ2Q9@R'
        });

        console.log("Connected successfully!");

        const localZip = path.join(__dirname, '..', 'deploy.zip');
        const remoteZip = '/home/user265/deploy_prebuilt.zip';
        const projectDir = '/home/user265/EdgeWalletPrebuilt';

        console.log("Uploading deploy_prebuilt.zip...");
        await ssh.putFile(localZip, remoteZip);
        console.log("Upload complete!");

        const commands = [
            // Stop old processes
            `pm2 stop edgewallet-backend || true`,
            `pm2 stop edgewallet-frontend || true`,

            // Extract directly (node_modules are bundled this time)
            `rm -rf ${projectDir}`,
            `mkdir -p ${projectDir}`,
            `unzip -q -o ~/deploy_prebuilt.zip -d ${projectDir}`,

            // Start PM2 directly! No npm install needed!
            `cd ${projectDir} && pm2 start backend/server.js --name edgewallet-backend --force`,
            `cd ${projectDir} && pm2 start frontend/server.js --name edgewallet-frontend --force`,
            `pm2 save`
        ];

        for (const cmd of commands) {
            console.log(`Running: ${cmd}`);
            const result = await ssh.execCommand(cmd, { cwd: '/home/user265' });
            if (result.stdout) console.log(`[STDOUT] ${result.stdout}`);
            if (result.stderr) console.error(`[STDERR] ${result.stderr}`);
        }

        console.log("Deployment completed successfully in EdgeWalletPrebuilt!");

    } catch (error) {
        console.error("Deployment failed:", error);
    } finally {
        ssh.dispose();
    }
}

hardDeploy();
