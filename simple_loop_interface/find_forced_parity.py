def search(start, adj, adj2, forced, usage):
    wave = [start]
    step = 0
    retrace = {start: None}
    while wave:
        new_wave = []
        for i in wave:
            if step % 2 == 1 and usage[i] < 2:
                res = [i]
                while res[-1] != start:
                    res.append(retrace[res[-1]])
                return res[::-1]
            if step % 2 == 0:
                opts = [k for k in adj[i] if k not in adj2[i]]
            else:
                opts = [k for k in adj2[i] if k not in forced[i]]
            for j in opts:
                if j not in retrace:
                    new_wave.append(j)
                    retrace[j] = i
        wave = new_wave
        step += 1
    return None

def find_parity(adj, forced, c1, c2):
    adj2 = {i: {*forced[i]} for i in c1 + c2}
    assert all(len(i) <= 2 for i in adj2.values())
    usage = {i: len(adj2[i]) for i in c1 + c2}
    for node in c1:
        for _ in range(2 - usage[node]):
            added_path = search(node, adj, adj2, forced, usage)
            usage[added_path[0]] += 1
            usage[added_path[-1]] += 1
            for i in range(len(added_path) - 1):
                n1, n2 = added_path[i], added_path[i + 1]
                if i % 2 == 0:
                    adj2[n1].add(n2)
                    adj2[n2].add(n1)
                if i % 2 == 1:
                    adj2[n1].remove(n2)
                    adj2[n2].remove(n1)
    return adj2

def find_forced_edges(adj, adj2, forced, c1, c2):
    # find strongly connected components and return every edge not within one
    sc1 = set(c1)
    adj3 = {i: {j for j in adj[i] if ((j in adj2[i] and j not in forced[i]) if (i in sc1) else (j not in adj2[i]))} for i in adj}
    components = tarjan(adj3, c1 + c2)
    cdict = {j: i for i in range(len(components)) for j in components[i]}
    return {(i, j): j in adj2[i] for i in adj for j in adj[i] if cdict[i] != cdict[j]}

# taken from wikipedia
def tarjan(g, vertices):
    res = []
    index = 0
    indices = {}
    lowlink = {}
    s = []
    ss = set()
    def strong_connect(v):
        nonlocal index
        indices[v] = index
        lowlink[v] = index
        index += 1
        s.append(v)
        ss.add(v)
        for w in g[v]:
            if w not in indices:
                strong_connect(w)
                lowlink[v] = min(lowlink[v], lowlink[w])
            elif w in ss:
                lowlink[v] = min(lowlink[v], indices[w])
        if lowlink[v] == indices[v]:
            comp = set()
            while True:
                w = s.pop()
                ss.remove(w)
                comp.add(w)
                if w == v:
                    break
            res.append(comp)
    for v in vertices:
        if v not in indices:
            strong_connect(v)
    return res

def adjacency(graph, vertices):
    adj = {i: set() for i in vertices}
    for (i, j) in graph:
        adj[i].add(j)
        adj[j].add(i)
    return adj

def main(grid):
    t0 = time.time()
    vertices = [(i, j) for i in range(len(grid)) for j in range(len(grid[0])) if not grid[i][j]]
    sv = set(vertices)
    graph = [((i1, j1), (i2, j2)) for (i1, j1) in vertices
    for (i2, j2) in ((i1 + 1, j1), (i1, j1 + 1)) if (i2, j2) in sv]
    c1 = [i for i in vertices if sum(i) % 2 == 0]
    c2 = [i for i in vertices if sum(i) % 2 == 1]
    adj = adjacency(graph, vertices)
    sc1, sc2 = set(c1), set(c2)
    assert all((i in sc1 and j in sc2) or (j in sc1 and i in sc2) for i in adj for j in adj[i])
    assert len(c1) == len(c2)
    forced = {i: set() for i in adj}
    step = 0
    while adj != forced:
        if step % 2 == 0:
            parity1(adj, forced, c1, c2)
        else:
            parity2(adj, forced, c1, c2)
        step += 1
        print('step', step, sum(len(i) for i in adj.values()), sum(len(i) for i in forced.values()), sum(len(i) for i in adj.values()) - sum(len(i) for i in forced.values()))
    t1 = time.time()
    if t1 - t0 > 0.1:
        print('!!! long puzzle')
    print(t1 - t0)
    return adj

def parity1(adj, forced, c1, c2):
    adj2 = find_parity(adj, forced, c1, c2)
    new_forced = find_forced_edges(adj, adj2, forced, c1, c2)
    for i in new_forced:
        if new_forced[i]:
            forced[i[0]].add(i[1])
            forced[i[1]].add(i[0])
        else:
            if i[1] in adj[i[0]]:
                adj[i[0]].remove(i[1])
            if i[0] in adj[i[1]]:
                adj[i[1]].remove(i[0])

def domino_data(p, adj):
    lookup = {j: ind for (ind, i) in enumerate(p) for j in i}
    black = [{lookup[j] for j in adj[i[0]] if j != i[1]} for (ind, i) in enumerate(p)]
    white = [{lookup[j] for j in adj[i[1]] if j != i[0]} for (ind, i) in enumerate(p)]
    return black, white, lookup

def domino_partitions(adj, adj2, c1, c2):
    # each vertex is part of a domino, and each domino has one vertex from c1 and one from c2.
    cycles = []
    used = set()
    for node in c1:
        if node in used:
            continue
        cycle = [node]
        while True:
            used.add(cycle[-1])
            opts = [i for i in adj2[cycle[-1]] if i not in used]
            if not opts:
                break
            cycle.append(opts[0])
        cycles.append(cycle)
    cycles2 = [[i[0]] + i[1:][::-1] for i in cycles]
    pairs = [[i[j:j+2] for i in c for j in range(0, len(i), 2)] for c in (cycles, cycles2)]
    return [domino_data(p, adj) for p in pairs]

