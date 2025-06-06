const sports = ['football', 'baseball', 'basketball', 'hockey', 'soccer', 'boxing', 'ufc'];
let bets = JSON.parse(localStorage.getItem('bets')) || {};
let currentSport = null;
let editIndex = null;
let showAllSportsStats = true;

// Initialize bets object
sports.forEach(sport => {
    if (!bets[sport]) bets[sport] = [];
});

// Show welcome modal on load
document.addEventListener('DOMContentLoaded', () => {
    const welcomeModal = new bootstrap.Modal(document.getElementById('welcomeModal'), { backdrop: 'static' });
    welcomeModal.show();
});

function selectSport(sport) {
    currentSport = sport;
    document.getElementById('sport-title').textContent = `${sport.charAt(0).toUpperCase() + sport.slice(1)} Bets`;
    document.getElementById('main-content').classList.remove('d-none');
    bootstrap.Modal.getInstance(document.getElementById('welcomeModal')).hide();
    updateStats();
    displayBets();
}

function showWelcomeModal() {
    document.getElementById('main-content').classList.add('d-none');
    const welcomeModal = new bootstrap.Modal(document.getElementById('welcomeModal'));
    welcomeModal.show();
}

document.getElementById('bet-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const teams = document.getElementById('teams').value.trim();
    const date = document.getElementById('date').value;
    const amount = parseFloat(document.getElementById('amount').value);

    if (!teams || !date || isNaN(amount)) {
        showAlert('Please fill in all fields with valid values', 'danger');
        return;
    }

    bets[currentSport].push({ teams, date, amount });
    localStorage.setItem('bets', JSON.stringify(bets));

    // Feedback
    if (amount > 0) {
        showAlert('Congrats!', 'success');
    } else {
        showAlert('We’ll get them next time!', 'warning');
    }

    updateStats();
    displayBets();
    document.getElementById('bet-form').reset();
});

function resetBets() {
    if (confirm('Are you sure you want to reset all bets? This will delete all your betting data.')) {
        localStorage.removeItem('bets');
        bets = {};
        sports.forEach(sport => {
            bets[sport] = [];
        });
        localStorage.setItem('bets', JSON.stringify(bets));
        updateStats();
        displayBets();
        showAlert('All bets have been reset.', 'success');
    }
}

function toggleStatsView() {
    showAllSportsStats = !showAllSportsStats;
    const toggleBtn = document.getElementById('toggle-stats-btn');
    const statsTitle = document.getElementById('stats-title');
    if (showAllSportsStats) {
        toggleBtn.textContent = 'Show Sport Stats';
        statsTitle.textContent = 'Monthly Stats (All Sports)';
    } else {
        toggleBtn.textContent = 'Show All Sports Stats';
        statsTitle.textContent = `Monthly Stats (${currentSport.charAt(0).toUpperCase() + currentSport.slice(1)})`;
    }
    updateStats();
}

function updateStats() {
    const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
    let monthlyWins = 0, monthlyLosses = 0, totalAmount = 0;

    if (showAllSportsStats) {
        sports.forEach(sport => {
            bets[sport].forEach(bet => {
                if (bet.date && bet.date.slice(0, 7) === currentMonth) {
                    if (bet.amount > 0) {
                        monthlyWins++;
                        totalAmount += bet.amount;
                    } else {
                        monthlyLosses++;
                        totalAmount += bet.amount;
                    }
                }
            });
        });
    } else {
        bets[currentSport].forEach(bet => {
            if (bet.date && bet.date.slice(0, 7) === currentMonth) {
                if (bet.amount > 0) {
                    monthlyWins++;
                    totalAmount += bet.amount;
                } else {
                    monthlyLosses++;
                    totalAmount += bet.amount;
                }
            }
        });
    }

    const monthlyTotal = monthlyWins + monthlyLosses;
    const monthlyRatio = monthlyTotal ? ((monthlyWins / monthlyTotal) * 100).toFixed(2) : 0;
    const statsElement = document.getElementById('monthly-stats');
    const totalText = totalAmount >= 0 ? `+$${totalAmount.toFixed(2)}` : `-$${Math.abs(totalAmount).toFixed(2)}`;
    statsElement.textContent = `Monthly: ${monthlyWins} wins, ${monthlyLosses} losses (${monthlyRatio}%), Total: ${totalText}`;
    statsElement.className = monthlyWins > monthlyLosses && monthlyTotal > 0 ? 'green' : 'red';
}

function displayBets() {
    const betList = document.getElementById('bet-list');
    const today = new Date().toISOString().split('T')[0];
    betList.innerHTML = '';
    bets[currentSport].filter(bet => bet.date === today).forEach((bet, index) => {
        const div = document.createElement('div');
        div.className = `bet-item ${bet.amount > 0 ? 'won' : 'lost'}`;
        const statusClass = bet.amount > 0 ? 'status-won' : 'status-lost';
        div.innerHTML = `
            ${bet.date} - ${bet.teams} - $${Math.abs(bet.amount).toFixed(2)} (<span class="${statusClass}">${bet.amount > 0 ? 'Won' : 'Lost'}</span>)
            <button class="btn btn-sm btn-warning" onclick="openEditModal(${index})">Edit</button>
            <button class="btn btn-sm btn-danger" onclick="deleteBet(${index})">Delete</button>
        `;
        betList.appendChild(div);
    });
}

function openEditModal(index) {
    editIndex = index;
    const bet = bets[currentSport][index];
    document.getElementById('edit-teams').value = bet.teams;
    document.getElementById('edit-date').value = bet.date;
    document.getElementById('edit-amount').value = bet.amount;
    const editModal = new bootstrap.Modal(document.getElementById('editModal'));
    editModal.show();
}

document.getElementById('edit-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const teams = document.getElementById('edit-teams').value.trim();
    const date = document.getElementById('edit-date').value;
    const amount = parseFloat(document.getElementById('edit-amount').value);

    if (!teams || !date || isNaN(amount)) {
        showAlert('Please fill in all fields with valid values', 'danger');
        return;
    }

    bets[currentSport][editIndex] = { teams, date, amount };
    localStorage.setItem('bets', JSON.stringify(bets));

    updateStats();
    displayBets();
    bootstrap.Modal.getInstance(document.getElementById('editModal')).hide();
});

function deleteBet(index) {
    if (confirm('Are you sure you want to delete this bet?')) {
        bets[currentSport].splice(index, 1);
        localStorage.setItem('bets', JSON.stringify(bets));

        updateStats();
        displayBets();
    }
}

function showAlert(message, type) {
    const alertContainer = document.getElementById('alert-container');
    const alert = document.createElement('div');
    alert.className = `alert alert-${type} alert-dismissible fade show`;
    alert.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    `;
    alertContainer.appendChild(alert);
    setTimeout(() => {
        if (alert.parentNode) {
            alert.classList.remove('show');
            alert.classList.add('fade');
            setTimeout(() => alert.remove(), 150);
        }
    }, 3000);
}