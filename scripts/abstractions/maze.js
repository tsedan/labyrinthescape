class MazeGenerator {
    constructor(w, h, holes, powerups) {
        this.w = w;
        this.h = h;
        this.holes = holes;
        this.powers = powerups;
    }

    generate() {
        this.H = 2 * this.h + 1;
        this.W = 2 * this.w + 1;
        this.holes = floor(this.W * this.H * this.holes);

        this.grid = new Array(this.H);
        for (let i = 0; i < this.grid.length; i++) {
            this.grid[i] = new Array(this.W);
            this.grid[i].fill(1);
        }

        let current_row = floor(random() * this.h) * 2 + 1;
        let current_col = floor(random() * this.w) * 2 + 1;
        this.grid[current_row][current_col] = 0;

        let num_trials = 0;

        while (current_row != -1 && current_col != -1) {
            num_trials += 1;
            this.walk(current_row, current_col);

            [current_row, current_col] = this.hunt(num_trials);
        }

        this.generateEntrances();

        this.grid[this.start[0]][this.start[1]] = 0;
        this.grid[this.end[0]][this.end[1]] = 0;

        this.addHoles();
        this.addPowerUps();
    }

    walk(row, col) {
        if (this.grid[row][col] == 0) {
            let this_row = row;
            let this_col = col;

            let unvisited_neighbors = this.findNeighbors(
                this_row, this_col, 2, true);

            while (unvisited_neighbors.length > 0) {
                let neighbor = unvisited_neighbors[floor(random() * unvisited_neighbors.length)];
                this.grid[neighbor[0]][neighbor[1]] = 0;
                this.grid[floor((neighbor[0] + this_row) / 2)][floor((neighbor[1] + this_col) / 2)] = 0;
                [this_row, this_col] = neighbor;

                unvisited_neighbors = this.findNeighbors(
                    this_row, this_col, 2, true);
            }
        }
    }

    findNeighbors(r, c, dist, is_wall) {
        let ns = [];
        if (r > dist - 1 && this.grid[r - dist][c] == is_wall)
            ns.push([r - dist, c]);

        if (r < this.H - dist && this.grid[r + dist][c] == is_wall)
            ns.push([r + dist, c]);

        if (c > dist - 1 && this.grid[r][c - dist] == is_wall)
            ns.push([r, c - dist]);

        if (c < this.W - dist && this.grid[r][c + dist] == is_wall)
            ns.push([r, c + dist]);

        return ns;
    }

    hunt(count) {
        if (count >= (this.H * this.W))
            return [-1, -1];

        return [floor(random() * this.h) * 2 + 1, floor(random() * this.w) * 2 + 1];
    }

    generateEntrances() {
        let start_side = floor(random() * 4);
        switch (start_side) {
            case 0:
                this.start = [0, floor(random() * this.w) * 2 + 1]; // North
                this.end = [this.H - 1, floor(random() * this.w) * 2 + 1];
                break;
            case 1:
                this.start = [this.H - 1, floor(random() * this.w) * 2 + 1];  // South
                this.end = [0, floor(random() * this.w) * 2 + 1];
                break;
            case 2:
                this.start = [floor(random() * this.h) * 2 + 1, 0];  // West
                this.end = [floor(random() * this.h) * 2 + 1, this.W - 1];
                break;
            default:
                this.start = [floor(random() * this.h) * 2 + 1, this.W - 1]  // East
                this.end = [floor(random() * this.h) * 2 + 1, 0];
        }
    }

    addHoles() {
        let holesAdded = this.holes;
        while (holesAdded > 0) {
            let current_row = floor(random() * (this.H - 2)) + 1;
            let current_col = floor(random() * (this.W - 2)) + 1;

            if (this.grid[current_row][current_col] == 0) continue;

            if ((this.grid[current_row][current_col - 1] == 1 || this.grid[current_row][current_col + 1] == 1) &&
                (this.grid[current_row - 1][current_col] == 1 || this.grid[current_row + 1][current_col] == 1)) continue;

            this.grid[current_row][current_col] = 0;
            holesAdded--;
        }
    }

    addPowerUps() {
        let allDeadEnds = [];
        for (let i = 0; i < this.H; i++) {
            for (let j = 0; j < this.W; j++) {
                if (this.grid[i][j] == 1) continue;
                if (this.findNeighbors(i, j, 1, true).length != 3) continue;

                allDeadEnds.push([i, j]);
            }
        }

        shuffleArray(allDeadEnds);

        this.powerLocs = [];
        for (let i = 0; i < min(allDeadEnds.length, this.powers); i++) {
            this.powerLocs.push(allDeadEnds[i]);
        }
    }
}

