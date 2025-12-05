// 🔥 NUPI CLOUD AGENT - ENHANCED FEATURES MODULE
// ALL THE POWER - SCHEDULING, AUTOMATION, SECURITY, BACKUPS, EVERYTHING

const { exec, spawn } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);
const fs = require('fs').promises;
const path = require('path');
const os = require('os');
const crypto = require('crypto');

// ==================== SCHEDULED TASKS & AUTOMATION ====================

const scheduledTasks = new Map();
let taskIdCounter = 1;

/**
 * Schedule a task to run at specific times
 * @param {Object} task - { name, command, schedule, enabled }
 * @returns {Object} Task info with ID
 */
function scheduleTask(task) {
    const taskId = `task_${taskIdCounter++}`;
    const cronExpression = task.schedule; // e.g., "0 3 * * 0" = Every Sunday at 3am
    
    scheduledTasks.set(taskId, {
        id: taskId,
        name: task.name,
        command: task.command,
        schedule: task.schedule,
        enabled: task.enabled !== false,
        created: new Date().toISOString(),
        lastRun: null,
        nextRun: calculateNextRun(cronExpression)
    });
    
    console.log(`✅ Scheduled task: ${task.name} (${taskId})`);
    
    return scheduledTasks.get(taskId);
}

/**
 * List all scheduled tasks
 */
function listScheduledTasks() {
    return Array.from(scheduledTasks.values());
}

/**
 * Delete a scheduled task
 */
function deleteScheduledTask(taskId) {
    const deleted = scheduledTasks.delete(taskId);
    return { success: deleted, taskId };
}

/**
 * Toggle task enabled status
 */
function toggleTask(taskId, enabled) {
    const task = scheduledTasks.get(taskId);
    if (task) {
        task.enabled = enabled;
        scheduledTasks.set(taskId, task);
        return { success: true, task };
    }
    return { success: false, error: 'Task not found' };
}

function calculateNextRun(cronExpression) {
    // Simplified next run calculation
    // In production, use node-cron or cron-parser
    const now = new Date();
    now.setHours(now.getHours() + 1);
    return now.toISOString();
}

// ==================== SMART FILE ORGANIZATION ====================

/**
 * Organize files in a directory by type
 */
async function organizeFilesByType(dirPath, options = {}) {
    const { dryRun = false } = options;
    
    const results = {
        organized: 0,
        categories: {},
        errors: []
    };
    
    const fileCategories = {
        'Images': ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.svg', '.webp', '.heic'],
        'Videos': ['.mp4', '.mov', '.avi', '.mkv', '.flv', '.wmv', '.webm'],
        'Documents': ['.pdf', '.doc', '.docx', '.txt', '.rtf', '.odt', '.pages'],
        'Spreadsheets': ['.xlsx', '.xls', '.csv', '.numbers'],
        'Archives': ['.zip', '.rar', '.7z', '.tar', '.gz', '.bz2'],
        'Code': ['.js', '.py', '.java', '.cpp', '.html', '.css', '.php', '.rb'],
        'Audio': ['.mp3', '.wav', '.aac', '.flac', '.m4a', '.ogg']
    };
    
    try {
        const files = await fs.readdir(dirPath);
        
        for (const file of files) {
            const fullPath = path.join(dirPath, file);
            const stats = await fs.stat(fullPath);
            
            if (stats.isFile()) {
                const ext = path.extname(file).toLowerCase();
                let category = 'Other';
                
                for (const [cat, exts] of Object.entries(fileCategories)) {
                    if (exts.includes(ext)) {
                        category = cat;
                        break;
                    }
                }
                
                if (!dryRun) {
                    const categoryDir = path.join(dirPath, category);
                    await fs.mkdir(categoryDir, { recursive: true });
                    await fs.rename(fullPath, path.join(categoryDir, file));
                }
                
                results.categories[category] = (results.categories[category] || 0) + 1;
                results.organized++;
            }
        }
        
        return results;
    } catch (error) {
        return { error: error.message };
    }
}

/**
 * Find duplicate files based on content hash
 */
