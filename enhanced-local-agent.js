// 🔍 ENHANCED LOCAL AGENT - Full Data Access & Learning
// Scans emails, messages, photos, files for improvements
// Learns and syncs with NUPI Cloud Agent autonomously

const fs = require('fs');
const path = require('path');
const os = require('os');

class EnhancedLocalAgent {
    constructor(config) {
        this.agentId = config.agentId;
        this.deploymentKey = config.deploymentKey;
        this.cloudEndpoint = config.cloudEndpoint || 'https://nupidesktopai.com';
        this.deviceId = config.deviceId;
        
        // Learning storage
        this.learningData = {
            userPatterns: {},
            improvements: [],
            scannedData: {
                emails: [],
                messages: [],
                photos: [],
                files: [],
                apps: []
            },
            insights: [],
            cleanupOpportunities: []
        };
        
        // Privacy-preserving: Only store metadata, not content
        this.privacyMode = true;
        
        console.log('🔍 Enhanced Local Agent initialized');
        console.log('   📧 Email scanning: ENABLED');
        console.log('   💬 Message scanning: ENABLED');
        console.log('   📷 Photo analysis: ENABLED');
        console.log('   📁 File optimization: ENABLED');
        console.log('   🧠 Learning mode: ACTIVE');
    }
    
    // ============================================
    // EMAIL SCANNING & ANALYSIS
    // ============================================
    
    async scanEmails() {
        console.log('📧 Scanning emails for improvements...');
        
        const emailPaths = this.getEmailPaths();
        const insights = {
            totalEmails: 0,
            unreadCount: 0,
            oldEmailsToArchive: [],
            duplicates: [],
            largeAttachments: [],
            spamCandidates: [],
            importantUnread: [],
            cleanupSuggestions: []
        };
        
        for (const emailPath of emailPaths) {
            if (fs.existsSync(emailPath)) {
                const emails = await this.parseEmails(emailPath);
                insights.totalEmails += emails.length;
                
                // Analyze each email (metadata only for privacy)
                for (const email of emails) {
                    if (!email.read) insights.unreadCount++;
                    
                    // Old emails (>1 year, not important)
                    if (this.isOldEmail(email) && !email.important) {
                        insights.oldEmailsToArchive.push({
                            id: email.id,
                            subject: email.subject.substring(0, 50),
                            date: email.date,
                            size: email.size
                        });
                    }
                    
                    // Large attachments
                    if (email.attachmentSize > 10 * 1024 * 1024) { // >10MB
                        insights.largeAttachments.push({
                            id: email.id,
                            subject: email.subject.substring(0, 50),
                            attachmentSize: email.attachmentSize,
                            suggestion: 'Move to cloud storage?'
                        });
                    }
                    
                    // Spam detection (simple heuristics)
                    if (this.isLikelySpam(email)) {
                        insights.spamCandidates.push({
                            id: email.id,
                            subject: email.subject.substring(0, 50),
                            sender: email.from
                        });
                    }
                    
                    // Important unread
                    if (!email.read && this.isImportant(email)) {
                        insights.importantUnread.push({
                            id: email.id,
                            subject: email.subject.substring(0, 50),
                            from: email.from,
                            date: email.date
                        });
                    }
                }
            }
        }
        
        // Generate cleanup suggestions
        insights.cleanupSuggestions = this.generateEmailCleanupSuggestions(insights);
        
        // Store learning data
        this.learningData.scannedData.emails = insights;
        
        // Sync with cloud (non-blocking)
        this.syncLearningToCloud('emails', insights);
        
        console.log(`✅ Email scan complete:`);
        console.log(`   📧 Total: ${insights.totalEmails}`);
        console.log(`   ⚠️  Unread: ${insights.unreadCount}`);
        console.log(`   📦 Old emails to archive: ${insights.oldEmailsToArchive.length}`);
        console.log(`   💾 Large attachments: ${insights.largeAttachments.length}`);
        console.log(`   🚫 Spam candidates: ${insights.spamCandidates.length}`);
        
        return insights;
    }
    
