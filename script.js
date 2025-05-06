let map = L.map("map").setView([37.2, 28.4], 10);
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png").addTo(map);

let markers = [], pathLine = null;
let OSM_GRAPH = {}, OSM_NODES = {};

map.on("click", function (e) {
  if (markers.length >= 2) {
    markers.forEach(m => map.removeLayer(m));
    if (pathLine) map.removeLayer(pathLine);
    markers = [];
    document.getElementById("start").textContent = "";
    document.getElementById("end").textContent = "";
    document.getElementById("distance").textContent = "";
  }

  const marker = L.marker(e.latlng).addTo(map);
  markers.push(marker);

  if (markers.length === 1) {
    document.getElementById("start").textContent = `${e.latlng.lat.toFixed(4)}, ${e.latlng.lng.toFixed(4)}`;
  } else if (markers.length === 2) {
    document.getElementById("end").textContent = `${e.latlng.lat.toFixed(4)}, ${e.latlng.lng.toFixed(4)}`;
    const start = findNearestNode([markers[0].getLatLng().lat, markers[0].getLatLng().lng]);
    const end = findNearestNode([markers[1].getLatLng().lat, markers[1].getLatLng().lng]);
    const result = dijkstra(OSM_GRAPH, start, end);
    const coords = result.path.map(id => OSM_NODES[id]);
    pathLine = L.polyline(coords, { color: "blue" }).addTo(map);
    document.getElementById("distance").textContent = result.distance.toFixed(2);
  }
});

function fetchOSM() {
  const query = `
[out:json][timeout:25];
(
  way["highway"](36.9900,27.1600,37.4900,29.1000);
);
out body;
>;
out skel qt;
  `;
  fetch("https://overpass-api.de/api/interpreter", {
    method: "POST",
    body: query
  })
    .then(res => res.json())
    .then(data => {
      const { edges, nodes } = buildGraphFromOSM(data);
      OSM_GRAPH = edges;
      OSM_NODES = nodes;
      console.log("Graph loaded:", Object.keys(edges).length, "nodes");
    });
}

function buildGraphFromOSM(data) {
  const nodes = {}, edges = {};
  for (const el of data.elements) {
    if (el.type === "node") {
      nodes[el.id] = [el.lat, el.lon];
    }
  }

  for (const el of data.elements) {
    if (el.type === "way" && el.nodes) {
      for (let i = 0; i < el.nodes.length - 1; i++) {
        const n1 = el.nodes[i];
        const n2 = el.nodes[i + 1];
        if (nodes[n1] && nodes[n2]) {
          const d = turf.distance(turf.point(nodes[n1]), turf.point(nodes[n2]), { units: "kilometers" });
          edges[n1] = edges[n1] || [];
          edges[n2] = edges[n2] || [];
          edges[n1].push({ node: n2, weight: d });
          edges[n2].push({ node: n1, weight: d });
        }
      }
    }
  }

  return { edges, nodes };
}

function findNearestNode(coord) {
  let minDist = Infinity, closest = null;
  for (const [id, latlng] of Object.entries(OSM_NODES)) {
    const dist = turf.distance(turf.point(coord), turf.point(latlng), { units: "kilometers" });
    if (dist < minDist) {
      minDist = dist;
      closest = id;
    }
  }
  return closest;
}

fetchOSM();