async function findDuplicateFiles(dirPath, options = {}) {
    const { minSize = 1024 } = options; // Skip files smaller than 1KB
    const fileHashes = new Map();
    const duplicates = [];
    
    async function scanDir(dir) {
        try {
            const entries = await fs.readdir(dir, { withFileTypes: true });
            
            for (const entry of entries) {
                const fullPath = path.join(dir, entry.name);
                
                if (entry.isDirectory()) {
                    await scanDir(fullPath);
                } else if (entry.isFile()) {
                    const stats = await fs.stat(fullPath);
                    
                    if (stats.size >= minSize) {
                        const content = await fs.readFile(fullPath);
                        const hash = crypto.createHash('md5').update(content).digest('hex');
                        
                        if (fileHashes.has(hash)) {
                            duplicates.push({
                                original: fileHashes.get(hash),
                                duplicate: fullPath,
                                size: stats.size,
                                hash
                            });
                        } else {
                            fileHashes.set(hash, fullPath);
                        }
                    }
                }
            }
        } catch (error) {
            // Skip inaccessible directories
        }
    }
    
    await scanDir(dirPath);
    
    const totalWastedSpace = duplicates.reduce((sum, dup) => sum + dup.size, 0);
    
    return {
        duplicates,
        count: duplicates.length,
        wastedSpace: totalWastedSpace,
        wastedSpaceFormatted: formatBytes(totalWastedSpace)
    };
}

/**
 * Find large files (over specified size)
 */
async function findLargeFiles(dirPath, minSizeMB = 100) {
    const minSizeBytes = minSizeMB * 1024 * 1024;
    const largeFiles = [];
    
    async function scanDir(dir, depth = 0) {
        if (depth > 5) return; // Limit depth
        
        try {
            const entries = await fs.readdir(dir, { withFileTypes: true });
            
            for (const entry of entries) {
                const fullPath = path.join(dir, entry.name);
                
                if (entry.isDirectory() && !entry.name.startsWith('.')) {
                    await scanDir(fullPath, depth + 1);
                } else if (entry.isFile()) {
                    const stats = await fs.stat(fullPath);
                    
                    if (stats.size >= minSizeBytes) {
                        largeFiles.push({
                            path: fullPath,
                            name: entry.name,
                            size: stats.size,
                            sizeFormatted: formatBytes(stats.size),
                            modified: stats.mtime
                        });
                    }
                }
            }
        } catch (error) {
            // Skip inaccessible directories
        }
    }
    
    await scanDir(dirPath);
    
    // Sort by size descending
    largeFiles.sort((a, b) => b.size - a.size);
    
    return {
        files: largeFiles,
        count: largeFiles.length,
        totalSize: largeFiles.reduce((sum, f) => sum + f.size, 0)
    };
}

/**
 * Find unused files (not accessed in X days)
 */
async function findUnusedFiles(dirPath, daysUnused = 180) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysUnused);
    const unusedFiles = [];
    
    async function scanDir(dir, depth = 0) {
        if (depth > 5) return;
        
        try {
            const entries = await fs.readdir(dir, { withFileTypes: true });
            
            for (const entry of entries) {
                const fullPath = path.join(dir, entry.name);
                
                if (entry.isDirectory() && !entry.name.startsWith('.')) {
                    await scanDir(fullPath, depth + 1);
                } else if (entry.isFile()) {
                    const stats = await fs.stat(fullPath);
                    
                    if (stats.atime < cutoffDate) {
                        unusedFiles.push({
                            path: fullPath,
                            name: entry.name,
                            size: stats.size,
                            lastAccessed: stats.atime,
                            daysSinceAccess: Math.floor((Date.now() - stats.atime) / (1000 * 60 * 60 * 24))
                        });
                    }
                }
            }
        } catch (error) {
            // Skip inaccessible
        }
    }
    
    await scanDir(dirPath);
    
    return {
        files: unusedFiles,
        count: unusedFiles.length,
        totalSize: unusedFiles.reduce((sum, f) => sum + f.size, 0),
        daysUnused
    };
}