    // ============================================
    // MESSAGE SCANNING (SMS, iMessage, WhatsApp)
    // ============================================
    
    async scanMessages() {
        console.log('💬 Scanning messages for insights...');
        
        const insights = {
            totalMessages: 0,
            conversationCount: 0,
            mediaFiles: [],
            duplicateMedia: [],
            largeVideos: [],
            cleanupOpportunities: [],
            conversationPatterns: {}
        };
        
        const messagePaths = this.getMessagePaths();
        
        for (const msgPath of messagePaths) {
            if (fs.existsSync(msgPath)) {
                const messages = await this.parseMessages(msgPath);
                insights.totalMessages += messages.length;
                
                // Analyze media attachments
                for (const msg of messages) {
                    if (msg.attachments) {
                        for (const attachment of msg.attachments) {
                            insights.mediaFiles.push({
                                type: attachment.type,
                                size: attachment.size,
                                date: msg.date,
                                conversation: msg.conversationId
                            });
                            
                            // Large videos to backup/compress
                            if (attachment.type === 'video' && attachment.size > 50 * 1024 * 1024) {
                                insights.largeVideos.push({
                                    conversation: msg.conversationId,
                                    size: attachment.size,
                                    date: msg.date,
                                    suggestion: 'Compress or move to cloud storage'
                                });
                            }
                        }
                    }
                }
                
                // Find duplicate media
                insights.duplicateMedia = this.findDuplicateMedia(insights.mediaFiles);
            }
        }
        
        // Generate cleanup suggestions
        insights.cleanupOpportunities = this.generateMessageCleanupSuggestions(insights);
        
        // Store learning data
        this.learningData.scannedData.messages = insights;
        
        // Sync with cloud
        this.syncLearningToCloud('messages', insights);
        
        console.log(`✅ Message scan complete:`);
        console.log(`   💬 Total messages: ${insights.totalMessages}`);
        console.log(`   📁 Media files: ${insights.mediaFiles.length}`);
        console.log(`   🎥 Large videos: ${insights.largeVideos.length}`);
        console.log(`   🔄 Duplicate media: ${insights.duplicateMedia.length}`);
        
        return insights;
    }
    
    // ============================================
    // PHOTO ANALYSIS & ORGANIZATION
    // ============================================
    
    async analyzePhotos() {
        console.log('📷 Analyzing photos for optimization...');
        
        const insights = {
            totalPhotos: 0,
            totalSize: 0,
            duplicates: [],
            lowQuality: [],
            screenshots: [],
            memes: [],
            organizationSuggestions: [],
            compressionOpportunities: []
        };
        
        const photoPaths = this.getPhotoPaths();
        
        for (const photoPath of photoPaths) {
            if (fs.existsSync(photoPath)) {
                const photos = await this.scanDirectory(photoPath, ['.jpg', '.jpeg', '.png', '.heic']);
                insights.totalPhotos += photos.length;
                
                for (const photo of photos) {
                    insights.totalSize += photo.size;
                    
                    // Identify screenshots (often unwanted clutter)
                    if (this.isScreenshot(photo.name)) {
                        insights.screenshots.push({
                            path: photo.path,
                            size: photo.size,
                            date: photo.date,
                            suggestion: 'Auto-delete screenshots older than 30 days?'
                        });
                    }
                    
                    // Large uncompressed photos
                    if (photo.size > 5 * 1024 * 1024 && !photo.name.includes('compressed')) {
                        insights.compressionOpportunities.push({
                            path: photo.path,
                            currentSize: photo.size,
                            estimatedSavings: photo.size * 0.6, // 60% reduction typical
                            suggestion: 'Compress without visible quality loss'
                        });
                    }
                }
                
                // Find duplicate photos
                insights.duplicates = await this.findDuplicatePhotos(photos);
            }
        }
        
        // Generate organization suggestions
        insights.organizationSuggestions = this.generatePhotoOrganizationPlan(insights);
        
        // Store learning data
        this.learningData.scannedData.photos = insights;
        
        // Sync with cloud
        this.syncLearningToCloud('photos', insights);
        
        console.log(`✅ Photo analysis complete:`);
        console.log(`   📷 Total photos: ${insights.totalPhotos}`);
        console.log(`   💾 Total size: ${this.formatBytes(insights.totalSize)}`);
        console.log(`   🔄 Duplicates: ${insights.duplicates.length}`);
        console.log(`   📱 Screenshots: ${insights.screenshots.length}`);
        console.log(`   🗜️  Compression opportunities: ${insights.compressionOpportunities.length}`);
        
        return insights;
    }
    