def full_bfs(g):
    s = {0}
    new = {0}
    while new:
        new = {j for i in new for j in g[i] if j not in s}
        s |= new
    return len(s) == len(g)

def is_forced_parity2(black, white, bn, wn):
    bnew, wnew = black[bn] - {wn}, white[wn] - {bn}
    bs, ws = {bn} | bnew, {wn} | wnew
    while True:
        bnew = {j for i in bnew for j in black[i] if j not in bs}
        bs |= bnew
        wnew = {j for i in wnew for j in white[i] if j not in ws}
        ws |= wnew
        if wn in bs or bn in ws:
            return False
        if not (bnew and wnew):
            return True

def parity2(adj, forced, c1, c2):
    # We don't actually care about forced edges for this type of parity, but we pass forced in anyway
    # could pass in {i: set() for i in adj} instead
    # note: in some cases this will fail even if there's no issue with this type of parity,
    # e.g. if the grid has an odd number of cells. in that case this approach is a bit messed up.
    # however, if this fails due to that, then the other type of parity has a contradiction
    adj2 = find_parity(adj, forced, c1, c2)
    # need to do the two domino paritions
    dom1, dom2 = domino_partitions(adj, adj2, c1, c2)
    # we only need to do the no-bad-region check on one of dom1 and dom2
    assert full_bfs(dom1[0])
    assert full_bfs(dom1[1])
    # now we look into specific edges
    new_forced = []
    sc1 = set(c1)
    for i in adj:
        # we here use the fact every edge appears in both directions
        if i not in sc1:
            continue
        # don't check edges we know already
        # it doesn't seem to actually matter for speed, but feels like good advice anyway
        for j in adj[i] - forced[i]:
            if dom1[2][i] == dom1[2][j]:
                assert dom2[2][i] != dom2[2][j]
                dom = dom2
            else:
                dom = dom1
            if is_forced_parity2(dom[0], dom[1], dom[2][i], dom[2][j]):
                new_forced.append((i, j))
    for i in new_forced:
        forced[i[0]].add(i[1])
        forced[i[1]].add(i[0])


s = 's3o3os7o71uc240g200go00200425uj0h000042016ec011p0001sg0700441g963001g74200f0036940j2602fg0s4029egg701700gou0094ho483000p003oc0s30e2c7ph60900003722800140800o0i100810b40ojto7g17083go4oho0001020010o1g09g28fe200g2110016f80800ps71c00340c088480114108404c0cs8gg163084v0o0o89po9068pg088600109810ch30c0e0f001870c31go4088e3hc17004g1s0s036300c0gs400cg10000s01o47g0s0j0g0e4ggg000009p1o0c4po3po601oh0g001gi08cs4100208g00700004870fc9g44201q2e940069gs4010bi095302c0hee3k8j091j700010c170129b11n00100049se18003001jge09040csj00600g40o00285j6040og40840704pe0c0s00g1402e00040000nk7c00c1s4u0o0ng744g8005s0fh7g2100su3g0008jg0703o400j8260i0i2011g00mee3h03j0001004444031p2c07j00e100031g2600g0g41001g0002e01hg0311go41o06o9oi0233gje3000ss0j401001409o80gi6e410410c8ho81q02c0c4106cggo0j0088ee002400g01689o000g0000i046808000g32002042e31000g1i0c60700ef100o0i274o000003o1286e00c0cc00803ee040g4so63086384103hgc8228ss000700h20002800472100163002c40c6700t1410s084go048cp44128o04o0o08s1e0178e0cg1pgc1h40010000g7gs4310g00401g31001200g70cc136020t001h40ooj628645o7p1k00go2084440000gc01g0494e00040i60000ed008g17062000141g1pg11160230303g8gg5o30gu7320gsu0hs030u003i7g'

m, n = 75, 75

'''
s = '000000000000000003vvvvvvvo8v3vu7ov0000000002ga00k2g3rnevutrng2ga40k2g0000g0001u7oifhu47vvucvvvgvvvo3vvu3vvv6fvvofvvsjvvv1vvv6fvvs7vvs1vvvgvvvj7vvu3vvv4vvvo0000g000000020000'

m, n = 20, 43
'''

'''
s = '44800030hg8148g020400g114100c010kg01h0000024c'

size = 15
'''

import time

with open('sloop_input.txt') as f:
    lines = f.readlines()

lines = ['https://puzz.link/p?simpleloop/10/10/08004g4g6400147sg0g0', 'https://puzz.link/p?simpleloop/20/20/7493441004hg1054j00400020002o002400404002000i00300000g000001g48001000h204008400o']

t0 = time.time()
for i in lines:
    if i in ['https://puzz.link/p?simpleloop/7/6/000c1g000\n', 'https://puzz.link/p?simpleloop/12/8/00000fu20gnk55000000\n', 'https://puzz.link/p?simpleloop/11/11/00083vo8g48fv08041vs10000\n'] or 'v:' in i:
        continue
    print(i)
    n, m, s = i.strip().split('/')[-3:]
    m, n = int(m), int(n)
    assert len(s) == (m * n + 4) // 5
    bits = [int(j) for i in s for j in bin(32 + int(i, 32))[-5:]]
    grid = [bits[i:i+n] for i in range(0, m * n, n)]
    main(grid)
print(time.time() - t0)

# if we could just find the second type of parity deduction, we'd be doing great
        