import numpy as np

# Define the 6x6 grid, where 0 = unshaded cell (.), 1 = shaded cell (#)
grid = np.array([
    [1, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 1, 0],
    [0, 0, 1, 1, 0, 0],
    [0, 0, 0, 0, 0, 0],
    [0, 1, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 1],
])

# Initialize the solution grid to track loop connections (edges)
# 0 = no connection, 1 = horizontal connection, 2 = vertical connection
solution = np.zeros((6, 6, 4))  # [row, col, {left, up, right, down}]

# Function to check if a cell is within bounds
def in_bounds(row, col):
    return 0 <= row < 6 and 0 <= col < 6

# Function to implement logical rules to solve the puzzle
def solve_simple_loop(grid, solution):
    # Iterate until all constraints are satisfied
    progress = True
    while progress:
        progress = False
        for r in range(6):
            for c in range(6):
                if grid[r, c] == 1:  # Skip shaded cells
                    continue

                # Count current connections for this cell
                connections = [
                    solution[r, c, 0] if in_bounds(r, c - 1) else 0,  # left
                    solution[r, c, 1] if in_bounds(r - 1, c) else 0,  # up
                    solution[r, c, 2] if in_bounds(r, c + 1) else 0,  # right
                    solution[r, c, 3] if in_bounds(r + 1, c) else 0,  # down
                ]
                count = sum(connections)

                # Apply rule: If a cell has exactly 2 connections, block all others
                if count == 2:
                    for d in range(4):
                        if connections[d] == 0:
                            solution[r, c, d] = -1
                            progress = True

                # Apply rule: If a cell can only have 2 connections, add them
                if count < 2:
                    possible_directions = []
                    if in_bounds(r, c - 1) and grid[r, c - 1] == 0 and solution[r, c, 0] == 0:
                        possible_directions.append(0)
                    if in_bounds(r - 1, c) and grid[r - 1, c] == 0 and solution[r, c, 1] == 0:
                        possible_directions.append(1)
                    if in_bounds(r, c + 1) and grid[r, c + 1] == 0 and solution[r, c, 2] == 0:
                        possible_directions.append(2)
                    if in_bounds(r + 1, c) and grid[r + 1, c] == 0 and solution[r, c, 3] == 0:
                        possible_directions.append(3)
                    
                    if len(possible_directions) == 2:
                        for d in possible_directions:
                            solution[r, c, d] = 1
                        progress = True

    return solution

# Solve the puzzle
solved_grid = solve_simple_loop(grid, solution)

# Format the solution into a readable grid with edges
def format_solution(grid, solution):
    result = [[' ' for _ in range(13)] for _ in range(13)]
    for r in range(6):
        for c in range(6):
            cell = '#' if grid[r, c] == 1 else '.'
            result[r * 2 + 1][c * 2 + 1] = cell
            if in_bounds(r, c + 1) and solution[r, c, 2] == 1:  # right
                result[r * 2 + 1][c * 2 + 2] = '-'
            if in_bounds(r + 1, c) and solution[r, c, 3] == 1:  # down
                result[r * 2 + 2][c * 2 + 1] = '|'
    return result

formatted_solution = format_solution(grid, solved_grid)

# Print the solution grid
formatted_solution_string = "\n".join("".join(row) for row in formatted_solution)
formatted_solution_string
