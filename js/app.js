class CRMApp {
    constructor() {
        this.currentEditingId = null;
        this.currentEditingType = null;
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.updateDashboard();
        this.renderCustomers();
        this.renderContacts();
        this.renderOpportunities();
        this.loadCustomersDropdown();
    }

    setupEventListeners() {
        // ناوبری
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const pageName = btn.dataset.page;
                this.switchPage(pageName);
            });
        });

        // مشتریان
        document.getElementById('add-customer-btn').addEventListener('click', () => {
            this.openCustomerModal();
        });

        document.getElementById('customer-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveCustomer();
        });

        document.getElementById('cancel-customer-btn').addEventListener('click', () => {
            this.closeModal('customer-modal');
        });

        // تماس‌ها
        document.getElementById('add-contact-btn').addEventListener('click', () => {
            this.openContactModal();
        });

        document.getElementById('contact-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveContact();
        });

        document.getElementById('cancel-contact-btn').addEventListener('click', () => {
            this.closeModal('contact-modal');
        });

        // فرصت‌ها
        document.getElementById('add-opportunity-btn').addEventListener('click', () => {
            this.openOpportunityModal();
        });

        document.getElementById('opportunity-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveOpportunity();
        });

        document.getElementById('cancel-opportunity-btn').addEventListener('click', () => {
            this.closeModal('opportunity-modal');
        });

        // بستن مودال‌ها
        document.querySelectorAll('.close-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const modal = e.target.closest('.modal');
                this.closeModal(modal.id);
            });
        });

        document.querySelectorAll('.modal').forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.closeModal(modal.id);
                }
            });
        });
    }

    switchPage(pageName) {
        document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
        document.getElementById(pageName).classList.add('active');

        document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
        document.querySelector(`[data-page="${pageName}"]`).classList.add('active');

        const titles = {
            dashboard: 'داشبورد',
            customers: 'مشتریان',
            contacts: 'تماس‌ها',
            opportunities: 'فرصت‌های فروش'
        };
        document.getElementById('page-title').textContent = titles[pageName];
    }

    updateDashboard() {
        const stats = db.getStats();
        document.getElementById('stat-customers').textContent = stats.customersCount;
        document.getElementById('stat-contacts').textContent = stats.contactsCount;
        document.getElementById('stat-opportunities').textContent = stats.opportunitiesCount;
        document.getElementById('stat-revenue').textContent = this.formatCurrency(stats.totalRevenue);
    }

    // مشتریان
    renderCustomers() {
        const customers = db.getCustomers();
        const tbody = document.getElementById('customers-table');
        const noData = document.getElementById('no-customers');

        if (customers.length === 0) {
            tbody.innerHTML = '';
            noData.style.display = 'block';
            return;
        }

        noData.style.display = 'none';
        tbody.innerHTML = customers.map(customer => `
            <tr>
                <td>${customer.name}</td>
                <td>${customer.phone}</td>
                <td>${customer.email || '-'}</td>
                <td>${customer.company || '-'}</td>
                <td>
                    <div class="actions">
                        <button class="btn btn-edit" onclick="app.editCustomer(${customer.id})">ویرایش</button>
                        <button class="btn btn-danger" onclick="app.deleteCustomer(${customer.id})">حذف</button>
                    </div>
                </td>
            </tr>
        `).join('');
    }

    openCustomerModal(id = null) {
        this.currentEditingId = id;
        this.currentEditingType = 'customer';

        const modal = document.getElementById('customer-modal');
        const form = document.getElementById('customer-form');
        const title = document.getElementById('customer-modal-title');

        form.reset();

        if (id) {
            title.textContent = 'ویرایش مشتری';
            const customer = db.getCustomerById(id);
            document.getElementById('customer-name').value = customer.name;
            document.getElementById('customer-phone').value = customer.phone;
            document.getElementById('customer-email').value = customer.email || '';
            document.getElementById('customer-company').value = customer.company || '';
            document.getElementById('customer-address').value = customer.address || '';
        } else {
            title.textContent = 'افزودن مشتری جدید';
        }

        modal.classList.add('active');
    }

    editCustomer(id) {
        this.openCustomerModal(id);
    }

    saveCustomer() {
        const name = document.getElementById('customer-name').value.trim();
        const phone = document.getElementById('customer-phone').value.trim();
        const email = document.getElementById('customer-email').value.trim();
        const company = document.getElementById('customer-company').value.trim();
        const address = document.getElementById('customer-address').value.trim();

        if (!name || !phone) {
            alert('نام و شماره تماس الزامی است');
            return;
        }

        const customerData = { name, phone, email, company, address };

        if (this.currentEditingId) {
            db.updateCustomer(this.currentEditingId, customerData);
        } else {
            db.addCustomer(customerData);
        }

        this.renderCustomers();
        this.loadCustomersDropdown();
        this.updateDashboard();
        this.closeModal('customer-modal');
    }

    deleteCustomer(id) {
        if (confirm('آیا مطمئن هستید؟')) {
            db.deleteCustomer(id);
            this.renderCustomers();
            this.loadCustomersDropdown();
            this.updateDashboard();
        }
    }

    // تماس‌ها
    renderContacts() {
        const contacts = db.getContacts();
        const tbody = document.getElementById('contacts-table');
        const noData = document.getElementById('no-contacts');

        if (contacts.length === 0) {
            tbody.innerHTML = '';
            noData.style.display = 'block';
            return;
        }

        noData.style.display = 'none';
        tbody.innerHTML = contacts.map(contact => {
            const customer = db.getCustomerById(contact.customerId);
            return `
                <tr>
                    <td>${customer ? customer.name : '-'}</td>
                    <td>${new Date(contact.date).toLocaleDateString('fa-IR')}</td>
                    <td>${contact.type}</td>
                    <td>${contact.description || '-'}</td>
                    <td>
                        <div class="actions">
                            <button class="btn btn-edit" onclick="app.editContact(${contact.id})">ویرایش</button>
                            <button class="btn btn-danger" onclick="app.deleteContact(${contact.id})">حذف</button>
                        </div>
                    </td>
                </tr>
            `;
        }).join('');
    }

    openContactModal(id = null) {
        this.currentEditingId = id;
        this.currentEditingType = 'contact';

        const modal = document.getElementById('contact-modal');
        const form = document.getElementById('contact-form');
        const title = document.getElementById('contact-modal-title');

        form.reset();

        if (id) {
            title.textContent = 'ویرایش تماس';
            const contact = db.getContactById(id);
            document.getElementById('contact-customer').value = contact.customerId;
            document.getElementById('contact-type').value = contact.type;
            document.getElementById('contact-date').value = contact.date;
            document.getElementById('contact-description').value = contact.description || '';
        } else {
            title.textContent = 'افزودن تماس جدید';
            document.getElementById('contact-date').valueAsDate = new Date();
        }

        modal.classList.add('active');
    }

    editContact(id) {
        this.openContactModal(id);
    }

    saveContact() {
        const customerId = document.getElementById('contact-customer').value;
        const type = document.getElementById('contact-type').value;
        const date = document.getElementById('contact-date').value;
        const description = document.getElementById('contact-description').value.trim();

        if (!customerId || !type || !date) {
            alert('مشتری، نوع تماس و تاریخ الزامی است');
            return;
        }

        const contactData = { customerId: parseInt(customerId), type, date, description };

        if (this.currentEditingId) {
            db.updateContact(this.currentEditingId, contactData);
        } else {
            db.addContact(contactData);
        }

        this.renderContacts();
        this.updateDashboard();
        this.closeModal('contact-modal');
    }

    deleteContact(id) {
        if (confirm('آیا مطمئن هستید؟')) {
            db.deleteContact(id);
            this.renderContacts();
            this.updateDashboard();
        }
    }

    // فرصت‌های فروش
    renderOpportunities() {
        const opportunities = db.getOpportunities();
        const tbody = document.getElementById('opportunities-table');
        const noData = document.getElementById('no-opportunities');

        if (opportunities.length === 0) {
            tbody.innerHTML = '';
            noData.style.display = 'block';
            return;
        }

        noData.style.display = 'none';
        tbody.innerHTML = opportunities.map(opp => {
            const customer = db.getCustomerById(opp.customerId);
            return `
                <tr>
                    <td>${opp.name}</td>
                    <td>${customer ? customer.name : '-'}</td>
                    <td>${this.formatCurrency(opp.value)}</td>
                    <td>${opp.probability}%</td>
                    <td>${opp.stage}</td>
                    <td>
                        <div class="actions">
                            <button class="btn btn-edit" onclick="app.editOpportunity(${opp.id})">ویرایش</button>
                            <button class="btn btn-danger" onclick="app.deleteOpportunity(${opp.id})">حذف</button>
                        </div>
                    </td>
                </tr>
            `;
        }).join('');
    }

    openOpportunityModal(id = null) {
        this.currentEditingId = id;
        this.currentEditingType = 'opportunity';

        const modal = document.getElementById('opportunity-modal');
        const form = document.getElementById('opportunity-form');
        const title = document.getElementById('opportunity-modal-title');

        form.reset();

        if (id) {
            title.textContent = 'ویرایش فرصه';
            const opp = db.getOpportunityById(id);
            document.getElementById('opportunity-name').value = opp.name;
            document.getElementById('opportunity-customer').value = opp.customerId;
            document.getElementById('opportunity-value').value = opp.value;
            document.getElementById('opportunity-probability').value = opp.probability;
            document.getElementById('opportunity-stage').value = opp.stage;
        } else {
            title.textContent = 'افزودن فرصه جدید';
            document.getElementById('opportunity-probability').value = 50;
        }

        modal.classList.add('active');
    }

    editOpportunity(id) {
        this.openOpportunityModal(id);
    }

    saveOpportunity() {
        const name = document.getElementById('opportunity-name').value.trim();
        const customerId = document.getElementById('opportunity-customer').value;
        const value = parseInt(document.getElementById('opportunity-value').value);
        const probability = parseInt(document.getElementById('opportunity-probability').value) || 50;
        const stage = document.getElementById('opportunity-stage').value;

        if (!name || !customerId || !value || !stage) {
            alert('نام، مشتری، مقدار و مرحله الزامی است');
            return;
        }

        const oppData = {
            name,
            customerId: parseInt(customerId),
            value,
            probability,
            stage
        };

        if (this.currentEditingId) {
            db.updateOpportunity(this.currentEditingId, oppData);
        } else {
            db.addOpportunity(oppData);
        }

        this.renderOpportunities();
        this.updateDashboard();
        this.closeModal('opportunity-modal');
    }

    deleteOpportunity(id) {
        if (confirm('آیا مطمئن هستید؟')) {
            db.deleteOpportunity(id);
            this.renderOpportunities();
            this.updateDashboard();
        }
    }

    loadCustomersDropdown() {
        const customers = db.getCustomers();
        const selects = [
            document.getElementById('contact-customer'),
            document.getElementById('opportunity-customer')
        ];

        selects.forEach(select => {
            const currentValue = select.value;
            select.innerHTML = '<option value="">انتخاب کنید...</option>';
            customers.forEach(customer => {
                const option = document.createElement('option');
                option.value = customer.id;
                option.textContent = customer.name;
                select.appendChild(option);
            });
            select.value = currentValue;
        });
    }

    closeModal(modalId) {
        document.getElementById(modalId).classList.remove('active');
        this.currentEditingId = null;
        this.currentEditingType = null;
    }

    formatCurrency(value) {
        return new Intl.NumberFormat('fa-IR', {
            style: 'currency',
            currency: 'IRR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(value);
    }
}

const app = new CRMApp();
