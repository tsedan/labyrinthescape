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
        console.log(allDeadEnds.length)

        shuffleArray(allDeadEnds);

        this.powerLocs = [];
        for (let i = 0; i < min(allDeadEnds.length, this.powers); i++) {
            this.powerLocs.push(allDeadEnds[i]);
        }
    }
}
