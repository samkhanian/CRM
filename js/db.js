class Database {
    constructor() {
        this.dbName = 'crmDB';
        this.initializeDB();
    }

    initializeDB() {
        const existing = localStorage.getItem(this.dbName);
        if (!existing) {
            localStorage.setItem(this.dbName, JSON.stringify({
                customers: [],
                contacts: [],
                opportunities: []
            }));
        } else {
            try {
                const data = JSON.parse(existing);
                if (!data.customers) data.customers = [];
                if (!data.contacts) data.contacts = [];
                if (!data.opportunities) data.opportunities = [];
                localStorage.setItem(this.dbName, JSON.stringify(data));
            } catch (e) {
                localStorage.setItem(this.dbName, JSON.stringify({
                    customers: [],
                    contacts: [],
                    opportunities: []
                }));
            }
        }
    }

    getDB() {
        return JSON.parse(localStorage.getItem(this.dbName));
    }

    saveDB(data) {
        localStorage.setItem(this.dbName, JSON.stringify(data));
    }

    // مشتریان
    addCustomer(customer) {
        const db = this.getDB();
        customer.id = Date.now();
        customer.createdAt = new Date().toISOString();
        db.customers.push(customer);
        this.saveDB(db);
        return customer;
    }

    getCustomers() {
        return this.getDB().customers;
    }

    getCustomerById(id) {
        return this.getDB().customers.find(c => c.id == id);
    }

    updateCustomer(id, updatedData) {
        const db = this.getDB();
        const customer = db.customers.find(c => c.id == id);
        if (customer) {
            Object.assign(customer, updatedData);
            this.saveDB(db);
        }
        return customer;
    }

    deleteCustomer(id) {
        const db = this.getDB();
        db.customers = db.customers.filter(c => c.id != id);
        db.contacts = db.contacts.filter(c => c.customerId != id);
        db.opportunities = db.opportunities.filter(o => o.customerId != id);
        this.saveDB(db);
    }

    // تماس‌ها
    addContact(contact) {
        const db = this.getDB();
        contact.id = Date.now();
        contact.createdAt = new Date().toISOString();
        db.contacts.push(contact);
        this.saveDB(db);
        return contact;
    }

    getContacts() {
        return this.getDB().contacts;
    }

    getContactById(id) {
        return this.getDB().contacts.find(c => c.id == id);
    }

    updateContact(id, updatedData) {
        const db = this.getDB();
        const contact = db.contacts.find(c => c.id == id);
        if (contact) {
            Object.assign(contact, updatedData);
            this.saveDB(db);
        }
        return contact;
    }

    deleteContact(id) {
        const db = this.getDB();
        db.contacts = db.contacts.filter(c => c.id != id);
        this.saveDB(db);
    }

    // فرصت‌های فروش
    addOpportunity(opportunity) {
        const db = this.getDB();
        opportunity.id = Date.now();
        opportunity.createdAt = new Date().toISOString();
        db.opportunities.push(opportunity);
        this.saveDB(db);
        return opportunity;
    }

    getOpportunities() {
        return this.getDB().opportunities;
    }

    getOpportunityById(id) {
        return this.getDB().opportunities.find(o => o.id == id);
    }

    updateOpportunity(id, updatedData) {
        const db = this.getDB();
        const opportunity = db.opportunities.find(o => o.id == id);
        if (opportunity) {
            Object.assign(opportunity, updatedData);
            this.saveDB(db);
        }
        return opportunity;
    }

    deleteOpportunity(id) {
        const db = this.getDB();
        db.opportunities = db.opportunities.filter(o => o.id != id);
        this.saveDB(db);
    }

    // آمار
    getStats() {
        const db = this.getDB();
        const totalRevenue = db.opportunities.reduce((sum, opp) => {
            return sum + (opp.value * (opp.probability / 100));
        }, 0);

        return {
            customersCount: db.customers.length,
            contactsCount: db.contacts.length,
            opportunitiesCount: db.opportunities.length,
            totalRevenue: Math.round(totalRevenue)
        };
    }

    resetDatabase() {
        localStorage.removeItem(this.dbName);
        this.initializeDB();
    }

    initializeDemoData() {
        const db = this.getDB();
        
        if (db.customers && db.customers.length > 0) {
            return;
        }

        const customers = [
            {
                id: 1000,
                name: 'شرکت تجارت ایرانیان',
                phone: '02188776655',
                email: 'info@tajarot.ir',
                company: 'تجارت ایرانیان',
                address: 'تهران، خیابان امام خمینی',
                createdAt: new Date().toISOString()
            },
            {
                id: 1001,
                name: 'احمد رضایی',
                phone: '09123456789',
                email: 'ahmad@example.com',
                company: 'شرکت فنی و مهندسی',
                address: 'تهران، خیابان ولیعصر',
                createdAt: new Date().toISOString()
            },
            {
                id: 1002,
                name: 'فاطمه محمدی',
                phone: '09198765432',
                email: 'fateme@company.ir',
                company: 'گروه بازرگانی سینا',
                address: 'اصفهان، خیابان چهار باغ',
                createdAt: new Date().toISOString()
            },
            {
                id: 1003,
                name: 'علی کاظمی',
                phone: '09134567890',
                email: 'ali.kazemi@business.ir',
                company: 'شرکت سرمایه‌گذاری تجارت',
                address: 'قم، خیابان انقلاب',
                createdAt: new Date().toISOString()
            },
            {
                id: 1004,
                name: 'مریم عباسی',
                phone: '09165432109',
                email: 'maryam.abbasi@corp.ir',
                company: 'شرکت خدمات رایانه‌ای',
                address: 'شیراز، خیابان زند',
                createdAt: new Date().toISOString()
            }
        ];

        const contacts = [
            {
                id: 2000,
                customerId: 1000,
                type: 'تلفن',
                date: '1403/10/03',
                description: 'بحث درخصوص قرارداد سالانه',
                createdAt: new Date().toISOString()
            },
            {
                id: 2001,
                customerId: 1001,
                type: 'ایمیل',
                date: '1403/10/04',
                description: 'ارسال پیشنهاد فروش',
                createdAt: new Date().toISOString()
            },
            {
                id: 2002,
                customerId: 1002,
                type: 'دیدار',
                date: '1403/10/02',
                description: 'جلسه معارفه در دفتر شرکت',
                createdAt: new Date().toISOString()
            }
        ];

        const opportunities = [
            {
                id: 3000,
                name: 'پروژه سیستم مدیریت',
                customerId: 1000,
                value: 50000000,
                probability: 75,
                stage: 'مذاکره',
                createdAt: new Date().toISOString()
            },
            {
                id: 3001,
                name: 'توسعه نرم‌افزار فروش',
                customerId: 1003,
                value: 75000000,
                probability: 50,
                stage: 'پیشنهاد',
                createdAt: new Date().toISOString()
            }
        ];

        db.customers = customers;
        db.contacts = contacts;
        db.opportunities = opportunities;
        this.saveDB(db);
    }
}

const db = new Database();
