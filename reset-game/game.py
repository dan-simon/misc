# the way val_5 works is it's a mini game that opens up
# when you have done a 5 reset (so it goes away when you 7 reset)
# where you can only do 2 resets

import math

def gotten(x, p, diff=.25, start=2):
    return max(0, int((math.log(math.log(x, p), p) - start) / diff + 1))

def prod(x, val_5):
    num_resets = {i: gotten(x, i, diff=.25 if i != 5 else .2)
    for i in (2, 3, 5, 7)}
    num_resets[10] = 0 if x < 1e100 else \
    1 + int(((math.log(x, 10) - 100) / 50) ** (1 / 3))
    ten_power = math.log(x + 1, 10)
    for i in num_resets:
        if i != 10:
            num_resets[i] *= (1 + ten_power / 1e3) ** num_resets[10]
    total_resets = sum(num_resets.values())
    return 2 ** num_resets[2] * (math.log(x + 1, 3) + 1) ** num_resets[3] * \
    val_5 ** num_resets[5] * total_resets ** (7 * num_resets[7])

print('\n'.join(f'{x}: {10 ** x / prod(10 ** x, 1e5) / 1e2 ** gotten(10 ** x, 5, .2)} ({gotten(10 ** x, 5, .2)})' for x in range(1, 309)))
