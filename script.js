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
            attack: { level: 1, cost: 10, increment: 2 },
            defense: { level: 1, cost: 10, increment: 1 },
            health: { level: 1, cost: 20, increment: 10 },
            regen: { level: 1, cost: 30, increment: 1 }
        };

        this.enemyTypes = [
            { name: "Tiny Mouse", multiplier: 0.8, rewards: { exp: 15, coins: 5 } },
            { name: "Angry Gerbil", multiplier: 1, rewards: { exp: 20, coins: 8 } },
            { name: "Fierce Rat", multiplier: 1.2, rewards: { exp: 25, coins: 10 } },
            { name: "Rabid Rabbit", multiplier: 1.5, rewards: { exp: 30, coins: 15 } },
            { name: "Crazy Chinchilla", multiplier: 1.8, rewards: { exp: 35, coins: 20 } }
        ];

        this.battleInterval = null;
        this.currentEnemy = null;

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
            battleLog: document.getElementById('battle-log'),
            attack: document.getElementById('attack'),
            defense: document.getElementById('defense'),
            maxHealthUpgrade: document.getElementById('max-health-upgrade'),
            regen: document.getElementById('regen'),
            navHamster: document.getElementById('nav-hamster'),
            navUpgrades: document.getElementById('nav-upgrades'),
            hamsterSection: document.getElementById('hamster-section'),
            upgradesSection: document.getElementById('upgrades-section')
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
        this.elements.battle.addEventListener('click', () => this.toggleBattle());
        this.elements.navHamster.addEventListener('click', () => this.showSection('hamster'));
        this.elements.navUpgrades.addEventListener('click', () => this.showSection('upgrades'));
    }

    showSection(section) {
        if (section === 'hamster') {
            this.elements.hamsterSection.classList.remove('hidden');
            this.elements.upgradesSection.classList.add('hidden');
            this.elements.navHamster.classList.add('text-hamster-orange');
            this.elements.navHamster.classList.remove('text-white');
            this.elements.navUpgrades.classList.add('text-white');
            this.elements.navUpgrades.classList.remove('text-hamster-orange');
        } else {
            this.elements.hamsterSection.classList.add('hidden');
            this.elements.upgradesSection.classList.remove('hidden');
            this.elements.navHamster.classList.remove('text-hamster-orange');
            this.elements.navHamster.classList.add('text-white');
            this.elements.navUpgrades.classList.remove('text-white');
            this.elements.navUpgrades.classList.add('text-hamster-orange');
        }
    }

    trainHamster() {
        const expGain = Math.floor(Math.random() * 3) + 1;
        const coinGain = Math.floor(Math.random() * 2) + 1;
        this.stats.exp += expGain;
        this.stats.coins += coinGain;
        this.showExpGain(expGain);
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
                    this.stats.attack += upgrade.increment;
                    break;
                case 'defense':
                    this.stats.defense += upgrade.increment;
                    break;
                case 'health':
                    this.stats.maxHealth += upgrade.increment;
                    this.stats.health = this.stats.maxHealth;
                    break;
                case 'regen':
                    this.stats.regen += upgrade.increment;
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
            this.updateHamsterImage();
            this.logBattle(`Level Up! Your hamster is now level ${this.stats.level}!`);
            this.updateUI();
            this.saveProgress();
        }
    }

    updateHamsterImage() {
        const imageLevel = Math.min(Math.floor((this.stats.level - 1) / 5) * 5 + 1, 16);
        this.elements.hamster.src = `hamster-${imageLevel}lvl.png`;
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

    toggleBattle() {
        if (this.battleInterval) {
            this.endBattle();
        } else {
            this.startBattle();
        }
    }

    startBattle() {
        const enemyType = this.enemyTypes[Math.floor(Math.random() * this.enemyTypes.length)];
        this.currentEnemy = {
            name: `${enemyType.name} Lv.${this.stats.level}`,
            health: Math.floor(this.stats.maxHealth * enemyType.multiplier),
            maxHealth: Math.floor(this.stats.maxHealth * enemyType.multiplier),
            attack: Math.floor(this.stats.attack * enemyType.multiplier),
            defense: Math.floor(this.stats.defense * enemyType.multiplier),
            rewards: {
                exp: Math.floor(enemyType.rewards.exp * this.stats.level),
                coins: Math.floor(enemyType.rewards.coins * this.stats.level)
            }
        };

        this.elements.battle.textContent = "Retreat";
        this.elements.battle.classList.remove("bg-red-600", "hover:bg-red-700");
        this.elements.battle.classList.add("bg-yellow-600", "hover:bg-yellow-700");
        this.elements.hamster.classList.add("shake");

        this.logBattle(`A wild ${this.currentEnemy.name} appears!`);
        this.battleInterval = setInterval(() => this.battleRound(), 1000);
    }

    endBattle() {
        clearInterval(this.battleInterval);
        this.elements.battle.textContent = "Battle!";
        this.elements.battle.classList.remove("bg-yellow-600", "hover:bg-yellow-700");
        this.elements.battle.classList.add("bg-red-600", "hover:bg-red-700");
        this.elements.hamster.classList.remove("shake");
        this.battleInterval = null;
        this.currentEnemy = null;
        this.logBattle("You retreated from the battle.");
    }

    battleRound() {
        if (!this.currentEnemy) return;

        // Player attacks
        const playerDamage = Math.max(0, this.stats.attack - this.currentEnemy.defense);
        this.currentEnemy.health -= playerDamage;
        this.logBattle(`You deal ${playerDamage} damage to ${this.currentEnemy.name}`);

        if (this.currentEnemy.health <= 0) {
            this.logBattle(`You defeated ${this.currentEnemy.name}!`);
            this.stats.exp += this.currentEnemy.rewards.exp;
            this.stats.coins += this.currentEnemy.rewards.coins;
            this.logBattle(`You gained ${this.currentEnemy.rewards.exp} EXP and ${this.currentEnemy.rewards.coins} coins!`);
            this.checkLevelUp();
            this.endBattle();
            return;
        }

        // Enemy attacks
        const enemyDamage = Math.max(0, this.currentEnemy.attack - this.stats.defense);
        this.stats.health -= enemyDamage;
        this.logBattle(`${this.currentEnemy.name} deals ${enemyDamage} damage to you`);

        if (this.stats.health <= 0) {
            this.logBattle(`You were defeated by ${this.currentEnemy.name}!`);
            this.stats.health = 1; // Prevent death, set health to 1
            this.endBattle();
        }

        this.updateUI();
        this.saveProgress();
    }

    logBattle(message) {
        const logEntry = document.createElement('p');
        logEntry.textContent = message;
        this.elements.battleLog.prepend(logEntry);
        if (this.elements.battleLog.children.length > 5) {
            this.elements.battleLog.removeChild(this.elements.battleLog.lastChild);
        }
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

        this.elements.attack.textContent = this.stats.attack;
        this.elements.defense.textContent = this.stats.defense;
        this.elements.maxHealthUpgrade.textContent = this.stats.maxHealth;
        this.elements.regen.textContent = this.stats.regen;

        this.elements.upgradeAttack.textContent = `Attack: ${this.stats.attack} (Cost: ${this.upgrades.attack.cost})`;
        this.elements.upgradeDefense.textContent = `Defense: ${this.stats.defense} (Cost: ${this.upgrades.defense.cost})`;
        this.elements.upgradeHealth.textContent = `Max Health: ${this.stats.maxHealth} (Cost: ${this.upgrades.health.cost})`;
        this.elements.upgradeRegen.textContent = `Regen: ${this.stats.regen} (Cost: ${this.upgrades.regen.cost})`;

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
            this.updateHamsterImage();
        }
    }
}

// Initialize the game
const game = new HamsterKombat();
