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
# 0 = no connection, 1 = horizontal connection, -1 = blocked
solution = np.zeros((6, 6, 4))  # [row, col, {left, up, right, down}]

# Function to check if a cell is within bounds
def in_bounds(row, col):
    return 0 <= row < 6 and 0 <= col < 6

# Function to block a connection
def block_connection(solution, r, c, direction):
    if in_bounds(r, c):
        solution[r, c, direction] = -1
        # Block reciprocal connection
        if direction == 0 and in_bounds(r, c - 1):  # left
            solution[r, c - 1, 2] = -1
        elif direction == 1 and in_bounds(r - 1, c):  # up
            solution[r - 1, c, 3] = -1
        elif direction == 2 and in_bounds(r, c + 1):  # right
            solution[r, c + 1, 0] = -1
        elif direction == 3 and in_bounds(r + 1, c):  # down
            solution[r + 1, c, 1] = -1

# Function to add a connection
def add_connection(solution, r, c, direction):
    if in_bounds(r, c):
        solution[r, c, direction] = 1
        # Add reciprocal connection
        if direction == 0 and in_bounds(r, c - 1):  # left
            solution[r, c - 1, 2] = 1
        elif direction == 1 and in_bounds(r - 1, c):  # up
            solution[r - 1, c, 3] = 1
        elif direction == 2 and in_bounds(r, c + 1):  # right
            solution[r, c + 1, 0] = 1
        elif direction == 3 and in_bounds(r + 1, c):  # down
            solution[r + 1, c, 1] = 1

# Solve the Simple Loop puzzle
def solve_simple_loop(grid, solution):
    progress = True
    while progress:
        progress = False
        for r in range(6):
            for c in range(6):
                if grid[r, c] == 1:  # Skip shaded cells
                    continue

                # Count current connections for this cell
                connections = [solution[r, c, d] for d in range(4)]
                count = connections.count(1)
                possible_directions = [d for d in range(4) if connections[d] == 0 and 
                                        ((d == 0 and in_bounds(r, c - 1) and grid[r, c - 1] == 0) or
                                         (d == 1 and in_bounds(r - 1, c) and grid[r - 1, c] == 0) or
                                         (d == 2 and in_bounds(r, c + 1) and grid[r, c + 1] == 0) or
                                         (d == 3 and in_bounds(r + 1, c) and grid[r + 1, c] == 0))]
                # Apply rules
                if count == 2:  # Block all other directions
                    for d in possible_directions:
                        block_connection(solution, r, c, d)
                        progress = True
                elif len(possible_directions) == 2 and count < 2:  # Add necessary connections
                    for d in possible_directions:
                        add_connection(solution, r, c, d)
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
print(formatted_solution_string)
