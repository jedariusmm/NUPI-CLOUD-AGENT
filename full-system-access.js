// 🔥 NUPI FULL SYSTEM ACCESS MODULE
// REAL FILE SCANNING, STORAGE MANAGEMENT, SYSTEM OPTIMIZATION
// NO FAKE SHIT - REAL WORK, REAL CLEANING, REAL DATA

const { exec, spawn } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);
const fs = require('fs').promises;
const path = require('path');
const os = require('os');

// 💾 User Data Storage (stores important data for optimization)
const userData = {};
const scanResults = {};
const systemHealth = {};

// 🔥 FULL FILE SYSTEM SCAN - Get EVERYTHING
async function fullSystemScan(userId, options = {}) {
    const { 
        scanPath = os.homedir(),
        includeHidden = true,
        maxDepth = 10,
        findDuplicates = true,
        findLargeFiles = true
    } = options;
    
    console.log(`🔍 FULL SYSTEM SCAN started for ${userId} at ${scanPath}`);
    
    const results = {
        userId,
        timestamp: new Date().toISOString(),
        scanPath,
        totalFiles: 0,
        totalSize: 0,
        fileTypes: {},
        largeFiles: [],
        duplicates: [],
        emptyFolders: [],
        recommendations: []
    };
    
    try {
        // Scan all files recursively
        await scanDirectory(scanPath, results, 0, maxDepth);
        
        // Find duplicates
        if (findDuplicates) {
            results.duplicates = await findDuplicateFiles(scanPath);
        }
        
        // Find large files
        if (findLargeFiles) {
            results.largeFiles = await findLargeFiles(scanPath, 100); // 100MB+
        }
        
        // Generate recommendations
        results.recommendations = generateRecommendations(results);
        
        // Store results
        scanResults[userId] = results;
        
        console.log(`✅ SCAN COMPLETE: ${results.totalFiles} files, ${formatBytes(results.totalSize)}`);
        
        return results;
    } catch (error) {
        console.error('❌ Scan error:', error);
        throw error;
    }
}

// 📂 Recursive directory scanner
async function scanDirectory(dirPath, results, depth, maxDepth) {
    if (depth > maxDepth) return;
    
    try {
        const entries = await fs.readdir(dirPath, { withFileTypes: true });
        
        if (entries.length === 0) {
            results.emptyFolders.push(dirPath);
        }
        
        for (const entry of entries) {
            const fullPath = path.join(dirPath, entry.name);
            
            // Skip system files
            if (entry.name.startsWith('.') && !entry.name.includes('Desktop')) continue;
            
            try {
                if (entry.isDirectory()) {
                    await scanDirectory(fullPath, results, depth + 1, maxDepth);
                } else if (entry.isFile()) {
                    const stats = await fs.stat(fullPath);
                    results.totalFiles++;
                    results.totalSize += stats.size;
                    
                    // Track file types
                    const ext = path.extname(entry.name).toLowerCase() || 'no-extension';
                    results.fileTypes[ext] = (results.fileTypes[ext] || 0) + 1;
                }
            } catch (err) {
                // Skip inaccessible files
                continue;
            }
        }
    } catch (err) {
        // Skip inaccessible directories
        return;
    }
}

// 🔍 Find duplicate files
async function findDuplicateFiles(scanPath) {
    const command = process.platform === 'win32' 
        ? `powershell "Get-ChildItem -Path '${scanPath}' -Recurse -File | Group-Object Length | Where-Object { $_.Count -gt 1 } | Select-Object -First 20"`
        : `find "${scanPath}" -type f -exec ls -lh {} \\; 2>/dev/null | sort -k5 | uniq -d -w 10 | head -20`;
    
    try {
        const { stdout } = await execPromise(command, { timeout: 60000 });
        return stdout.trim().split('\n').filter(line => line.length > 0);
    } catch (error) {
        return [];
    }
}

// 📦 Find large files
async function findLargeFiles(scanPath, minSizeMB = 100) {
    const command = process.platform === 'win32'
        ? `powershell "Get-ChildItem -Path '${scanPath}' -Recurse -File | Where-Object { $_.Length -gt ${minSizeMB * 1024 * 1024} } | Sort-Object Length -Descending | Select-Object -First 20 FullName,Length"`
        : `find "${scanPath}" -type f -size +${minSizeMB}M -exec ls -lh {} \\; 2>/dev/null | sort -k5 -rh | head -20`;
    
    try {
        const { stdout } = await execPromise(command, { timeout: 60000 });
        return stdout.trim().split('\n').filter(line => line.length > 0);
    } catch (error) {
        return [];
    }
}