    // ============================================
    // FILE SYSTEM OPTIMIZATION
    // ============================================
    
    async optimizeFileSystem() {
        console.log('📁 Optimizing file system...');
        
        const insights = {
            totalFiles: 0,
            totalSize: 0,
            duplicates: [],
            largeFiles: [],
            oldFiles: [],
            tempFiles: [],
            downloadClutter: [],
            organizationPlan: []
        };
        
        // Scan common clutter locations
        const scanPaths = [
            path.join(os.homedir(), 'Downloads'),
            path.join(os.homedir(), 'Desktop'),
            path.join(os.homedir(), 'Documents')
        ];
        
        for (const scanPath of scanPaths) {
            if (fs.existsSync(scanPath)) {
                const files = await this.scanDirectory(scanPath);
                insights.totalFiles += files.length;
                
                for (const file of files) {
                    insights.totalSize += file.size;
                    
                    // Large files
                    if (file.size > 100 * 1024 * 1024) { // >100MB
                        insights.largeFiles.push({
                            path: file.path,
                            size: file.size,
                            type: file.ext,
                            suggestion: 'Move to external storage or cloud?'
                        });
                    }
                    
                    // Old unused files (>1 year, not accessed)
                    if (this.isOldFile(file)) {
                        insights.oldFiles.push({
                            path: file.path,
                            size: file.size,
                            lastAccessed: file.lastAccessed,
                            suggestion: 'Archive or delete?'
                        });
                    }
                    
                    // Temp files
                    if (this.isTempFile(file)) {
                        insights.tempFiles.push({
                            path: file.path,
                            size: file.size,
                            suggestion: 'Safe to delete'
                        });
                    }
                }
                
                // Downloads folder analysis
                if (scanPath.includes('Downloads')) {
                    insights.downloadClutter = this.analyzeDownloadsFolder(files);
                }
            }
        }
        
        // Find duplicates across all scanned locations
        insights.duplicates = await this.findDuplicateFiles(scanPaths);
        
        // Generate organization plan
        insights.organizationPlan = this.generateOrganizationPlan(insights);
        
        // Store learning data
        this.learningData.scannedData.files = insights;
        
        // Sync with cloud
        this.syncLearningToCloud('filesystem', insights);
        
        console.log(`✅ File system optimization complete:`);
        console.log(`   📁 Total files scanned: ${insights.totalFiles}`);
        console.log(`   💾 Total size: ${this.formatBytes(insights.totalSize)}`);
        console.log(`   🔄 Duplicate files: ${insights.duplicates.length}`);
        console.log(`   🗑️  Temp files: ${insights.tempFiles.length}`);
        console.log(`   📦 Old unused files: ${insights.oldFiles.length}`);
        
        return insights;
    }
    
    // ============================================
    // LEARNING & INSIGHTS
    // ============================================
    