// ==================== BACKUP & SYNC ====================

const backupJobs = new Map();

/**
 * Create a backup of specified files/folders
 */
async function createBackup(options) {
    const {
        source,
        destination = '/tmp/nupi-backups',
        compression = true,
        incremental = false
    } = options;
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupName = `backup-${timestamp}.tar${compression ? '.gz' : ''}`;
    const backupPath = path.join(destination, backupName);
    
    try {
        await fs.mkdir(destination, { recursive: true });
        
        const compressFlag = compression ? 'czf' : 'cf';
        const command = `tar ${compressFlag} ${backupPath} -C ${path.dirname(source)} ${path.basename(source)}`;
        
        await execPromise(command);
        
        const stats = await fs.stat(backupPath);
        
        const backup = {
            id: timestamp,
            name: backupName,
            path: backupPath,
            source,
            size: stats.size,
            sizeFormatted: formatBytes(stats.size),
            created: new Date().toISOString(),
            compression
        };
        
        backupJobs.set(timestamp, backup);
        
        return backup;
    } catch (error) {
        return { error: error.message };
    }
}

/**
 * List all backups
 */
function listBackups() {
    return Array.from(backupJobs.values());
}

/**
 * Restore from backup
 */
async function restoreBackup(backupId, destination) {
    const backup = backupJobs.get(backupId);
    
    if (!backup) {
        return { error: 'Backup not found' };
    }
    
    try {
        const command = `tar xzf ${backup.path} -C ${destination}`;
        await execPromise(command);
        
        return {
            success: true,
            backup,
            restored: destination
        };
    } catch (error) {
        return { error: error.message };
    }
}

// ==================== SYSTEM HEALTH ALERTS ====================

const healthAlerts = [];
const healthThresholds = {
    diskSpaceMin: 10 * 1024 * 1024 * 1024, // 10GB
    memoryUsageMax: 90, // 90%
    cpuUsageMax: 85, // 85%
    processCountMax: 300
};

/**
 * Check system health and generate alerts
 */
async function checkSystemHealth() {
    const alerts = [];
    
    try {
        // Check disk space
        const { stdout: diskOutput } = await execPromise("df -k / | tail -1 | awk '{print $4}'");
        const availableSpace = parseInt(diskOutput.trim()) * 1024;
        
        if (availableSpace < healthThresholds.diskSpaceMin) {
            alerts.push({
                severity: 'high',
                type: 'disk_space',
                message: `Low disk space: ${formatBytes(availableSpace)} remaining`,
                threshold: formatBytes(healthThresholds.diskSpaceMin),
                timestamp: new Date().toISOString()
            });
        }
        
        // Check memory usage
        const totalMem = os.totalmem();
        const freeMem = os.freemem();
        const memoryUsage = ((totalMem - freeMem) / totalMem) * 100;
        
        if (memoryUsage > healthThresholds.memoryUsageMax) {
            alerts.push({
                severity: 'medium',
                type: 'memory_usage',
                message: `High memory usage: ${memoryUsage.toFixed(1)}%`,
                threshold: `${healthThresholds.memoryUsageMax}%`,
                timestamp: new Date().toISOString()
            });
        }
        
        // Check CPU load
        const loadAvg = os.loadavg()[0];
        const cpuCount = os.cpus().length;
        const cpuUsage = (loadAvg / cpuCount) * 100;
        
        if (cpuUsage > healthThresholds.cpuUsageMax) {
            alerts.push({
                severity: 'medium',
                type: 'cpu_usage',
                message: `High CPU usage: ${cpuUsage.toFixed(1)}%`,
                threshold: `${healthThresholds.cpuUsageMax}%`,
                timestamp: new Date().toISOString()
            });
        }
        
        return {
            healthy: alerts.length === 0,
            alerts,
            timestamp: new Date().toISOString()
        };
    } catch (error) {
        return { error: error.message };
    }
}

/**
 * Set custom health thresholds
 */
function setHealthThresholds(thresholds) {
    Object.assign(healthThresholds, thresholds);
    return healthThresholds;
}

/**
 * Get alert history
 */
