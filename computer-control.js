// 🖥️ NUPI COMPUTER CONTROL MODULE
// Allows users to execute commands on their computers via the web agent

const { exec, spawn } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);
const fs = require('fs').promises;
const path = require('path');
const os = require('os');

// 🔒 Security Settings (can be customized per user)
const ALLOWED_COMMANDS = {
    // File operations
    'ls': true,
    'dir': true,
    'pwd': true,
    'cd': true,
    'mkdir': true,
    'rmdir': true,
    'cat': true,
    'type': true,
    'echo': true,
    
    // System info
    'whoami': true,
    'hostname': true,
    'uname': true,
    'systeminfo': true,
    'date': true,
    'uptime': true,
    
    // Process management
    'ps': true,
    'tasklist': true,
    'top': true,
    
    // Network
    'ping': true,
    'ipconfig': true,
    'ifconfig': true,
    'netstat': true,
    
    // File content
    'find': true,
    'grep': true,
    'wc': true,
    'head': true,
    'tail': true,
    
    // Python & Node
    'python': true,
    'python3': true,
    'node': true,
    'npm': true,
    'pip': true,
    
    // Git
    'git': true
};

// 🧠 Command Analysis - Determine what user wants to do
function analyzeCommand(message) {
    const lower = message.toLowerCase();
    
    // File operations
    if (lower.includes('list files') || lower.includes('show files') || lower.includes('what files')) {
        return { type: 'list_files', command: process.platform === 'win32' ? 'dir' : 'ls -la' };
    }
    if (lower.includes('current directory') || lower.includes('where am i')) {
        return { type: 'show_dir', command: 'pwd' };
    }
    if (lower.includes('read file') || lower.includes('show file content')) {
        const match = message.match(/["'](.+?)["']/);
        if (match) {
            return { type: 'read_file', command: `cat "${match[1]}"` };
        }
    }
    
    // System info
    if (lower.includes('system info') || lower.includes('computer info')) {
        return { type: 'system_info', command: process.platform === 'win32' ? 'systeminfo' : 'uname -a' };
    }
    if (lower.includes('disk space') || lower.includes('storage')) {
        return { type: 'disk_space', command: process.platform === 'win32' ? 'wmic logicaldisk get size,freespace,caption' : 'df -h' };
    }
    if (lower.includes('memory') || lower.includes('ram')) {
        return { type: 'memory', command: process.platform === 'win32' ? 'systeminfo | findstr Memory' : 'free -h' };
    }
    
    // Process management
    if (lower.includes('running processes') || lower.includes('show processes')) {
        return { type: 'processes', command: process.platform === 'win32' ? 'tasklist' : 'ps aux' };
    }
    
    // Network
    if (lower.includes('ip address') || lower.includes('network info')) {
        return { type: 'network', command: process.platform === 'win32' ? 'ipconfig' : 'ifconfig' };
    }
    
    // Python operations
    if (lower.includes('run python') || lower.includes('execute python')) {
        const match = message.match(/```python\n([\s\S]+?)\n```/) || message.match(/`([^`]+)`/);
        if (match) {
            return { type: 'run_python', code: match[1] };
        }
    }
    
    // Direct command execution
    if (lower.startsWith('run:') || lower.startsWith('exec:') || lower.startsWith('command:')) {
        const cmd = message.split(':')[1].trim();
        return { type: 'direct_command', command: cmd };
    }
    
    return null;
}

// 🔒 Security Check - Validate command is safe
function isCommandAllowed(command) {
    const baseCommand = command.trim().split(' ')[0];
    
    // Check against whitelist
    if (!ALLOWED_COMMANDS[baseCommand]) {
        return { allowed: false, reason: `Command '${baseCommand}' not in allowed list` };
    }
    
    // Block dangerous patterns
    const dangerousPatterns = [
        /rm\s+-rf/i,      // Force delete
        /del\s+\/[fqs]/i, // Windows force delete
        /format/i,        // Format drive
        /mkfs/i,          // Format filesystem
        /dd\s+if=/i,      // Disk write
        />\s*\/dev/i,     // Write to device
        /curl.*\|\s*bash/i, // Pipe to shell
        /wget.*\|\s*sh/i,   // Pipe to shell
        /;/,              // Command chaining
        /&&/,             // Command chaining
        /\|\|/,           // Command chaining
        /`/,              // Command substitution
        /\$\(/            // Command substitution
    ];
    
    for (const pattern of dangerousPatterns) {
        if (pattern.test(command)) {
            return { allowed: false, reason: 'Command contains dangerous pattern' };
        }
    }
    
    return { allowed: true };
}

// ⚡ Execute Command
async function executeCommand(command, options = {}) {
    const { timeout = 30000, cwd = process.cwd() } = options;
    
    try {
        const { stdout, stderr } = await execPromise(command, {
            timeout,
            cwd,
            maxBuffer: 1024 * 1024 // 1MB max output
        });
        
        return {
            success: true,
            output: stdout || stderr,
            command: command
        };
    } catch (error) {
        return {
            success: false,
            error: error.message,
            output: error.stdout || error.stderr || '',
            command: command
        };
    }
}

// 🐍 Execute Python Code
async function executePythonCode(code, options = {}) {
    const { timeout = 30000 } = options;
    
    // Create temporary Python file
    const tempFile = path.join(os.tmpdir(), `nupi_${Date.now()}.py`);
    
    try {
        await fs.writeFile(tempFile, code);
        
        const result = await executeCommand(`python3 "${tempFile}"`, { timeout });
        
        // Clean up temp file
        await fs.unlink(tempFile).catch(() => {});
        
        return result;
    } catch (error) {
        return {
            success: false,
            error: error.message,
            command: 'python3'
        };
    }
}

// 📂 Read File Content
async function readFileContent(filePath, options = {}) {
    const { maxSize = 100000 } = options; // 100KB max
    
    try {
        const stats = await fs.stat(filePath);
        
        if (stats.size > maxSize) {
            return {
                success: false,
                error: `File too large (${stats.size} bytes). Max: ${maxSize} bytes`
            };
        }
        
        const content = await fs.readFile(filePath, 'utf8');
        
        return {
            success: true,
            content: content,
            size: stats.size,
            filePath: filePath
        };
    } catch (error) {
        return {
            success: false,
            error: error.message
        };
    }
}

// 📊 Get System Information
async function getSystemInfo() {
    const info = {
        platform: os.platform(),
        arch: os.arch(),
        hostname: os.hostname(),
        username: os.userInfo().username,
        homeDir: os.homedir(),
        tempDir: os.tmpdir(),
        cpus: os.cpus().length,
        totalMemory: (os.totalmem() / (1024 ** 3)).toFixed(2) + ' GB',
        freeMemory: (os.freemem() / (1024 ** 3)).toFixed(2) + ' GB',
        uptime: (os.uptime() / 3600).toFixed(2) + ' hours',
        nodeVersion: process.version
    };
    
    return info;
}

// 🌟 Main Computer Control Handler
async function handleComputerControl(message, userId, options = {}) {
    const { allowDangerous = false, timeout = 30000 } = options;
    
    // Analyze what user wants
    const analysis = analyzeCommand(message);
    
    if (!analysis) {
        return {
            success: false,
            message: "I couldn't understand that command. Try:\n" +
                     "- 'list files' - Show files in current directory\n" +
                     "- 'system info' - Show computer information\n" +
                     "- 'run: [command]' - Execute a specific command\n" +
                     "- 'read file \"path/to/file\"' - Read file content"
        };
    }
    
    // Handle Python execution
    if (analysis.type === 'run_python') {
        const result = await executePythonCode(analysis.code, { timeout });
        return {
            success: result.success,
            type: 'python',
            output: result.output,
            error: result.error
        };
    }
    
    // Handle file reading
    if (analysis.type === 'read_file') {
        const result = await readFileContent(analysis.command.replace(/cat|type/, '').trim().replace(/["']/g, ''));
        return {
            success: result.success,
            type: 'file_content',
            content: result.content,
            error: result.error
        };
    }
    
    // Handle system info request
    if (analysis.type === 'system_info') {
        const info = await getSystemInfo();
        return {
            success: true,
            type: 'system_info',
            data: info
        };
    }
    
    // Security check for command execution
    const securityCheck = isCommandAllowed(analysis.command);
    if (!securityCheck.allowed && !allowDangerous) {
        return {
            success: false,
            message: `⚠️ Security: ${securityCheck.reason}`,
            command: analysis.command
        };
    }
    
    // Execute the command
    const result = await executeCommand(analysis.command, { timeout });
    
    return {
        success: result.success,
        type: analysis.type,
        command: result.command,
        output: result.output,
        error: result.error
    };
}

module.exports = {
    handleComputerControl,
    executeCommand,
    executePythonCode,
    readFileContent,
    getSystemInfo,
    analyzeCommand,
    isCommandAllowed
};