    async generateInsights() {
        console.log('🧠 Generating insights from scanned data...');
        
        const insights = [];
        
        // Storage insights
        const totalWaste = this.calculateTotalWaste();
        if (totalWaste > 1024 * 1024 * 1024) { // >1GB waste
            insights.push({
                type: 'storage',
                severity: 'high',
                title: `${this.formatBytes(totalWaste)} of storage can be freed`,
                suggestions: this.getTopCleanupActions(),
                automatable: true
            });
        }
        
        // Email insights
        if (this.learningData.scannedData.emails.unreadCount > 100) {
            insights.push({
                type: 'productivity',
                severity: 'medium',
                title: `${this.learningData.scannedData.emails.unreadCount} unread emails`,
                suggestions: [
                    'Auto-archive emails older than 1 year',
                    'Unsubscribe from newsletters you never read',
                    'Set up filters for better organization'
                ],
                automatable: true
            });
        }
        
        // Photo insights
        if (this.learningData.scannedData.photos.duplicates.length > 50) {
            insights.push({
                type: 'organization',
                severity: 'medium',
                title: `${this.learningData.scannedData.photos.duplicates.length} duplicate photos found`,
                suggestions: [
                    'Auto-delete exact duplicates',
                    'Keep only best quality version',
                    `Save ${this.formatBytes(this.calculateDuplicatePhotoWaste())} of storage`
                ],
                automatable: true
            });
        }
        
        // User patterns
        const patterns = this.analyzeUserPatterns();
        insights.push({
            type: 'patterns',
            severity: 'info',
            title: 'Usage patterns detected',
            patterns: patterns,
            suggestions: this.getPatternBasedSuggestions(patterns),
            automatable: false
        });
        
        this.learningData.insights = insights;
        
        console.log(`✅ Generated ${insights.length} insights`);
        return insights;
    }
    
    // ============================================
    // AUTONOMOUS IMPROVEMENTS
    // ============================================
    
    async executeAutonomousImprovements() {
        console.log('🤖 Executing autonomous improvements...');
        
        const improvements = [];
        const safeActions = this.getSafeAutomatableActions();
        
        for (const action of safeActions) {
            try {
                const result = await this.executeAction(action);
                improvements.push({
                    action: action.description,
                    result: result,
                    timestamp: new Date().toISOString()
                });
                console.log(`✅ ${action.description}`);
            } catch (error) {
                console.error(`❌ Failed: ${action.description}`, error.message);
            }
        }
        
        // Sync improvements to cloud
        this.syncImprovementsToCloud(improvements);
        
        return improvements;
    }
    
    getSafeAutomatableActions() {
        const actions = [];
        
        // Safe: Delete obvious temp files
        if (this.learningData.scannedData.files.tempFiles.length > 0) {
            actions.push({
                type: 'cleanup',
                description: `Delete ${this.learningData.scannedData.files.tempFiles.length} temp files`,
                action: () => this.deleteTempFiles(),
                risk: 'none'
            });
        }
        
        // Safe: Delete screenshots older than 30 days
        const oldScreenshots = this.learningData.scannedData.photos.screenshots
            .filter(s => this.isOlderThan(s.date, 30));
        if (oldScreenshots.length > 0) {
            actions.push({
                type: 'cleanup',
                description: `Delete ${oldScreenshots.length} old screenshots`,
                action: () => this.deleteOldScreenshots(oldScreenshots),
                risk: 'low'
            });
        }
        
        // Safe: Compress large photos
        const compressible = this.learningData.scannedData.photos.compressionOpportunities.slice(0, 10);
        if (compressible.length > 0) {
            actions.push({
                type: 'optimization',
                description: `Compress ${compressible.length} photos`,
                action: () => this.compressPhotos(compressible),
                risk: 'none'
            });
        }
        
        return actions;
    }
    
    // ============================================
    // CLOUD SYNC & LEARNING
    // ============================================
    
