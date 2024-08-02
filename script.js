class HamsterKombat {
    constructor() {
        this.stats = {
            level: 1,
            exp: 0,
            expToNextLevel: 100,
            health: 100,
            maxHealth: 100,
            attack: 10,
            defense: 5,
            coins: 0,
            regen: 1
        };

        this.upgrades = {
            attack: { level: 1, cost: 10 },
            defense: { level: 1, cost: 10 },
            health: { level: 1, cost: 20 },
            regen: { level: 1, cost: 30 }
        };

        this.elements = {
            hamster: document.getElementById('hamster'),
            exp: document.getElementById('exp'),
            expToLevel: document.getElementById('exp-to-level'),
            expBar: document.getElementById('exp-bar'),
            level: document.getElementById('level'),
            health: document.getElementById('health'),
            maxHealth: document.getElementById('max-health'),
            healthBar: document.getElementById('health-bar'),
            coins: document.getElementById('coins'),
            expGain: document.getElementById('exp-gain'),
            username: document.getElementById('username'),
            upgradeAttack: document.getElementById('upgrade-attack'),
            upgradeDefense: document.getElementById('upgrade-defense'),
            upgradeHealth: document.getElementById('upgrade-health'),
            upgradeRegen: document.getElementById('upgrade-regen'),
            battle: document.getElementById('battle'),
            battleLog: document.getElementById('battle-log')
        };

        this.initTelegramMiniApp();
        this.initEventListeners();
        this.loadProgress();
        this.startHealthRegeneration();
        this.updateUI();
    }

    initEventListeners() {
        this.elements.hamster.addEventListener('click', () => this.trainHamster());
        this.elements.upgradeAttack.addEventListener('click', () => this.upgrade('attack'));
        this.elements.upgradeDefense.addEventListener('click', () => this.upgrade('defense'));
        this.elements.upgradeHealth.addEventListener('click', () => this.upgrade('health'));
        this.elements.upgradeRegen.addEventListener('click', () => this.upgrade('regen'));
        this.elements.battle.addEventListener('click', () => this.battle());
    }

    trainHamster() {
        this.stats.exp += 1;
        this.stats.coins += 1;
        this.showExpGain(1);
        this.checkLevelUp();
        this.updateUI();
        this.saveProgress();
    }

    upgrade(type) {
        const upgrade = this.upgrades[type];
        if (this.stats.coins >= upgrade.cost) {
            this.stats.coins -= upgrade.cost;
            upgrade.level++;
            upgrade.cost = Math.floor(upgrade.cost * 1.5);

            switch(type) {
                case 'attack':
                    this.stats.attack += 2;
                    break;
                case 'defense':
                    this.stats.defense += 1;
                    break;
                case 'health':
                    this.stats.maxHealth += 10;
                    this.stats.health = this.stats.maxHealth;
                    break;
                case 'regen':
                    this.stats.regen += 1;
                    break;
            }

            this.updateUI();
            this.saveProgress();
        }
    }

    checkLevelUp() {
        if (this.stats.exp >= this.stats.expToNextLevel) {
            this.stats.level++;
            this.stats.exp -= this.stats.expToNextLevel;
            this.stats.expToNextLevel = Math.floor(this.stats.expToNextLevel * 1.5);
            this.stats.attack += 1;
            this.stats.defense += 1;
            this.stats.maxHealth += 5;
            this.stats.health = this.stats.maxHealth;
            this.updateUI();
            this.saveProgress();
        }
    }

    startHealthRegeneration() {
        setInterval(() => {
            if (this.stats.health < this.stats.maxHealth) {
                this.stats.health = Math.min(this.stats.health + this.stats.regen, this.stats.maxHealth);
                this.updateUI();
                this.saveProgress();
            }
        }, 5000);
    }

    showExpGain(amount) {
        this.elements.expGain.textContent = `+${amount}`;
        this.elements.expGain.style.opacity = '1';
        setTimeout(() => {
            this.elements.expGain.style.opacity = '0';
        }, 1000);
    }

    battle() {
        const enemy = {
            name: `Enemy Hamster Lv.${this.stats.level}`,
            health: this.stats.maxHealth,
            attack: this.stats.attack,
            defense: this.stats.defense
        };

        let battleLog = [];

        while (this.stats.health > 0 && enemy.health > 0) {
            // Player attacks
            const playerDamage = Math.max(0, this.stats.attack - enemy.defense);
            enemy.health -= playerDamage;
            battleLog.push(`You deal ${playerDamage} damage to ${enemy.name}`);

            if (enemy.health <= 0) {
                battleLog.push(`You defeated ${enemy.name}!`);
                const expGain = 10 * this.stats.level;
                const coinGain = 5 * this.stats.level;
                this.stats.exp += expGain;
                this.stats.coins += coinGain;
                battleLog.push(`You gained ${expGain} EXP and ${coinGain} coins!`);
                break;
            }

            // Enemy attacks
            const enemyDamage = Math.max(0, enemy.attack - this.stats.defense);
            this.stats.health -= enemyDamage;
            battleLog.push(`${enemy.name} deals ${enemyDamage} damage to you`);

            if (this.stats.health <= 0) {
                battleLog.push(`You were defeated by ${enemy.name}!`);
                break;
            }
        }

        this.elements.battleLog.innerHTML = battleLog.map(log => `<p>${log}</p>`).join('');
        this.checkLevelUp();
        this.updateUI();
        this.saveProgress();
    }

    updateUI() {
        this.elements.exp.textContent = this.stats.exp;
        this.elements.expToLevel.textContent = this.stats.expToNextLevel;
        this.elements.expBar.style.width = `${(this.stats.exp / this.stats.expToNextLevel) * 100}%`;
        this.elements.level.textContent = this.stats.level;
        this.elements.health.textContent = Math.floor(this.stats.health);
        this.elements.maxHealth.textContent = this.stats.maxHealth;
        this.elements.healthBar.style.width = `${(this.stats.health / this.stats.maxHealth) * 100}%`;
        this.elements.coins.textContent = this.stats.coins;

        this.elements.upgradeAttack.textContent = `Upgrade Attack (Cost: ${this.upgrades.attack.cost})`;
        this.elements.upgradeDefense.textContent = `Upgrade Defense (Cost: ${this.upgrades.defense.cost})`;
        this.elements.upgradeHealth.textContent = `Upgrade Health (Cost: ${this.upgrades.health.cost})`;
        this.elements.upgradeRegen.textContent = `Upgrade Regen (Cost: ${this.upgrades.regen.cost})`;

        this.elements.upgradeAttack.disabled = this.stats.coins < this.upgrades.attack.cost;
        this.elements.upgradeDefense.disabled = this.stats.coins < this.upgrades.defense.cost;
        this.elements.upgradeHealth.disabled = this.stats.coins < this.upgrades.health.cost;
        this.elements.upgradeRegen.disabled = this.stats.coins < this.upgrades.regen.cost;

        this.elements.upgradeAttack.classList.toggle('opacity-50', this.stats.coins < this.upgrades.attack.cost);
        this.elements.upgradeDefense.classList.toggle('opacity-50', this.stats.coins < this.upgrades.defense.cost);
        this.elements.upgradeHealth.classList.toggle('opacity-50', this.stats.coins < this.upgrades.health.cost);
        this.elements.upgradeRegen.classList.toggle('opacity-50', this.stats.coins < this.upgrades.regen.cost);
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
                const message = `I've reached level ${this.stats.level} in Hamster Kombat with ${this.stats.exp} EXP and ${this.stats.coins} coins!`;
                window.Telegram.WebApp.sendData(message);
            });
        } else {
            console.warn('Telegram WebApp is not available. Running in standalone mode.');
            this.elements.username.style.display = 'none';
        }
    }

    saveProgress() {
        const progress = {
            stats: this.stats,
            upgrades: this.upgrades
        };
        localStorage.setItem('hamsterKombatProgress', JSON.stringify(progress));
    }

    loadProgress() {
        const savedProgress = localStorage.getItem('hamsterKombatProgress');
        if (savedProgress) {
            const progress = JSON.parse(savedProgress);
            this.stats = progress.stats;
            this.upgrades = progress.upgrades;
        }
    }
}

// Initialize the game
const game = new HamsterKombat();
