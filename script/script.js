
var satelite = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',{
})

var osm = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
})

var map = L.map('map', {
    layers: [satelite, osm],
    center: [-21.122864, -44.257799],
    zoom: 10
});

var baseMaps = {
    "OpenStreetMap": osm,
    "ARCSatelite": satelite
}


var input = document.getElementById("csvinput")
var input_x = document.getElementById("input_x")
var input_y = document.getElementById("input_y")
var input_cord = document.getElementById("input_cord")
var input_delimiter = document.getElementById("input_delimiter")
var input_selction = document.getElementById("input_selection")
var button = document.getElementById("button_save")
var button_file = document.getElementById("button_file")
var nome_arquivo = document.getElementById("nomeArquivo");
var latlong_div = document.querySelector(".latlong")
var cord_div = document.querySelector(".cord")
var data_div = document.querySelector(".data_div")
var button_fechar = document.querySelector(".close_btn")
var rowX
var rowY
var rowCord
var delimiter 
var isPolygon
var arquivo


button_file.addEventListener("click", () => {
    input.click(); 
});

button_fechar.addEventListener("click", () => {

    data_div.classList.remove("menu_visible")

});



input_selction.addEventListener("change", function(event){
    if(event.target.value == "polygon"){
        cord_div.classList.add("visible")
        latlong_div.classList.remove("visible")
        isPolygon = true
    }
    else if(event.target.value == "dots"){
        latlong_div.classList.add("visible")
        cord_div.classList.remove("visible")
        isPolygon = false
    }else{
        cord_div.classList.remove("visible")
        latlong_div.classList.remove("visible")
        isPolygon = false
    }
})


input_x.addEventListener("change", function(event){
   rowX = event.target.value
   console.log(rowX)
})

input_y.addEventListener("change", function(event){
   rowY = event.target.value
   console.log(rowY)

})

input_cord.addEventListener("change", function(event){
   rowCord = event.target.value
   console.log(rowCord)

})

input_delimiter.addEventListener("change", function(event){
   delimiter = event.target.value
   console.log(delimiter)

})

var overlays = {
};

var layerControl = L.control.layers(baseMaps, overlays).addTo(map);


input.addEventListener("change", function(event){
    arquivo = event.target.files[0]

    if (input.files.length > 0) {
        nome_arquivo.textContent = event.target.files[0].name;
    } else {
        nome_arquivo.textContent = "Nenhum arquivo selecionado";
    }
})

button.addEventListener("click", function(event){

    
    if(!arquivo) return

    data_div.classList.remove("menu_visible")
    let overlay = L.layerGroup()
    let overlayName = arquivo.name.split(".")[0];

    Papa.parse(arquivo, {
        download: true,
        header: true,
        delimiter: delimiter,
        complete: function(results) {


            results.data.forEach(row => {
                
                    
                    var popup = "";
                    for (var key in row) {
                    if(row[key] !== "" && row[key] !== null) {
                        popup += `<b>${key}:</b> ${row[key]}<br>`;
                        }
                    }


                    if(isPolygon){
                        console.log(row.coordenadas)
                        if(rowCord){
                            let latlngs
                            try{
                                latlngs = JSON.parse(row[rowCord]);
                            }
                            catch(e){
                                const fixed = row[rowCord]
                                .replaceAll("'", '"')
                                .replaceAll("(", "[")
                                .replaceAll(")", "]");
                                latlngs = JSON.parse(fixed);
                            }

                           

                            try{
                                L.polygon(latlngs, {
                                    color: 'blue',
                                    weight: 2,
                                    fillColor: 'lightblue',
                                    fillOpacity: 0.5
                                }).bindPopup(popup).addTo(overlay);
                                overlay.addTo(map); 

                            }
                            catch(e){
                                console.log("Erro ao converter coordenadas do polígono:", e, row[rowCord]);
                            }
                        }else{
                            console.log("Precisa das coordenadas")
                        }
                       

                    }else{
                        if(rowX && rowY){
                            L.circleMarker([parseFloat(row[rowY]), parseFloat(row[rowX])], {
                            radius: 3,
                            color: 'red',
                            fillOpacity: 0.7
                            }).bindPopup(popup).addTo(overlay);
                            overlay.addTo(map); 
                        }else{
                            console.log("Precisa das coordenadas")
                        }

                    }
                    
      
                });

                overlays[overlayName] = overlay

        }
    });

    layerControl.addOverlay(overlay, overlayName)

})


const botaoCustom = L.Control.extend({
    options: {
        position: 'topleft'
    },

    onAdd: function (map) {
        const container = L.DomUtil.create('div', 'leaflet-bar leaflet-control');

        container.style.backgroundColor = 'white';
        container.style.padding = '5px 10px';
        container.style.cursor = 'pointer';
        container.style.border = '1px solid #b1cea3';
        container.style.borderRadius = '5px';
        container.style.fontWeight = '600';
        container.textContent = 'Clique aqui';
        container.style.position = 'fixed';
        container.style.top = '2%';  
        container.style.left = '5%';  
        container.style.display = 'flex';       
        container.style.alignItems = 'center';  
        container.style.gap = '5px';             
        container.innerHTML = 
            `<img src="../bars-solid-full.svg" width="20" height="20" alt="icon">`
        ;

        
        L.DomEvent.disableClickPropagation(container);

       
        container.addEventListener('click', () => {
            data_div.classList.add("menu_visible")
        });

        return container;
    }
});


map.addControl(new botaoCustom());







