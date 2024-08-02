const ENV = window.PocketPetConfig;

class PocketPet {
    constructor() {
        this.exp = 0;
        this.level = 1;
        this.expToNextLevel = 100;
        this.energy = ENV.INITIAL_ENERGY;
        this.coins = 0;
        this.clickValue = 1;
        this.energyMax = ENV.INITIAL_ENERGY;
        this.energyRegen = 1;
        this.coinMultiplier = 1;

        this.upgrades = {
            click: { level: 1, cost: 10 },
            energy: { level: 1, cost: 20 },
            regen: { level: 1, cost: 30 },
            coin: { level: 1, cost: 50 }
        };

        this.elements = {
            pet: document.getElementById('pet'),
            exp: document.getElementById('exp'),
            expBar: document.getElementById('exp-bar'),
            level: document.getElementById('level'),
            energy: document.getElementById('energy'),
            energyBar: document.getElementById('energy-bar'),
            coins: document.getElementById('coins'),
            expGain: document.getElementById('exp-gain'),
            username: document.getElementById('username'),
            upgradeClick: document.getElementById('upgrade-click'),
            upgradeEnergy: document.getElementById('upgrade-energy'),
            upgradeRegen: document.getElementById('upgrade-regen'),
            upgradeCoin: document.getElementById('upgrade-coin'),
            mainContainer: document.querySelector('.bg-gray-800')  // Add this line
        };

        this.initTelegramMiniApp();
        this.initEventListeners();
        this.startEnergyRegeneration();
        this.updateUI();
    }

    initEventListeners() {
        this.elements.pet.addEventListener('click', () => this.clickPet());
        this.elements.upgradeClick.addEventListener('click', () => this.upgrade('click'));
        this.elements.upgradeEnergy.addEventListener('click', () => this.upgrade('energy'));
        this.elements.upgradeRegen.addEventListener('click', () => this.upgrade('regen'));
        this.elements.upgradeCoin.addEventListener('click', () => this.upgrade('coin'));
        this.elements.pet.src = ENV.PET_IMAGE_URL;
    }

    clickPet() {
        if (this.energy > 0) {
            this.exp += this.clickValue;
            this.coins += this.clickValue * this.coinMultiplier;
            this.energy--;
            this.showExpGain();
            this.checkLevelUp();
            this.updateUI();
        }
    }

    upgrade(type) {
        const upgrade = this.upgrades[type];
        if (this.coins >= upgrade.cost) {
            this.coins -= upgrade.cost;
            upgrade.level++;
            upgrade.cost = Math.floor(upgrade.cost * ENV.UPGRADE_COST_MULTIPLIER);

            switch(type) {
                case 'click':
                    this.clickValue++;
                    break;
                case 'energy':
                    this.energyMax += 10;
                    break;
                case 'regen':
                    this.energyRegen++;
                    break;
                case 'coin':
                    this.coinMultiplier++;
                    break;
            }

            this.updateUI();
        }
    }

    checkLevelUp() {
        if (this.exp >= this.expToNextLevel) {
            this.level++;
            this.exp -= this.expToNextLevel;
            this.expToNextLevel = Math.floor(this.expToNextLevel * 1.5);
            this.energy = this.energyMax; // Refill energy on level up
            this.updateUI();
        }
    }

    startEnergyRegeneration() {
        setInterval(() => {
            if (this.energy < this.energyMax) {
                this.energy = Math.min(this.energy + this.energyRegen, this.energyMax);
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
        this.elements.expBar.style.width = `${(this.exp / this.expToNextLevel) * 100}%`;
        this.elements.level.textContent = this.level;
        this.elements.energy.textContent = this.energy;
        this.elements.energyBar.style.width = `${(this.energy / this.energyMax) * 100}%`;
        this.elements.coins.textContent = this.coins;

        this.elements.upgradeClick.textContent = `Upgrade Click (Cost: ${this.upgrades.click.cost})`;
        this.elements.upgradeEnergy.textContent = `Upgrade Energy (Cost: ${this.upgrades.energy.cost})`;
        this.elements.upgradeRegen.textContent = `Upgrade Regen (Cost: ${this.upgrades.regen.cost})`;
        this.elements.upgradeCoin.textContent = `Upgrade Coin (Cost: ${this.upgrades.coin.cost})`;

        this.elements.upgradeClick.disabled = this.coins < this.upgrades.click.cost;
        this.elements.upgradeEnergy.disabled = this.coins < this.upgrades.energy.cost;
        this.elements.upgradeRegen.disabled = this.coins < this.upgrades.regen.cost;
        this.elements.upgradeCoin.disabled = this.coins < this.upgrades.coin.cost;

        this.elements.upgradeClick.classList.toggle('opacity-50', this.coins < this.upgrades.click.cost);
        this.elements.upgradeEnergy.classList.toggle('opacity-50', this.coins < this.upgrades.energy.cost);
        this.elements.upgradeRegen.classList.toggle('opacity-50', this.coins < this.upgrades.regen.cost);
        this.elements.upgradeCoin.classList.toggle('opacity-50', this.coins < this.upgrades.coin.cost);

        this.elements.pet.classList.toggle('cursor-not-allowed', this.energy === 0);
    }

    initTelegramMiniApp() {
        if (window.Telegram && window.Telegram.WebApp) {
            window.Telegram.WebApp.ready();
            
            const user = window.Telegram.WebApp.initDataUnsafe.user;
            if (user) {
                this.elements.username.textContent = `@${user.username || 'Unknown'}`;
            } else {
                this.elements.username.style.display = 'none';
            }

            window.Telegram.WebApp.MainButton.setText('Share Progress').show().onClick(() => {
                const message = `I've reached level ${this.level} in PocketPet with ${this.exp} EXP and ${this.coins} coins!`;
                window.Telegram.WebApp.sendData(message);
            });

            this.applyTelegramTheme();
        } else {
            console.warn('Telegram WebApp is not available. Running in standalone mode.');
            this.elements.username.style.display = 'none';
        }
    }

    applyTelegramTheme() {
        if (window.Telegram && window.Telegram.WebApp) {
            const colorScheme = window.Telegram.WebApp.colorScheme;
            if (colorScheme === 'light') {
                document.body.classList.remove('bg-pet-dark');
                document.body.classList.add('bg-gray-100', 'text-pet-dark');
                if (this.elements.mainContainer) {
                    this.elements.mainContainer.classList.remove('bg-gray-800');
                    this.elements.mainContainer.classList.add('bg-white');
                }
            }
        }
    }
}

const game = new PocketPet();
