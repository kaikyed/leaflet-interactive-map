
const satelite = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {});
const osm = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
});

const map = L.map('map', {
    layers: [osm, satelite],
    center: [-21.122864, -44.257799],
    zoom: 10
});

const baseMaps = {
    "OpenStreetMap": osm,
    "Satélite": satelite
};

const overlays = {};
const layerControl = L.control.layers(baseMaps, overlays).addTo(map);

const input = document.getElementById("csvinput");
const input_x = document.getElementById("input_x");
const input_y = document.getElementById("input_y");
const input_cord = document.getElementById("input_cord");
const input_delimiter = document.getElementById("input_delimiter");
const input_selction = document.getElementById("input_selection");
const button = document.getElementById("button_save");
const button_file = document.getElementById("button_file");
const nome_arquivo = document.getElementById("nomeArquivo");
const latlong_div = document.querySelector(".latlong");
const cord_div = document.querySelector(".cord");
const data_div = document.querySelector(".data_div");
const button_fechar = document.querySelector(".close_btn");

let rowX, rowY, rowCord, delimiter;
let isPolygon = false;
let arquivo;

function createPopup(row) {
    let popupContent = "";
    for (const key in row) {
        if (row[key] !== "" && row[key] !== null) {
            popupContent += `<b>${key}:</b> ${row[key]}<br>`;
        }
    }
    return popupContent;
}

function plotPolygons(data, overlay) {
    data.forEach(row => {
        if (row[rowCord]) {
            const popup = createPopup(row);
            let latlngs;
            try {
                latlngs = JSON.parse(row[rowCord]);
            } catch (e) {
                try {
                    const fixedString = row[rowCord]
                        .replace(/'/g, '"')
                        .replace(/\(/g, '[')
                        .replace(/\)/g, ']');
                    latlngs = JSON.parse(fixedString);
                } catch (err) {
                    console.error("Erro final ao converter coordenadas do polígono. Verifique o formato.", err, row[rowCord]);
                    return;
                }
            }
            
            L.polygon(latlngs, {
                color: 'blue',
                weight: 2,
                fillColor: 'lightblue',
                fillOpacity: 0.5
            }).bindPopup(popup).addTo(overlay);
        }
    });
}

function plotDots(data, overlay) {
    data.forEach(row => {
        if (row[rowX] && row[rowY]) {
            const lat = parseFloat(row[rowY]);
            const lon = parseFloat(row[rowX]);

            if (!isNaN(lat) && !isNaN(lon)) {
                const popup = createPopup(row);
                L.circleMarker([lat, lon], {
                    radius: 3,
                    color: 'red',
                    fillOpacity: 0.7
                }).bindPopup(popup).addTo(overlay);
            } else {
                console.warn("Coordenadas inválidas (não numéricas) encontradas na linha:", row);
            }
        }
    });
}

button_file.addEventListener("click", () => {
    input.click();
});

button_fechar.addEventListener("click", () => {
    data_div.classList.remove("menu_visible");
});

input.addEventListener("change", function(event) {
    if (event.target.files.length > 0) {
        arquivo = event.target.files[0];
        nome_arquivo.textContent = arquivo.name;
    } else {
        arquivo = null;
        nome_arquivo.textContent = "Nenhum arquivo selecionado";
    }
});

input_selction.addEventListener("change", function(event) {
    const selection = event.target.value;
    if (selection === "polygon") {
        cord_div.classList.add("visible");
        latlong_div.classList.remove("visible");
        isPolygon = true;
    } else if (selection === "dots") {
        latlong_div.classList.add("visible");
        cord_div.classList.remove("visible");
        isPolygon = false;
    } else {
        latlong_div.classList.remove("visible");
        cord_div.classList.remove("visible");
        isPolygon = false;
    }
});

input_x.addEventListener("change", (event) => { rowX = event.target.value; });
input_y.addEventListener("change", (event) => { rowY = event.target.value; });
input_cord.addEventListener("change", (event) => { rowCord = event.target.value; });
input_delimiter.addEventListener("change", (event) => { delimiter = event.target.value; });

button.addEventListener("click", function(event) {
    if (!arquivo) {
        alert("Por favor, selecione um arquivo CSV.");
        return;
    }
    if (isPolygon && !rowCord) {
        alert("Por favor, informe o nome da coluna que contém as coordenadas do polígono.");
        return;
    }
    if (!isPolygon && (!rowX || !rowY)) {
        alert("Por favor, informe os nomes das colunas de Latitude e Longitude.");
        return;
    }

    document.body.style.cursor = 'wait';
    button.textContent = "Processando...";
    button.disabled = true;
    data_div.classList.remove("menu_visible");

    const overlay = L.layerGroup();
    const overlayName = arquivo.name.split(".")[0];

    if (overlays[overlayName]) {
        map.removeLayer(overlays[overlayName]);
        layerControl.removeLayer(overlays[overlayName]);
    }

    Papa.parse(arquivo, {
        download: true,
        header: true,
        delimiter: delimiter,
        skipEmptyLines: true,
        complete: function(results) {
            if (isPolygon) {
                plotPolygons(results.data, overlay);
            } else {
                plotDots(results.data, overlay);
            }

            overlays[overlayName] = overlay;
            overlay.addTo(map);
            layerControl.addOverlay(overlay, overlayName);

            document.body.style.cursor = 'default';
            button.textContent = "Gerar Camada";
            button.disabled = false;
        },
        error: function(err, file) {
            alert("Ocorreu um erro ao processar o arquivo CSV. Verifique o formato e o delimitador.");
            console.error("Erro PapaParse:", err, file);
            
            document.body.style.cursor = 'default';
            button.textContent = "Gerar Camada";
            button.disabled = false;
        }
    });
});

const BotaoCustomizado = L.Control.extend({
    options: {
        position: 'topleft'
    },
    onAdd: function(map) {
        const container = L.DomUtil.create('div', 'leaflet-bar leaflet-control');
        container.style.backgroundColor = 'white';
        container.style.padding = '5px 10px';
        container.style.cursor = 'pointer';
        container.style.border = '1px solid #ccc';
        container.style.borderRadius = '5px';
        container.style.display = 'flex';
        container.style.alignItems = 'center';
        container.style.gap = '5px';
        container.innerHTML = `<img src="../bars-solid-full.svg" width="20" height="20" alt="icon">`;
        container.title = "Abrir menu de dados";

        L.DomEvent.disableClickPropagation(container);

        container.addEventListener('click', () => {
            data_div.classList.toggle("menu_visible");
        });

        return container;
    }
});

map.addControl(new BotaoCustomizado());

const controlContainer = layerControl.getContainer();

L.DomEvent.disable(controlContainer, 'mouseover');
L.DomEvent.disable(controlContainer, 'mouseout');

L.DomEvent.on(controlContainer, 'click', function (event) {
    L.DomEvent.stopPropagation(event);

    if (controlContainer.classList.contains('leaflet-control-layers-expanded')) {
        layerControl.collapse();
    } else {
        layerControl.expand();
    }
});

map.on('click', function () {
    layerControl.collapse();
});