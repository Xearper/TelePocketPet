// Use the configuration from the HTML file
const ENV = window.PocketPetConfig;

class PocketPet {
    constructor() {
        this.exp = 0;
        this.energy = ENV.INITIAL_ENERGY;
        this.clickValue = 1;
        this.upgradeCost = 10;
        this.level = 1;

        this.elements = {
            pet: document.getElementById('pet'),
            exp: document.getElementById('exp'),
            energy: document.getElementById('energy'),
            energyBar: document.getElementById('energy-bar'),
            upgrade: document.getElementById('upgrade'),
            expGain: document.getElementById('exp-gain'),
            username: document.getElementById('username'),
        };

        this.initTelegramMiniApp();
        this.initEventListeners();
        this.startEnergyRegeneration();
        this.updateUI();
    }

    initEventListeners() {
        this.elements.pet.addEventListener('click', () => this.clickPet());
        this.elements.upgrade.addEventListener('click', () => this.upgradeClickValue());
        this.elements.pet.src = ENV.PET_IMAGE_URL;
    }

    clickPet() {
        if (this.energy > 0) {
            this.exp += this.clickValue;
            this.energy--;
            this.showExpGain();
            this.updateUI();
        }
    }

    upgradeClickValue() {
        if (this.exp >= this.upgradeCost) {
            this.exp -= this.upgradeCost;
            this.clickValue++;
            this.level++;
            this.upgradeCost = Math.floor(this.upgradeCost * ENV.UPGRADE_COST_MULTIPLIER);
            this.updateUI();
        }
    }

    startEnergyRegeneration() {
        setInterval(() => {
            if (this.energy < ENV.INITIAL_ENERGY) {
                this.energy++;
                this.updateUI();
            }
        }, ENV.ENERGY_REGEN_INTERVAL);
    }

    showExpGain() {
        this.elements.expGain.textContent = `+${this.clickValue}`;
        this.elements.expGain.style.opacity = '1';
        setTimeout(() => {
            this.elements.expGain.style.opacity = '0';
        }, 1000);
    }

    updateUI() {
        this.elements.exp.textContent = this.exp;
        this.elements.energy.textContent = this.energy;
        this.elements.energyBar.style.width = `${(this.energy / ENV.INITIAL_ENERGY) * 100}%`;
        this.elements.upgrade.textContent = `Upgrade (Cost: ${this.upgradeCost} EXP)`;
        this.elements.upgrade.disabled = this.exp < this.upgradeCost;
        this.elements.upgrade.classList.toggle('opacity-50', this.exp < this.upgradeCost);
        this.elements.pet.classList.toggle('cursor-not-allowed', this.energy === 0);
    }

    initTelegramMiniApp() {
        if (window.Telegram && window.Telegram.WebApp) {
            window.Telegram.WebApp.ready();
            
            // Set the username
            const user = window.Telegram.WebApp.initDataUnsafe.user;
            if (user) {
                this.elements.username.textContent = `@${user.username || 'Unknown'}`;
            } else {
                this.elements.username.style.display = 'none';
            }

            // Setup the main button
            window.Telegram.WebApp.MainButton.setText('Share Progress').show().onClick(() => {
                const message = `I've reached level ${this.level} in PocketPet with ${this.exp} EXP!`;
                window.Telegram.WebApp.sendData(message);
            });

            // Setup theme
            this.applyTelegramTheme();
        } else {
            console.warn('Telegram WebApp is not available. Running in standalone mode.');
            this.elements.username.style.display = 'none';
        }
    }

    applyTelegramTheme() {
        if (window.Telegram && window.Telegram.WebApp) {
            const colorScheme = window.Telegram.WebApp.colorScheme;
            document.body.classList.toggle('dark', colorScheme === 'dark');
            
            if (colorScheme === 'dark') {
                document.body.classList.remove('bg-gray-100');
                document.body.classList.add('bg-gray-900', 'text-white');
                document.querySelector('.bg-white').classList.remove('bg-white');
                document.querySelector('.shadow-lg').classList.add('bg-gray-800');
            }
        }
    }
}

// Initialize the game
const game = new PocketPet();
