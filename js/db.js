class Database {
    constructor() {
        this.dbName = 'crmDB';
        this.initializeDB();
    }

    initializeDB() {
        if (!localStorage.getItem(this.dbName)) {
            localStorage.setItem(this.dbName, JSON.stringify({
                customers: [],
                contacts: [],
                opportunities: []
            }));
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
}

const db = new Database();
