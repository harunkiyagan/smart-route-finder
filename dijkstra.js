function dijkstra(edges, startNode, endNode) {
    const distances = {};
    const previous = {};
    const visited = new Set();
    const pq = new MinPriorityQueue();

    for (const node in edges) {
        distances[node] = Infinity;
        previous[node] = null;
    }
    distances[startNode] = 0;
	
    pq.enqueue(startNode, 0); //başlangıç noktası

	//find short path
    while (!pq.isEmpty()) {
        const current = pq.dequeue().element;

        if (visited.has(current)) continue;
        visited.add(current);

        if (current === endNode) break;

        for (const neighbor of edges[current]) {
            const alt = distances[current] + neighbor.weight;

            if (alt < distances[neighbor.node]) {
                distances[neighbor.node] = alt;
                previous[neighbor.node] = current;
                pq.enqueue(neighbor.node, alt);
            }
        }
    }

    // reverse short path
    const path = [];
    let currentNode = endNode;

    while (currentNode !== null) {
        path.unshift(currentNode);
        currentNode = previous[currentNode];
    }

    return {
        path,
        distance: distances[endNode]
    };
}

// MinPriority
class MinPriorityQueue {
    constructor() {
        this.queue = [];
    }

    enqueue(element, priority) {
        this.queue.push({ element, priority });
        this.queue.sort((a, b) => a.priority - b.priority);
    }

    dequeue() {
        return this.queue.shift();
    }

    isEmpty() {
        return this.queue.length === 0;
    }
}