// 🧹 STORAGE CLEANUP - Real cleaning
async function cleanupStorage(userId, options = {}) {
    const {
        deleteTempFiles = true,
        emptyTrash = true,
        clearCache = true,
        removeDuplicates = false
    } = options;
    
    console.log(`🧹 CLEANUP started for ${userId}`);
    
    const results = {
        userId,
        timestamp: new Date().toISOString(),
        freedSpace: 0,
        actions: []
    };
    
    try {
        // Clean temp files
        if (deleteTempFiles) {
            const tempCleaned = await cleanTempFiles();
            results.actions.push({ action: 'temp_cleanup', ...tempCleaned });
            results.freedSpace += tempCleaned.freedBytes || 0;
        }
        
        // Clear cache
        if (clearCache) {
            const cacheCleaned = await clearSystemCache();
            results.actions.push({ action: 'cache_cleanup', ...cacheCleaned });
            results.freedSpace += cacheCleaned.freedBytes || 0;
        }
        
        // Empty trash/recycle bin
        if (emptyTrash) {
            const trashCleaned = await emptyTrash();
            results.actions.push({ action: 'trash_cleanup', ...trashCleaned });
            results.freedSpace += trashCleaned.freedBytes || 0;
        }
        
        console.log(`✅ CLEANUP COMPLETE: Freed ${formatBytes(results.freedSpace)}`);
        
        return results;
    } catch (error) {
        console.error('❌ Cleanup error:', error);
        throw error;
    }
}

// 🗑️ Clean temp files
async function cleanTempFiles() {
    const tempDir = os.tmpdir();
    let freedBytes = 0;
    let filesDeleted = 0;
    
    try {
        const command = process.platform === 'win32'
            ? `powershell "Remove-Item -Path '${tempDir}\\*' -Recurse -Force -ErrorAction SilentlyContinue"`
            : `find "${tempDir}" -type f -mtime +1 -delete 2>/dev/null`;
        
        await execPromise(command, { timeout: 30000 });
        
        return {
            success: true,
            location: tempDir,
            filesDeleted,
            freedBytes,
            message: 'Temp files cleaned'
        };
    } catch (error) {
        return {
            success: false,
            error: error.message
        };
    }
}

// 🧹 Clear system cache
async function clearSystemCache() {
    try {
        const commands = [];
        
        if (process.platform === 'darwin') {
            // macOS cache clearing
            commands.push('rm -rf ~/Library/Caches/* 2>/dev/null');
            commands.push('rm -rf ~/Library/Logs/* 2>/dev/null');
        } else if (process.platform === 'win32') {
            commands.push('powershell "Clear-RecycleBin -Force -ErrorAction SilentlyContinue"');
            commands.push('del /q /f /s %TEMP%\\* 2>nul');
        } else {
            // Linux
            commands.push('rm -rf ~/.cache/* 2>/dev/null');
        }
        
        for (const cmd of commands) {
            await execPromise(cmd, { timeout: 30000 });
        }
        
        return {
            success: true,
            freedBytes: 0,
            message: 'Cache cleared'
        };
    } catch (error) {
        return {
            success: false,
            error: error.message
        };
    }
}

// 🗑️ Empty trash
async function emptyTrash() {
    try {
        const command = process.platform === 'darwin'
            ? 'rm -rf ~/.Trash/* 2>/dev/null'
            : process.platform === 'win32'
            ? 'powershell "Clear-RecycleBin -Force -ErrorAction SilentlyContinue"'
            : 'rm -rf ~/.local/share/Trash/* 2>/dev/null';
        
        await execPromise(command, { timeout: 30000 });
        
        return {
            success: true,
            freedBytes: 0,
            message: 'Trash emptied'
        };
    } catch (error) {
        return {
            success: false,
            error: error.message
        };
    }
}

// 🔍 DEEP SYSTEM ANALYSIS
async function deepSystemAnalysis(userId) {
    console.log(`🔬 DEEP ANALYSIS started for ${userId}`);
    
    const analysis = {
        userId,
        timestamp: new Date().toISOString(),
        hardware: await getHardwareInfo(),
        storage: await getStorageInfo(),
        performance: await getPerformanceInfo(),
        network: await getNetworkInfo(),
        processes: await getProcessInfo(),
        recommendations: []
    };
    
    // Generate intelligent recommendations
    analysis.recommendations = generateSystemRecommendations(analysis);
    
    // Store for user
    systemHealth[userId] = analysis;
    
    console.log(`✅ ANALYSIS COMPLETE`);
    
    return analysis;
}

// 🖥️ Get hardware info
async function getHardwareInfo() {
    const info = {
        platform: os.platform(),
        arch: os.arch(),
        cpus: os.cpus().map(cpu => ({
            model: cpu.model,
            speed: cpu.speed
        })),
        totalMemory: os.totalmem(),
        freeMemory: os.freemem(),
        memoryUsagePercent: ((1 - os.freemem() / os.totalmem()) * 100).toFixed(2)
    };
    
    return info;
}

// 💾 Get storage info
async function getStorageInfo() {
    try {
        const command = process.platform === 'win32'
            ? 'wmic logicaldisk get size,freespace,caption'
            : 'df -h';
        
        const { stdout } = await execPromise(command, { timeout: 10000 });
        
        return {
            raw: stdout,
            parsed: parseStorageOutput(stdout)
        };
    } catch (error) {
        return { error: error.message };
    }
}

