const { NodeSSH } = require('node-ssh');
const path = require('path');

const ssh = new NodeSSH();

async function finalPrebuiltDeploy() {
    try {
        console.log("Connecting to VPS...");
        await ssh.connect({
            host: '157.173.101.159',
            username: 'user265',
            password: '!MZ2Q9@R'
        });
        console.log("Connected.");

        const localZip = path.join(__dirname, '..', 'deploy.zip');
        const remoteZip = '/home/user265/deploy_final.zip';
        const projectDir = '/home/user265/EdgeWalletFinalPrebuilt';

        console.log("Uploading deploy.zip (the one with baked-in node modules)...");
        await ssh.putFile(localZip, remoteZip);
        console.log("Upload complete.");

        const commands = [
            `pm2 stop edgewallet-backend || true`,
            `pm2 stop edgewallet-frontend || true`,
            `pm2 delete edgewallet-backend || true`,
            `pm2 delete edgewallet-frontend || true`,

            `rm -rf ${projectDir}`,
            `mkdir -p ${projectDir}`,
            // Extract the zip that INCLUDES the fully local populated node_modules
            `unzip -q -o ~/deploy_final.zip -d ${projectDir}`,

            // IMPORTANT: Just rebuild binary bindings for Linux. Do NOT run npm install.
            `cd ${projectDir}/backend && npm rebuild`,
            `cd ${projectDir}/frontend && npm rebuild`,

            // Start with PM2
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

        console.log("Final prebuilt deployment finished.");
    } catch (err) {
        console.error("Error:", err);
    } finally {
        ssh.dispose();
    }
}

finalPrebuiltDeploy();