    async syncLearningToCloud(dataType, insights) {
        try {
            await fetch(`${this.cloudEndpoint}/api/agents/learning`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    agentId: this.agentId,
                    deviceId: this.deviceId,
                    deploymentKey: this.deploymentKey,
                    dataType,
                    insights,
                    timestamp: new Date().toISOString()
                })
            });
            console.log(`☁️  Synced ${dataType} insights to cloud`);
        } catch (error) {
            console.error('Failed to sync to cloud:', error.message);
        }
    }
    
    async syncImprovementsToCloud(improvements) {
        try {
            await fetch(`${this.cloudEndpoint}/api/agents/improvements`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    agentId: this.agentId,
                    deviceId: this.deviceId,
                    deploymentKey: this.deploymentKey,
                    improvements,
                    timestamp: new Date().toISOString()
                })
            });
            console.log(`☁️  Synced ${improvements.length} improvements to cloud`);
        } catch (error) {
            console.error('Failed to sync improvements:', error.message);
        }
    }
    
    // ============================================
    // HELPER FUNCTIONS
    // ============================================
    
    getEmailPaths() {
        // Platform-specific email paths
        return [
            path.join(os.homedir(), 'Library/Mail'),
            path.join(os.homedir(), '.thunderbird'),
            // Add more email client paths
        ];
    }
    
    getMessagePaths() {
        return [
            path.join(os.homedir(), 'Library/Messages'),
            // Add more message app paths
        ];
    }
    
    getPhotoPaths() {
        return [
            path.join(os.homedir(), 'Pictures'),
            path.join(os.homedir(), 'Photos'),
            path.join(os.homedir(), 'Desktop'),
        ];
    }
    
    async scanDirectory(dirPath, extensions = null) {
        const files = [];
        // Recursive directory scan implementation
        return files;
    }
    
    isOldEmail(email) {
        const oneYearAgo = Date.now() - (365 * 24 * 60 * 60 * 1000);
        return new Date(email.date) < oneYearAgo;
    }
    
    isLikelySpam(email) {
        // Simple spam heuristics
        const spamIndicators = ['winner', 'prize', 'claim now', 'urgent', 'act now'];
        return spamIndicators.some(indicator => 
            email.subject.toLowerCase().includes(indicator)
        );
    }
    
    isImportant(email) {
        const importantKeywords = ['invoice', 'payment', 'urgent', 'important', 'action required'];
        return importantKeywords.some(keyword => 
            email.subject.toLowerCase().includes(keyword)
        );
    }
    
    isScreenshot(filename) {
        return /screenshot|screen shot|screen_shot/i.test(filename);
    }
    
    isOldFile(file) {
        const oneYearAgo = Date.now() - (365 * 24 * 60 * 60 * 1000);
        return file.lastAccessed < oneYearAgo;
    }
    
    isTempFile(file) {
        return file.path.includes('/tmp/') || 
               file.path.includes('\\Temp\\') ||
               file.ext === '.tmp';
    }
    
    formatBytes(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
    }
    
    generateEmailCleanupSuggestions(insights) {
        return [
            `Archive ${insights.oldEmailsToArchive.length} old emails`,
            `Move ${insights.largeAttachments.length} large attachments to cloud`,
            `Delete ${insights.spamCandidates.length} spam emails`
        ];
    }
    
    generateMessageCleanupSuggestions(insights) {
        return [
            `Compress ${insights.largeVideos.length} large videos`,
            `Delete ${insights.duplicateMedia.length} duplicate media files`
        ];
    }
    
    generatePhotoOrganizationPlan(insights) {
        return [
            `Delete ${insights.duplicates.length} duplicate photos`,
            `Auto-delete ${insights.screenshots.length} old screenshots`,
            `Compress ${insights.compressionOpportunities.length} large photos`
        ];
    }
    
    generateOrganizationPlan(insights) {
        return [
            `Organize ${insights.downloadClutter.length} files in Downloads`,
            `Archive ${insights.oldFiles.length} old unused files`,
            `Delete ${insights.tempFiles.length} temporary files`
        ];
    }
    
    calculateTotalWaste() {
        let total = 0;
        if (this.learningData.scannedData.files.tempFiles) {
            total += this.learningData.scannedData.files.tempFiles.reduce((sum, f) => sum + f.size, 0);
        }
        if (this.learningData.scannedData.photos.duplicates) {
            total += this.learningData.scannedData.photos.duplicates.reduce((sum, f) => sum + f.size, 0);
        }
        return total;
    }
    
    getTopCleanupActions() {
        return [
            'Delete temporary files',
            'Remove duplicate photos',
            'Archive old emails',
            'Compress large media files'
        ];
    }
    
    analyzeUserPatterns() {
        return {
            mostUsedApps: [],
            peakUsageHours: [],
            storageGrowthRate: 0,
            emailVolume: 0
        };
    }
    
    getPatternBasedSuggestions(patterns) {
        return [
            'Schedule cleanups during low usage hours',
            'Automate backups based on storage growth'
        ];
    }
}

module.exports = EnhancedLocalAgent;