// ⚡ Get performance info
async function getPerformanceInfo() {
    return {
        uptime: os.uptime(),
        loadAverage: os.loadavg(),
        memoryUsage: process.memoryUsage(),
        cpuUsage: process.cpuUsage()
    };
}

// 🌐 Get network info
async function getNetworkInfo() {
    const interfaces = os.networkInterfaces();
    const info = {};
    
    for (const [name, addrs] of Object.entries(interfaces)) {
        info[name] = addrs.filter(addr => !addr.internal);
    }
    
    return info;
}

// ⚙️ Get process info
async function getProcessInfo() {
    try {
        const command = process.platform === 'win32'
            ? 'tasklist /FO CSV /NH | findstr /V "="'
            : 'ps aux | head -20';
        
        const { stdout } = await execPromise(command, { timeout: 10000 });
        
        return {
            raw: stdout,
            count: stdout.split('\n').filter(line => line.length > 0).length
        };
    } catch (error) {
        return { error: error.message };
    }
}

// 💡 Generate recommendations
function generateRecommendations(scanResults) {
    const recommendations = [];
    
    // Large files recommendation
    if (scanResults.largeFiles && scanResults.largeFiles.length > 0) {
        recommendations.push({
            type: 'storage',
            priority: 'high',
            message: `Found ${scanResults.largeFiles.length} large files (100MB+). Consider archiving or deleting unused large files.`,
            action: 'review_large_files'
        });
    }
    
    // Duplicate files
    if (scanResults.duplicates && scanResults.duplicates.length > 0) {
        recommendations.push({
            type: 'storage',
            priority: 'medium',
            message: `Found ${scanResults.duplicates.length} potential duplicate files. Removing duplicates can free up space.`,
            action: 'remove_duplicates'
        });
    }
    
    // Empty folders
    if (scanResults.emptyFolders && scanResults.emptyFolders.length > 10) {
        recommendations.push({
            type: 'cleanup',
            priority: 'low',
            message: `Found ${scanResults.emptyFolders.length} empty folders. Consider cleaning up unused directories.`,
            action: 'remove_empty_folders'
        });
    }
    
    return recommendations;
}

// 💡 Generate system recommendations
function generateSystemRecommendations(analysis) {
    const recommendations = [];
    
    // Memory usage
    if (analysis.hardware.memoryUsagePercent > 80) {
        recommendations.push({
            type: 'performance',
            priority: 'high',
            message: `Memory usage is at ${analysis.hardware.memoryUsagePercent}%. Close unused applications or upgrade RAM.`,
            action: 'reduce_memory_usage'
        });
    }
    
    // Process count
    if (analysis.processes.count > 200) {
        recommendations.push({
            type: 'performance',
            priority: 'medium',
            message: `${analysis.processes.count} processes running. Consider closing unused applications.`,
            action: 'reduce_processes'
        });
    }
    
    return recommendations;
}

// 📊 Read ANY file
async function readAnyFile(filePath, options = {}) {
    const { maxSize = 10 * 1024 * 1024 } = options; // 10MB default
    
    try {
        const stats = await fs.stat(filePath);
        
        if (stats.size > maxSize) {
            // Read first chunk for large files
            const buffer = Buffer.alloc(Math.min(maxSize, stats.size));
            const fd = await fs.open(filePath, 'r');
            await fd.read(buffer, 0, buffer.length, 0);
            await fd.close();
            
            return {
                success: true,
                content: buffer.toString('utf8'),
                truncated: true,
                totalSize: stats.size,
                readSize: buffer.length
            };
        }
        
        const content = await fs.readFile(filePath, 'utf8');
        
        return {
            success: true,
            content,
            truncated: false,
            size: stats.size
        };
    } catch (error) {
        return {
            success: false,
            error: error.message
        };
    }
}

// 💾 Store user data
function storeUserData(userId, key, value) {
    if (!userData[userId]) {
        userData[userId] = {};
    }
    
    userData[userId][key] = {
        value,
        timestamp: new Date().toISOString()
    };
    
    console.log(`💾 Stored data for ${userId}: ${key}`);
}

// 📖 Get user data
function getUserData(userId, key = null) {
    if (!userData[userId]) return null;
    
    if (key) {
        return userData[userId][key];
    }
    
    return userData[userId];
}

// 📊 Format bytes
function formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

// 📊 Parse storage output
function parseStorageOutput(output) {
    const lines = output.split('\n').filter(line => line.trim().length > 0);
    return lines.slice(1); // Skip header
}

module.exports = {
    fullSystemScan,
    cleanupStorage,
    deepSystemAnalysis,
    readAnyFile,
    storeUserData,
    getUserData,
    getHardwareInfo,
    getStorageInfo,
    getPerformanceInfo,
    getNetworkInfo,
    scanResults,
    userData,
    systemHealth,
    formatBytes
};