function getAlertHistory() {
    return healthAlerts;
}

// ==================== BATCH OPERATIONS ====================

/**
 * Bulk rename files with pattern
 */
async function bulkRename(dirPath, options) {
    const { pattern, replacement, prefix, suffix } = options;
    const renamed = [];
    const errors = [];
    
    try {
        const files = await fs.readdir(dirPath);
        
        for (const file of files) {
            const fullPath = path.join(dirPath, file);
            const stats = await fs.stat(fullPath);
            
            if (stats.isFile()) {
                let newName = file;
                
                if (pattern && replacement) {
                    newName = newName.replace(new RegExp(pattern, 'g'), replacement);
                }
                
                if (prefix) {
                    newName = prefix + newName;
                }
                
                if (suffix) {
                    const ext = path.extname(newName);
                    const base = path.basename(newName, ext);
                    newName = base + suffix + ext;
                }
                
                if (newName !== file) {
                    const newPath = path.join(dirPath, newName);
                    
                    try {
                        await fs.rename(fullPath, newPath);
                        renamed.push({ from: file, to: newName });
                    } catch (err) {
                        errors.push({ file, error: err.message });
                    }
                }
            }
        }
        
        return { renamed, count: renamed.length, errors };
    } catch (error) {
        return { error: error.message };
    }
}

/**
 * Batch compress files
 */
async function batchCompress(files, outputDir = '/tmp/compressed') {
    await fs.mkdir(outputDir, { recursive: true });
    const results = [];
    
    for (const file of files) {
        try {
            const outputFile = path.join(outputDir, path.basename(file) + '.gz');
            await execPromise(`gzip -c "${file}" > "${outputFile}"`);
            
            const originalSize = (await fs.stat(file)).size;
            const compressedSize = (await fs.stat(outputFile)).size;
            const savings = ((1 - compressedSize / originalSize) * 100).toFixed(1);
            
            results.push({
                file: path.basename(file),
                originalSize: formatBytes(originalSize),
                compressedSize: formatBytes(compressedSize),
                savings: `${savings}%`,
                output: outputFile
            });
        } catch (error) {
            results.push({ file, error: error.message });
        }
    }
    
    return { results, count: results.length };
}

// ==================== SECURITY FEATURES ====================

/**
 * Encrypt a file with password
 */
async function encryptFile(filePath, password, outputPath = null) {
    if (!outputPath) {
        outputPath = filePath + '.encrypted';
    }
    
    try {
        const content = await fs.readFile(filePath);
        const cipher = crypto.createCipher('aes-256-cbc', password);
        const encrypted = Buffer.concat([cipher.update(content), cipher.final()]);
        
        await fs.writeFile(outputPath, encrypted);
        
        return {
            success: true,
            originalFile: filePath,
            encryptedFile: outputPath,
            size: encrypted.length
        };
    } catch (error) {
        return { error: error.message };
    }
}

/**
 * Decrypt a file with password
 */
async function decryptFile(filePath, password, outputPath = null) {
    if (!outputPath) {
        outputPath = filePath.replace('.encrypted', '.decrypted');
    }
    
    try {
        const content = await fs.readFile(filePath);
        const decipher = crypto.createDecipher('aes-256-cbc', password);
        const decrypted = Buffer.concat([decipher.update(content), decipher.final()]);
        
        await fs.writeFile(outputPath, decrypted);
        
        return {
            success: true,
            encryptedFile: filePath,
            decryptedFile: outputPath,
            size: decrypted.length
        };
    } catch (error) {
        return { error: error.message };
    }
}

/**
 * Secure delete (overwrite before deletion)
 */
async function secureDelete(filePath, passes = 3) {
    try {
        const stats = await fs.stat(filePath);
        const fileSize = stats.size;
        
        // Overwrite with random data
        for (let i = 0; i < passes; i++) {
            const randomData = crypto.randomBytes(fileSize);
            await fs.writeFile(filePath, randomData);
        }
        
        // Finally delete
        await fs.unlink(filePath);
        
        return {
            success: true,
            file: filePath,
            passes,
            message: 'File securely deleted'
        };
    } catch (error) {
        return { error: error.message };
    }
}

