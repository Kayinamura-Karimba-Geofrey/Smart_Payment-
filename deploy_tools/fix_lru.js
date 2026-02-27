const { NodeSSH } = require('node-ssh');
const ssh = new NodeSSH();

async function fixLruCache() {
    try {
        await ssh.connect({
            host: '157.173.101.159',
            username: 'user265',
            password: '!MZ2Q9@R'
        });
        console.log("Connected.");

        // We explicitly write the package.json to the lru-cache module folder
        const cmd = `
      echo '{"name": "lru-cache", "version": "10.2.0", "main": "./dist/commonjs/index.js"}' > /home/user265/EdgeWalletFinalPrebuilt/backend/node_modules/lru-cache/package.json &&
      pm2 restart edgewallet-backend &&
      sleep 2 &&
      pm2 logs edgewallet-backend --lines 20 --nostream
    `;

        const result = await ssh.execCommand(cmd);
        console.log("[STDOUT]", result.stdout);
        console.error("[STDERR]", result.stderr);

    } catch (err) {
        console.error("Error:", err);
    } finally {
        ssh.dispose();
    }
}

fixLruCache();
