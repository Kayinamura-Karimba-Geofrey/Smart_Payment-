const { NodeSSH } = require('node-ssh');

const ssh = new NodeSSH();

async function fixPermissionsAndDeploy() {
    try {
        console.log("Connecting to VPS...");
        await ssh.connect({
            host: '157.173.101.159',
            username: 'user265',
            password: '!MZ2Q9@R'
        });
        console.log("Connected.");

        // Command sequence to fix ownership, clean install, and restart
        const cmd = `
      echo "!MZ2Q9@R" | sudo -S chown -R user265:user265 /home/user265/EdgeWallet &&
      cd /home/user265/EdgeWallet/backend &&
      rm -rf node_modules package-lock.json &&
      npm install &&
      pm2 restart edgewallet-backend
    `;

        console.log("Executing fix commands...");
        const result = await ssh.execCommand(cmd, { cwd: '/home/user265' });
        console.log("[STDOUT]", result.stdout);
        console.error("[STDERR]", result.stderr);

        console.log("Fix completed");
    } catch (err) {
        console.error("Error:", err);
    } finally {
        ssh.dispose();
    }
}

fixPermissionsAndDeploy();
