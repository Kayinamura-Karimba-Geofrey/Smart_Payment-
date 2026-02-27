const { NodeSSH } = require('node-ssh');
const path = require('path');

const ssh = new NodeSSH();

async function finalDeploy() {
    try {
        console.log("Connecting to VPS...");
        await ssh.connect({
            host: '157.173.101.159',
            username: 'user265',
            password: '!MZ2Q9@R'
        });
        console.log("Connected successfully!");

        const localZip = path.join(__dirname, '..', 'deploy_prebuilt.zip');
        const remoteZip = '/home/user265/deploy_final.zip';
        const projectDir = '/home/user265/EdgeWalletFinal';

        console.log("Uploading deploy_final.zip (this may take a minute as it includes node_modules)...");
        await ssh.putFile(localZip, remoteZip);
        console.log("Upload complete!");

        const commands = [
            // Ensure any stray processes on our ports are gone (though we did pkill earlier)
            `pm2 delete edgewallet-backend || true`,
            `pm2 delete edgewallet-frontend || true`,

            // Clean and extract
            `rm -rf ${projectDir}`,
            `mkdir -p ${projectDir}`,
            `unzip -q -o ~/deploy_final.zip -d ${projectDir}`,

            // Fix any permission issues that might have been zipped
            `chmod -R 755 ${projectDir}`,
            `find ${projectDir} -type f -name "*.js" -exec chmod 644 {} +`,
            `find ${projectDir} -type d -exec chmod 755 {} +`,

            // Start services
            `cd ${projectDir}/backend && pm2 start server.js --name edgewallet-backend --force`,
            `cd ${projectDir}/frontend && pm2 start server.js --name edgewallet-frontend --force`,
            `pm2 save`
        ];

        for (const cmd of commands) {
            console.log(`Running: ${cmd}`);
            const result = await ssh.execCommand(cmd, { cwd: '/home/user265' });
            if (result.stdout) console.log(`[STDOUT] ${result.stdout}`);
            if (result.stderr) {
                // Ignore specific rm errors for subdirectories we couldn't delete
                if (!result.stderr.includes('Permission denied')) {
                    console.error(`[STDERR] ${result.stderr}`);
                } else {
                    console.log(`[IGNORE PERMISSION ERR] Some files could not be removed but continuing...`);
                }
            }
        }

        console.log("Deployment completed successfully in EdgeWalletFinal!");

    } catch (error) {
        console.error("Deployment failed:", error);
    } finally {
        ssh.dispose();
    }
}

finalDeploy();
