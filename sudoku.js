function solve(grid, x = 0, y = 0, n = 1, startTime = null) {

    if (!startTime) startTime = performance.now();

    // Stop if more than 0.5 seconds
    if (performance.now() - startTime > 500)
        return "timeout";

    if (x === 9) return solved(grid);

    if (y === 9) return solve(grid, x + 1, 0, 1, startTime);

    if (grid[x][y] !== 0)
        return solve(grid, x, y + 1, 1, startTime);

    if (n === 10)
        return null;

    if (possible(x, y, n, grid)) {
        const newGrid = insertNumber(n, x, y, grid);
        const result = solve(newGrid, x, y + 1, 1, startTime);

        if (result === "timeout") return "timeout";
        if (result) return result;
    }

    return solve(grid, x, y, n + 1, startTime);
}

function possible(x, y, n, grid) {
    return !existsRow(n, x, grid) &&
           !existsColumn(n, y, grid) &&
           !existsBox(n, x, y, grid);
}

function existsRow(n, x, grid) {
    return grid[x].includes(n);
}

function existsColumn(n, y, grid) {
    for (let i = 0; i < 9; i++) {
        if (grid[i][y] === n) return true;
    }
    return false;
}

function existsBox(n, x, y, grid) {
    const x0 = Math.floor(x / 3) * 3;
    const y0 = Math.floor(y / 3) * 3;

    for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
            if (grid[x0 + i][y0 + j] === n)
                return true;
        }
    }
    return false;
}

function insertNumber(n, x, y, grid) {
    const newGrid = grid.map(row => [...row]); // deep copy
    newGrid[x][y] = n;
    return newGrid;
}

function isValidInitialGrid(grid) {
    for (let i = 0; i < 9; i++) {
        let row = new Set();
        let col = new Set();
        let box = new Set();

        for (let j = 0; j < 9; j++) {

            // Row check
            let r = grid[i][j];
            if (r !== 0) {
                if (row.has(r)) return false;
                row.add(r);
            }

            // Column check
            let c = grid[j][i];
            if (c !== 0) {
                if (col.has(c)) return false;
                col.add(c);
            }

            // Box check
            let x = 3 * Math.floor(i / 3) + Math.floor(j / 3);
            let y = 3 * (i % 3) + (j % 3);
            let b = grid[x][y];

            if (b !== 0) {
                if (box.has(b)) return false;
                box.add(b);
            }
        }
    }
    return true;
}

function solved(grid) {
    for (let i = 0; i < 9; i++) {
        for (let j = 0; j < 9; j++) {
            if (grid[i][j] === 0)
                return null;
        }
    }
    return grid;
}

function grid1() {
    return [
        [5,3,0,0,7,0,0,0,0],
        [6,0,0,1,9,5,0,0,0],
        [0,9,8,0,0,0,0,6,0],
        [8,0,0,0,6,0,0,0,3],
        [4,0,0,8,0,3,0,0,1],
        [7,0,0,0,2,0,0,0,6],
        [0,6,0,0,0,0,2,8,0],
        [0,0,0,4,1,9,0,0,5],
        [0,0,0,0,8,0,0,7,9]
    ];
}

const solution = solve(grid1());
console.log(solution);