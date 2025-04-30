// start map
var map = L.map('map').setView([51.505, -0.09], 13);

// layer (OpenStreetMap)
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
}).addTo(map);


let nodes = {};
let edges = {};
let coordinates = {};
let startNode = null;
let endNode = null;

fetch('graph-data.json')
    .then(response => response.json())
    .then(data => {
        nodes = data.nodes;
        edges = data.edges;
        coordinates = data.coordinates;

    nodes.forEach(from => {
        edges[from].forEach(edge => {
            const to = edge.node;
            const latlngs = [coordinates[from], coordinates[to]];

            L.polyline(latlngs, {
                color: 'blue',
                weight: 2,
                opacity: 0.5,
                dashArray: '5, 5'
            }).addTo(map);
        });
    });


        nodes.forEach(node => {
            const coord = coordinates[node];
            const marker = L.marker(coord).addTo(map)
                .bindPopup(`Nokta: ${node}`);

            marker.on('click', () => {
                if (!startNode) {
                    startNode = node;
                    document.getElementById('start').textContent = node;
                    marker.setIcon(createIcon("green"));
                } else if (!endNode && node !== startNode) {
                    endNode = node;
                    document.getElementById('end').textContent = node;
                    marker.setIcon(createIcon("red"));

                    findShortestPath(startNode, endNode);
                }
            });
        });
    })
    .catch(err => {
        console.error("Data Error:", err);
    });

function createIcon(color) {
    return L.icon({
        iconUrl: color === "green" ? "marker-green.png" : "marker-red.png",
        iconSize: [24, 24],
        iconAnchor: [12, 24]
    });
}

function findShortestPath(start, end) {
    const result = dijkstra(edges, start, end);
    const { path, distance } = result;

    if (!path || path.length === 0 || distance === Infinity) {
        alert("Can't find path.");
        return;
    }

    const latlngs = path.map(node => coordinates[node]);

    L.polyline(latlngs, {
        color: 'blue',
        weight: 5,
        opacity: 0.7,
        smoothFactor: 1
    }).addTo(map);

    document.getElementById('distance').textContent = distance + " unit";

    document.getElementById('steps').textContent = path.join(" → ");

}