// ==================== NETWORK MONITORING ====================

/**
 * Check website uptime
 */
async function checkWebsiteUptime(url) {
    const startTime = Date.now();
    
    try {
        const response = await fetch(url, { method: 'HEAD', timeout: 10000 });
        const responseTime = Date.now() - startTime;
        
        return {
            url,
            status: response.status,
            statusText: response.statusText,
            up: response.ok,
            responseTime: `${responseTime}ms`,
            timestamp: new Date().toISOString()
        };
    } catch (error) {
        return {
            url,
            up: false,
            error: error.message,
            responseTime: null,
            timestamp: new Date().toISOString()
        };
    }
}

/**
 * Run speed test
 */
async function runSpeedTest() {
    try {
        // Simple speed test using fast.com API or similar
        const testSize = 1024 * 1024; // 1MB
        const testUrl = 'https://speed.cloudflare.com/__down?bytes=' + testSize;
        
        const startTime = Date.now();
        const response = await fetch(testUrl);
        
        // Read the response body
        const chunks = [];
        for await (const chunk of response.body) {
            chunks.push(chunk);
        }
        const buffer = Buffer.concat(chunks);
        
        const endTime = Date.now();
        
        const duration = (endTime - startTime) / 1000; // seconds
        const speedMbps = ((buffer.length * 8) / (duration * 1000000)).toFixed(2);
        
        return {
            downloadSpeed: `${speedMbps} Mbps`,
            testSize: formatBytes(buffer.length),
            duration: `${duration.toFixed(2)}s`,
            timestamp: new Date().toISOString()
        };
    } catch (error) {
        return { error: error.message };
    }
}

// ==================== SMART STORAGE ANALYSIS ====================

/**
 * Generate visual storage map
 */
async function generateStorageMap(dirPath, maxDepth = 3) {
    const storageMap = {
        path: dirPath,
        children: [],
        totalSize: 0
    };
    
    async function mapDirectory(dir, depth = 0) {
        if (depth >= maxDepth) return null;
        
        const node = {
            name: path.basename(dir),
            path: dir,
            size: 0,
            children: []
        };
        
        try {
            const entries = await fs.readdir(dir, { withFileTypes: true });
            
            for (const entry of entries) {
                const fullPath = path.join(dir, entry.name);
                
                if (entry.isDirectory() && !entry.name.startsWith('.')) {
                    const childNode = await mapDirectory(fullPath, depth + 1);
                    if (childNode) {
                        node.children.push(childNode);
                        node.size += childNode.size;
                    }
                } else if (entry.isFile()) {
                    const stats = await fs.stat(fullPath);
                    node.children.push({
                        name: entry.name,
                        path: fullPath,
                        size: stats.size,
                        isFile: true
                    });
                    node.size += stats.size;
                }
            }
            
            // Sort children by size
            node.children.sort((a, b) => b.size - a.size);
            
        } catch (error) {
            // Skip inaccessible
        }
        
        return node;
    }
    
    storageMap.children = [await mapDirectory(dirPath)];
    storageMap.totalSize = storageMap.children[0]?.size || 0;
    
    return storageMap;
}

// ==================== HELPER FUNCTIONS ====================

function formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

// ==================== EXPORTS ====================

module.exports = {
    // Scheduling
    scheduleTask,
    listScheduledTasks,
    deleteScheduledTask,
    toggleTask,
    
    // File Organization
    organizeFilesByType,
    findDuplicateFiles,
    findLargeFiles,
    findUnusedFiles,
    
    // Backup & Sync
    createBackup,
    listBackups,
    restoreBackup,
    
    // System Health
    checkSystemHealth,
    setHealthThresholds,
    getAlertHistory,
    
    // Batch Operations
    bulkRename,
    batchCompress,
    
    // Security
    encryptFile,
    decryptFile,
    secureDelete,
    
    // Network
    checkWebsiteUptime,
    runSpeedTest,
    
    // Storage Analysis
    generateStorageMap
};
