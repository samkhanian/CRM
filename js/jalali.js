class JalaliCalendar {
    constructor() {
        this.farsiMonths = [
            'فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور',
            'مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند'
        ];

        this.farsiDays = [
            'شنبه', 'یکشنبه', 'دوشنبه', 'سه‌شنبه', 'چهارشنبه', 'پنج‌شنبه', 'جمعه'
        ];

        this.farsiNumbers = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
        this.currentPickerDate = new Date();
    }

    toFarsiNumber(num) {
        if (!num) return '';
        return String(num).split('').map(d => this.farsiNumbers[d]).join('');
    }

    toEnglishNumber(str) {
        if (!str) return '';
        const farsiToEng = {
            '۰': '0', '۱': '1', '۲': '2', '۳': '3', '۴': '4',
            '۵': '5', '۶': '6', '۷': '7', '۸': '8', '۹': '9'
        };
        return String(str).split('').map(d => farsiToEng[d] || d).join('');
    }

    gregorianToJalali(gDate) {
        if (typeof gDate === 'string') {
            gDate = new Date(gDate);
        }

        const gy = gDate.getFullYear();
        const gm = gDate.getMonth() + 1;
        const gd = gDate.getDate();

        let jy, jm, jd;

        const g_d_n = 365 * gy + Math.floor((gy + 3) / 4) - Math.floor((gy + 99) / 100) +
            Math.floor((gy + 399) / 400);

        let j_d_n = 0;
        for (let i = 0; i < gm; i++) {
            switch (i) {
                case 0: case 2: case 4: case 6: case 7: case 9: case 11:
                    j_d_n += 31;
                    break;
                case 1:
                    if ((gy % 4 === 0 && gy % 100 !== 0) || (gy % 400 === 0)) {
                        j_d_n += 29;
                    } else {
                        j_d_n += 28;
                    }
                    break;
                case 3: case 5: case 8: case 10:
                    j_d_n += 30;
                    break;
            }
        }
        j_d_n += gd;

        jy = -1595 + 33 * Math.floor(g_d_n / 12053);
        g_d_n %= 12053;

        jy += 4 * Math.floor(g_d_n / 1461);
        g_d_n %= 1461;

        if (g_d_n > 365) {
            jy += Math.floor((g_d_n - 1) / 365);
            g_d_n = (g_d_n - 1) % 365;
        }

        jd = g_d_n + 1;

        if (jy <= 99) jy += 100;

        for (let i = 0; i < 12; i++) {
            let v = i < 6 ? 31 : i < 11 ? 30 : this.isLeapJalali(jy) ? 30 : 29;
            if (jd <= v) break;
            jd -= v;
            jm = i + 1;
        }

        return { year: jy, month: jm || 1, day: jd };
    }

    jalaliToGregorian(jy, jm, jd) {
        jy += 1595;
        let days = 365 * jy + Math.floor(jy / 33) * 8 + Math.floor((jy % 33 + 3) / 4) + 78 + jd;

        if (jm > 1) {
            days += (jm - 1) * 31;
        }
        if (jm > 7) {
            days += (jm - 7) * 30;
        }

        const gy = 400 * Math.floor(days / 146097);
        days %= 146097;

        let flag = true;
        if (days >= 36525) {
            days--;
            gy += 100 * Math.floor(days / 36524);
            days %= 36524;
            if (days >= 365) {
                days++;
            }
            flag = false;
        }

        gy += 4 * Math.floor(days / 1461);
        days %= 1461;

        if (flag) {
            if (days >= 365) {
                days--;
                gy += Math.floor(days / 365);
                days = (days % 365) + 1;
            }
        } else {
            gy += Math.floor(days / 365);
            days = (days % 365) + 1;
        }

        const gm = [0, 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
        if ((gy % 400 === 0) || ((gy % 100 !== 0) && (gy % 4 === 0))) {
            gm[2] = 29;
        }

        let gd = days;
        let m = 0;
        for (let i = 0; i < gm.length; i++) {
            v = gm[i];
            if (gd <= v) break;
            gd -= v;
            m++;
        }

        return new Date(gy, m - 1, gd);
    }

    isLeapJalali(jy) {
        return ((jy + 2346) * 683) % 2820 < 683;
    }

    formatJalaliDate(jDate, format = 'YYYY/MM/DD') {
        if (!jDate) return '';
        const y = this.toFarsiNumber(jDate.year);
        const m = this.toFarsiNumber(String(jDate.month).padStart(2, '0'));
        const d = this.toFarsiNumber(String(jDate.day).padStart(2, '0'));

        return format
            .replace('YYYY', y)
            .replace('MM', m)
            .replace('DD', d);
    }

    getToday() {
        return this.gregorianToJalali(new Date());
    }

    getFormattedToday(format = 'YYYY/MM/DD') {
        return this.formatJalaliDate(this.getToday(), format);
    }

    createDatePicker(inputElement, onDateSelect) {
        const pickerId = 'jalali-picker-' + Math.random().toString(36).substr(2, 9);
        const pickerContainer = document.createElement('div');
        pickerContainer.id = pickerId;
        pickerContainer.className = 'jalali-date-picker';
        pickerContainer.style.display = 'none';

        const getInitialDate = () => {
            if (inputElement.dataset.gregorianDate) {
                return new Date(inputElement.dataset.gregorianDate);
            }
            return new Date();
        };

        const currentDate = getInitialDate();
        const jalaliDate = this.gregorianToJalali(currentDate);
        
        this.renderPickerUI(pickerContainer, jalaliDate, (selectedDate) => {
            const gregorianDate = this.jalaliToGregorian(selectedDate.year, selectedDate.month, selectedDate.day);
            const dateString = gregorianDate.toISOString().split('T')[0];
            inputElement.dataset.gregorianDate = dateString;
            const jalaliFormatted = this.gregorianToJalali(gregorianDate);
            inputElement.value = this.formatJalaliDate(jalaliFormatted, 'YYYY/MM/DD');
            pickerContainer.style.display = 'none';
            if (onDateSelect) onDateSelect(dateString);
        });

        inputElement.parentElement.style.position = 'relative';
        inputElement.parentElement.appendChild(pickerContainer);

        inputElement.addEventListener('focus', () => {
            pickerContainer.style.display = 'block';
        });

        document.addEventListener('click', (e) => {
            if (!e.target.closest('#' + pickerId) && e.target !== inputElement) {
                pickerContainer.style.display = 'none';
            }
        });
    }

    renderPickerUI(container, jalaliDate, onSelect) {
        const self = this;
        const html = `
            <div class="picker-header">
                <button class="picker-nav-btn" data-action="prev-month">◀</button>
                <div class="picker-month-year">
                    <span class="picker-month">${this.farsiMonths[jalaliDate.month - 1]}</span>
                    <span class="picker-year">${this.toFarsiNumber(jalaliDate.year)}</span>
                </div>
                <button class="picker-nav-btn" data-action="next-month">▶</button>
            </div>
            <div class="picker-weekdays">
                ${this.farsiDays.map(day => `<div class="picker-weekday">${day}</div>`).join('')}
            </div>
            <div class="picker-days" data-year="${jalaliDate.year}" data-month="${jalaliDate.month}">
                ${this.generateDays(jalaliDate.year, jalaliDate.month).map((day, i) => {
                    return day ? `<button class="picker-day" data-day="${day}">${this.toFarsiNumber(day)}</button>` : '<div class="picker-day empty"></div>';
                }).join('')}
            </div>
        `;
        
        container.innerHTML = html;

        container.querySelectorAll('[data-action]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const action = btn.dataset.action;
                const daysDiv = container.querySelector('.picker-days');
                let year = parseInt(daysDiv.dataset.year);
                let month = parseInt(daysDiv.dataset.month);
                
                if (action === 'prev-month') {
                    month--;
                    if (month < 1) { month = 12; year--; }
                } else if (action === 'next-month') {
                    month++;
                    if (month > 12) { month = 1; year++; }
                }
                
                self.renderPickerUI(container, { year, month, day: 1 }, onSelect);
            });
        });

        container.querySelectorAll('[data-day]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const day = parseInt(btn.dataset.day);
                const daysDiv = container.querySelector('.picker-days');
                const year = parseInt(daysDiv.dataset.year);
                const month = parseInt(daysDiv.dataset.month);
                onSelect({ year, month, day });
            });
        });
    }

    generateDays(jalaliYear, jalaliMonth) {
        const daysInMonth = jalaliMonth <= 6 ? 31 : jalaliMonth <= 11 ? 30 : this.isLeapJalali(jalaliYear) ? 30 : 29;
        const firstDay = this.jalaliToGregorian(jalaliYear, jalaliMonth, 1);
        const firstDayOfWeek = firstDay.getDay();
        
        const days = new Array(firstDayOfWeek).fill(null);
        for (let i = 1; i <= daysInMonth; i++) {
            days.push(i);
        }
        return days;
    }
}

const jalali = new JalaliCalendar();