class MazeSolver {
    constructor(maze) {
        this.m = maze;

        this.visitedCells = {};
        this.solution = [];

        let current = this.m.start;
        this.solution.push(current);
        this.visit(current);

        if (this.onEdge(this.m.start)) {
            current = this.pushEdge(this.m.start);
            this.solution.push(current);
            this.visit(current);
        }
    }

    visit(cell) {
        if (!(cell in this.visitedCells))
            this.visitedCells[cell] = 0

        this.visitedCells[cell]++;
    }

    getVisitCount(cell) {
        if (!(cell in this.visitedCells))
            return 0
        else
            return this.visitedCells[cell] < 3 ? this.visitedCells[cell] : 2
    }

    what_next(ns) {
        let visitCounts = {}

        for (let i = 0; i < ns.length; i++) {
            let visit_count = this.getVisitCount(ns[i])
            if (!(visit_count in visitCounts))
                visitCounts[visit_count] = []

            visitCounts[visit_count].push(ns[i])
        }

        if (0 in visitCounts) {
            return visitCounts[0][Math.floor(Math.random() * visitCounts[0].length)];
        } else if (1 in visitCounts) {
            if (visitCounts[1].length > 1 && this.solution.length > 2)
                if (visitCounts[1].includes(this.solution[this.solution.length - 3])) {
                    const index = visitCounts[1].indexOf(this.solution[this.solution.length - 3]);
                    visitCounts[1].splice(index, 1);
                }
            return visitCounts[1][Math.floor(Math.random() * visitCounts[1].length)];
        }

        else {
            if (visitCounts[2].length > 1 && this.solution.length > 2)
                if (visitCounts[2].includes(this.solution[this.solution.length - 3])) {
                    const index = visitCounts[2].indexOf(this.solution[this.solution.length - 3]);
                    visitCounts[2].splice(index, 1);
                }
            return visitCounts[2][Math.floor(Math.random() * visitCounts[2].length)];
        }
    }

    step() {
        let ns = this.findUnblockedNeighbors(this.solution[this.solution.length - 1])
        let nxt = this.what_next(ns)

        this.solution.push(nxt)
        this.visit(nxt)
    }

    onEdge(cell) {
        let r = cell[0], c = cell[1];

        if (r == 0 || r == this.m.H - 1)
            return true
        if (c == 0 || c == this.m.W - 1)
            return true

        return false
    }

    pushEdge(cell) {
        let r = cell[0], c = cell[1];

        if (r == 0)
            return [1, c]
        else if (r == this.m.H - 1)
            return [r - 1, c]
        else if (c == 0)
            return [r, 1]
        else
            return [r, c - 1]
    }

    withinOne(cell, desire) {
        if (!cell || !desire)
            return false

        if (cell[0] == desire[0]) {
            if (Math.abs(cell[1] - desire[1]) < 2)
                return true
        } else if (cell[1] == desire[1]) {
            if (Math.abs(cell[0] - desire[0]) < 2)
                return true
        }

        return false
    }

    findUnblockedNeighbors(posi) {
        let r = posi[0], c = posi[1];
        let ns = []

        if (r > 1 && !this.m.grid[r - 1][c] && !this.m.grid[r - 2][c])
            ns.push([r - 2, c])
        if (r < this.m.H - 2 && !this.m.grid[r + 1][c] && !this.m.grid[r + 2][c])
            ns.push([r + 2, c])
        if (c > 1 && !this.m.grid[r][c - 1] && !this.m.grid[r][c - 2])
            ns.push([r, c - 2])
        if (c < this.m.W - 2 && !this.m.grid[r][c + 1] && !this.m.grid[r][c + 2])
            ns.push([r, c + 2])

        shuffleArray(ns)
        return ns
    }
}