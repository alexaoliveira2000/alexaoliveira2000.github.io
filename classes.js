const Action = {
    STAND: 0,
    JUMP: 1,
    CROUCH: 2
}

class Item {
    constructor(context, x, y, width, height, color, id) {
        this.context = context;
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.color = color;
        this.id = id;
    }

    show() {
        this.context.fillStyle = this.color;
        this.context.fillRect(this.x, this.y, this.width, this.height);
    }

    move(dx, dy) {
        this.x += dx;
        this.y += dy;
        this.context.fillStyle = this.color;
        this.context.fillRect(this.x, this.y, this.width, this.height);
    }
}

class Agent extends Item {
    constructor(context, x, y, width, height, color, brain, generation, mutationRate, hiddenNodes) {
        super(context, x, y, width, height, color);
        this.velocity = 0;
        this.action = Action.STAND;
        this.score = 0;
        this.fitness = 0;
        this.generation = generation;
        if (brain instanceof NeuralNetwork) {
            this.brain = brain.copy();
            this.brain.mutate(mutationRate);
        } else {
            this.brain = new NeuralNetwork(4, hiddenNodes || 6, 3);
        }
    }

    calculateFitness() {
        this.fitness = (this.score / 30).toFixed(2);
    }

    collided(item) {
        const horizontalCollision = this.x + this.width >= item.x && this.x <= item.x + item.width;
        const verticalCollision = this.y + this.height >= item.y && this.y <= item.y + item.height;
        return horizontalCollision && verticalCollision;
    }

    move() {
        if (this.action == Action.JUMP) {
            this.y += this.velocity;
            this.velocity = this.velocity + GRAVITY * TIME
            if (this.y + this.height >= 400) {
                this.action == Action.STAND;
                this.y = 300;
            }
        } else if (this.action == Action.STAND) {
            this.height = 100;
            this.y = 300;
        }
        this.context.fillStyle = this.color;
        this.context.fillRect(this.x, this.y, this.width, this.height);
    }

    jump() {
        if (this.y + this.height < 400) {
            return;
        }
        if (this.action == Action.CROUCH) {
            this.stand()
            return
        }
        this.action = Action.JUMP;
        this.height = 100;
        this.velocity = -JUMP_FORCE;
        this.y += this.velocity;
    }

    crouch() {
        if (this.y + this.height != 400)
            return
        this.action = Action.CROUCH;
        this.height = 50;
        this.y = 350;
    }

    stand() {
        if (this.y + this.height != 400)
            return
        this.action = Action.STAND;
        this.height = 100;
        this.y = 300;
    }
}

class Population {
    constructor(size, context, mutationRate, hiddenNodes) {
        this.size = size;
        this.members = [];
        this.mutationRate = mutationRate;
        this.hiddenNodes = hiddenNodes;
        for (let i = 1; i <= size; i++)
            this.members.push(new Agent(context, 100, 300, 50, 100, "red", null, 1, this.mutationRate, this.hiddenNodes));
    }

    nextGeneration(doCrossover) {
        this.normalizeFitness();
        let newMembers = [];
        let pool = this.createPool(this.members);
        while (newMembers.length < this.members.length) {
            let selectedAgent = this.poolSelection(pool);
            if (doCrossover) {
                let crossoverAgent = this.poolSelection(pool, selectedAgent);
                selectedAgent.brain.crossover(crossoverAgent.brain.model, 0.5);
                let newCrossoverAgent = new Agent(crossoverAgent.context, crossoverAgent.x, crossoverAgent.y, crossoverAgent.width, crossoverAgent.height, crossoverAgent.color, crossoverAgent.brain, crossoverAgent.generation + 1);
                newMembers.push(newCrossoverAgent);
            }
            if (newMembers.length < this.members.length) {
                let newAgent = new Agent(selectedAgent.context, selectedAgent.x, selectedAgent.y, selectedAgent.width, selectedAgent.height, selectedAgent.color, selectedAgent.brain, selectedAgent.generation + 1);
                newMembers.push(newAgent);
            }
        }
        return newMembers;
    }

    normalizeFitness() {
        for (const member of this.members)
            member.score = Math.pow(member.score, 2);
        let sum = 0;
        for (const member of this.members)
            sum += member.score;
        sum = sum || 1;
        for (const member of this.members)
            member.fitness = member.score / sum;
    }

    createPool(members) {
        let pool = [];
        members.forEach((member) => {
            let fitness = Math.floor(member.fitness * 100) || 1;
            for (let i = 0; i < fitness; i++) {
                pool.push(member);
            }
        });
        return pool;
    }

    poolSelection(pool, member) {
        let selectedMember;
        do {
            selectedMember = pool[Math.floor(Math.random() * pool.length)];
        } while (selectedMember == member);
        return selectedMember;
    }

}