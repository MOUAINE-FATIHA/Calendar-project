class Calendrier {
    constructor() {
        this.currentDate = new Date();
        this.reservations = {};
        this.Id = null;
        this.Date = null;
        this.init();
    }
    init() {
        this.EventButtons();
        this.update();
    }

    EventButtons() {
        document.getElementById('precedente').addEventListener('click', () => this.navigate(-1));
        document.getElementById('suivante').addEventListener('click', () => this.navigate(1));
        document.getElementById('ajout').addEventListener('click', () => this.openform());
        document.querySelector('.annuler').addEventListener('click', () => this.exit());
        document.getElementById('overlay').addEventListener('click', () => this.exit());
        document.getElementById('add').addEventListener('click', () => this.save());
        document.getElementById('deleteBtn').addEventListener('click', () => this.delete());
    }
    navigate(direction) {
        this.currentDate.setMonth(this.currentDate.getMonth() + direction);
        this.update();
    }
    update() {
        this.updateTitle();
        this.affichage();
    }

    updateTitle() {
        const months = ['janvier', 'fevrier', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'decembre'];
        document.getElementById('date').textContent = `${months[this.currentDate.getMonth()]} ${this.currentDate.getFullYear()}`;
    }
    affichage() {
        const annee = this.currentDate.getFullYear();
        const mois = this.currentDate.getMonth();
        const jourP = new Date(annee, mois, 1);
        const jourC = new Date(jourP);
        jourC.setDate(jourC.getDate() - jourP.getDay());
        const cas = document.querySelectorAll('.jour');
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        cas.forEach((cell, i) => {
            const currentDate = new Date(jourC);
            currentDate.setDate(jourC.getDate() + i);
            const Moi = currentDate.getMonth() !== mois;
            const semaine = currentDate.getDay() === 0 || currentDate.getDay() === 6;
            const journee = currentDate.getTime() === today.getTime();
            const dateKey = this.formatDateKey(currentDate);

            cell.className = 'jour';
            if (Moi) cell.classList.add('autre-mois');
            if (semaine) cell.classList.add('weekend');
            if (journee) cell.classList.add('aujourdhui');
            cell.dataset.date = dateKey;

            cell.innerHTML = '';
            const dayNumber = document.createElement('div');
            dayNumber.className = 'nb-Jour';
            dayNumber.textContent = currentDate.getDate();
            cell.appendChild(dayNumber);

            if (this.reservations[dateKey]) {
                this.reservations[dateKey].forEach(res => {
                    const event = document.createElement('div');
                    event.className = `event ${res.type}`;
                    event.dataset.id = res.id;
                    event.dataset.date = dateKey;
                    event.textContent = `${res.NameC} - ${res.HeurD}`;
                    event.addEventListener('click', (e) => {
                        e.stopPropagation();
                        this.edit(res, dateKey);
                    });
                    cell.appendChild(event);
                });
            }

            if (!semaine) {
                cell.addEventListener('click', () => this.openform(dateKey));
            }
        });
    }

    formatDateKey(date) {
        return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    }
    openform(date = null) {
        this.Id = null;
        this.Date = date || this.formatDateKey(this.currentDate);
        document.querySelector('#modal h4').textContent = 'Veuillez ajouter votre reservation';
        document.getElementById('reservationForm').reset();
        document.getElementById('reservationDate').value = this.Date;
        document.getElementById('deleteBtn').style.display = 'none';
        document.getElementById('modal').classList.add('show');
        document.getElementById('overlay').classList.add('show');
    }
    exit() {
        document.getElementById('modal').classList.remove('show');
        document.getElementById('overlay').classList.remove('show');
    }
    edit(reservation, date) {
        this.Id = reservation.id;
        this.Date = date;
        document.querySelector('#modal h4').textContent = 'Veuillez modifier la reservation';
        document.getElementById('Name').value = reservation.NameC;
        document.getElementById('HeurD').value = reservation.HeurD;
        document.getElementById('HeurF').value = reservation.HeurF;
        document.getElementById('nb').value = reservation.nb;
        document.getElementById('select').value = reservation.type;
        document.getElementById('reservationDate').value = date;
        document.getElementById('deleteBtn').style.display = 'inline-block';
        document.getElementById('modal').classList.add('show');
        document.getElementById('overlay').classList.add('show');
    }

    save() {
        const form = document.getElementById('reservationForm');
        if (!form.checkValidity()) {
            form.reportValidity();
            return;
        }

        const dateKey = document.getElementById('reservationDate').value || this.Date;
        const NameC = document.getElementById('Name').value.trim();
        const HeurD = document.getElementById('HeurD').value;
        const HeurF = document.getElementById('HeurF').value;
        const nb = parseInt(document.getElementById('nb').value);
        const type = document.getElementById('select').value;

        if (HeurD >= HeurF) {
            alert('Attention ! heure fin doit etre apres heure debut');
            return;
        }

        const reservation = {
            id: this.Id || Date.now(),
            NameC,
            HeurD,
            HeurF,
            nb,
            type
        };

        if (!this.reservations[dateKey]) {
            this.reservations[dateKey] = [];
        }

        if (this.Id) {
            const index = this.reservations[dateKey].findIndex(reserv => reserv.id === this.Id);
            if (index !== -1) {
                this.reservations[dateKey][index] = reservation;
            }
        } else {
            this.reservations[dateKey].push(reservation);
        }

        this.exit();
        this.update();
    }

    delete() {
        if (!this.Id || !this.Date) return;

        if (confirm('Etes-vous sur de supprimer cette reservation ?')) {
            const dateKey = this.Date;
            this.reservations[dateKey] = this.reservations[dateKey].filter(reserv => reserv.id !== this.Id);

            if (this.reservations[dateKey].length === 0) {
                delete this.reservations[dateKey];
            }

            this.exit();
            this.update();
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new Calendrier();
});