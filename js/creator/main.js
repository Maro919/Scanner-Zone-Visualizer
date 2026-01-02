let canvas;
let ctx;
let config = {
    "image": {
        "src": "",
        "x": 0,
        "y": 0,
        "width": 0,
        "height": 0
    },
    "lookup": [

    ],
    "scanners": [

    ]
};

let fileSelect, download, downloadAll, downloadConfig;
let agvImage, imageX, imageY, imageW, imageH;

let addScanner, scannerList;

let currentCase, caseFile, addCase, delCase, caseID, caseName;

let image;

let preview;

function updateCases(list, cases) {
    list.innerHTML = '';
    for (let i = 0; i < cases.length; i++) {
        let opt = document.createElement('option');
        opt.innerHTML = `${cases[i].name}`;
        opt.value = i;
        list.appendChild(opt);
    }
}

function updateCurrentCase(id) {
    if (parseInt(caseID.value) != -1){
        let name = caseName;
        name.value = config.lookup[parseInt(caseID.value)].name;
        name.addEventListener('change', ()=>{
            if (caseID.value != -1) {
                config.lookup[parseInt(caseID.value)].name = name.value;
                caseID.children[parseInt(caseID.value) + 1].innerHTML = name.value;
            }
        });

        for (let i = 0; i < scannerList.children.length; i++) {
            scannerList.children[i].querySelector('.case').value = config.lookup[parseInt(caseID.value)].scanners[i];
        }
    }
}

function reloadCases() {
    caseID.innerHTML = '<option value=-1>None</option>';
    for (let i = 0; i < config.lookup.length; i++) {
        let opt = document.createElement('option');
        opt.value = i;
        opt.innerHTML = config.lookup[i].name;
        caseID.appendChild(opt);
    }
} 

function main() {
    //canvas = document.getElementById('canvas');
    canvas = document.createElement('canvas');
    ctx = canvas.getContext('2d');

    fileSelect = document.getElementById('fileSelect');
    caseSelect = document.getElementById(`caseSelect`);

    download = document.getElementById('download');
    downloadAll = document.getElementById('downloadAll');
    downloadConfig = document.getElementById('downloadConfig');

    agvImage = document.getElementById('agvImage');
    imageX = document.getElementById('imageX');
    imageY = document.getElementById('imageY');
    imageW = document.getElementById('imageW');
    imageH = document.getElementById('imageH');

    addScanner = document.getElementById('addScanner');
    scannerList = document.getElementById('scannerList');

    currentCase = document.getElementById('currentCase');
    caseFile = document.getElementById('caseFile');
    addCase = document.getElementById('addCase');
    delCase = document.getElementById('delCase');
    caseID = document.getElementById('caseID');
    caseName = document.getElementById('caseName');

    preview = document.getElementById('preview');

    fileSelect.addEventListener("change", () => {
        const file = fileSelect.files[0];
        const reader = new FileReader();

        reader.addEventListener("load", () => {
            config = JSON.parse(reader.result);

            image = new Image();
            image.src = config.image.src;

            imageX.value = config.image.x;
            imageY.value = config.image.y;
            imageW.value = config.image.width;
            imageH.value = config.image.height;

            scannerList.replaceChildren();

            addScanners(config.scanners);
            reloadCases();
        });

        if (file) {
            reader.readAsText(file);
        }
    });

    download.addEventListener("click", ()=>{
        var link = document.createElement('a');
        link.download = `${config.lookup[caseID.value].name}.png`;
        link.href = canvas.toDataURL("image/png");
        link.click();
    });

    downloadAll.addEventListener("click", ()=>{
        for (let i = 0; i < config.lookup.length; i++) {
            ctx.clearRect(-canvas.width/2, -canvas.height/2, canvas.width, canvas.height);
            drawAGV(config, i);

            if (canvas.width > 0 && canvas.height > 0) {
                var link = document.createElement('a');
                link.download = `${config.lookup[i].name}.png`;
                link.href = canvas.toDataURL("image/png");
                link.click();
            }
        }
    });

    downloadConfig.addEventListener("click", ()=>{
        let link = document.createElement('a');
        link.download = 'config.json';
        link.href = `data:text/plain;charset=utf-8,${encodeURIComponent(JSON.stringify(config))}`;
        link.click();
    });

    agvImage.addEventListener('change', ()=>{
        const file = agvImage.files[0];
        const reader = new FileReader();

        reader.addEventListener("load", () => {
            config.image.src = reader.result;

            image = new Image();
            image.src = config.image.src;
        });

        if (file) {
            reader.readAsDataURL(file);
        }
    });

    imageX.addEventListener('change', ()=>{
        config.image.x = parseInt(imageX.value);
    });
    imageY.addEventListener('change', ()=>{
        config.image.y = parseInt(imageY.value);
    });
    imageW.addEventListener('change', ()=>{
        config.image.width = parseInt(imageW.value);
    });
    imageH.addEventListener('change', ()=>{
        config.image.height = parseInt(imageH.value);
    });

    addScanner.addEventListener('click', ()=>{
        addScanners([{name: "", x: 0, y: 0, model: []}], true);
    });

    caseFile.addEventListener('change', ()=>{
        const file = caseFile.files[0];
        const reader = new FileReader();

        reader.addEventListener("load", () => {
            config.lookup = JSON.parse(reader.result);
            reloadCases();
        });

        if (file) {
            reader.readAsText(file);
        }
    });

    caseID.addEventListener('change', ()=>{
        updateCurrentCase(parseInt(caseID.value));

        ctx.clearRect(-canvas.width/2, -canvas.height/2, canvas.width, canvas.height);
        drawAGV(config, parseInt(caseID.value));
    });

    addCase.addEventListener('click', ()=>{
        config.lookup.push({name: "New Case", scanners: new Array(config.scanners.length).fill(0)});
        reloadCases();
    });

    delCase.addEventListener('click', ()=>{
        let selVal = parseInt(caseID.value);
        if (selVal != -1) {
            config.lookup.splice(selVal, 1);
            caseID.remove(selVal + 1);
            for (let i = selVal + 1; i < caseID.children.length; i++) {
                caseID.children[i].value = parseInt(caseID.children[i].value) - 1;
            }
        }
        updateCurrentCase(parseInt(caseID.value));
    });
}

function addScanners(params = [], append) {
    for (let i=0; i < params.length; i++) {
        let li = document.createElement('li');
        scannerList.appendChild(li);

        li.innerHTML = `<label>Name:</label>
                        <input type="text" placeholder="Name" class = "name">
                        <label>Files:</label>
                        <input class="defaultButton liquid files" type="file" multiple>
                        <label>X:</label>
                        <input type="number" class="x" placeholder="x">
                        <label>Y:</label>
                        <input type="number" class="y" placeholder="y">
                        <button class="defaultButton liquid remove">Remove</button>
                        <select class="case"></select>`;

        let name = li.querySelector('.name');
        name.value = params[i].name;
        name.addEventListener('change', ()=>{
            let idx = Array.prototype.slice.call(scannerList.children).indexOf(li);
            config.scanners[idx].name = name.value;
        });

        let posX = li.querySelector('.x');
        posX.value = params[i].x;
        posX.addEventListener('change', ()=>{
            let idx = Array.prototype.slice.call(scannerList.children).indexOf(li);
            console.log(`x[${idx}] -> ${posX.value}`);
            config.scanners[idx].x = parseFloat(posX.value);
        });

        let posY = li.querySelector('.y');
        posY.value = params[i].y;
        posY.addEventListener('change', ()=>{
            let idx = Array.prototype.slice.call(scannerList.children).indexOf(li);
            console.log(`y[${idx}] -> ${posY.value}`);
            config.scanners[idx].y = parseFloat(posY.value);
        });

        let files = li.querySelector('.files');
        files.addEventListener('change', ()=>{
            let fields, zones, lookup;

            let idx = Array.prototype.slice.call(scannerList.children).indexOf(li);

            for (let i = 0; i < files.files.length; i++) {
                const file = files.files[i];
                const reader = new FileReader();

                reader.addEventListener("load", () => {
                    let idx = Array.prototype.slice.call(scannerList.children).indexOf(li);
                    console.log(idx);
                    switch(file.name.match(/\.[a-z]+$/i)[0]) {
                        case '.sdxml':
                            fields = parseFields(reader.result);
                            if (zones) {
                                config.scanners[idx].model = linkFields(fields, zones);
                                updateCases(li.querySelector('.case'), config.scanners[idx].model);
                            }
                            break;
                        case '.casesxml':
                            zones = parseZones(reader.result);
                            if (fields) {
                                config.scanners[idx].model = linkFields(fields, zones);
                                updateCases(li.querySelector('.case'), config.scanners[idx].model);
                            }
                            break;
                    }
                });

                if (file) {
                    reader.readAsText(file);
                }
            }
        });

        
        let rem = li.querySelector('.remove');
        rem.addEventListener('click', ()=>{
            let idx = Array.prototype.slice.call(scannerList.children).indexOf(li);
            console.log(`Removed element #${idx}`);
            config.scanners.splice(idx, 1);

            for (let i = 0; i < config.lookup.length; i++) {
                config.lookup[i].scanners.splice(idx, 1);
            }

            li.remove();
        });

        if (append) {
            config.scanners.push(params[i]);
            for (let i = 0; i < config.lookup.length; i++) {
                config.lookup[i].scanners.push(0);
            }
        }

        let cas = li.querySelector('.case');

        let idx = Array.prototype.slice.call(scannerList.children).indexOf(li);

        console.log(idx);
        updateCases(cas, config.scanners[idx].model);

        cas.addEventListener('change', ()=>{
            let idx = Array.prototype.slice.call(scannerList.children).indexOf(li);
            config.lookup[parseInt(caseID.value)].scanners[idx] = parseInt(cas.value);

            ctx.clearRect(-canvas.width/2, -canvas.height/2, canvas.width, canvas.height);
            drawAGV(config, parseInt(caseID.value));
        });
    }
}


// DEVELOPMENT

// function addPoints(params = [], append) {
//     for (let i=0; i < params.length; i++) {
//         let li = document.createElement('li');
//         pointList.appendChild(li);

//         li.innerHTML = `<input class="defaultButton liquid files" type="file" multiple>
//                         <label>X:</label>
//                         <input type="number" class="x" placeholder="x">
//                         <label>Y:</label>
//                         <input type="number" class="y" placeholder="y">
//                         <button class="defaultButton liquid remove">Remove</button>`;

//         let name = li.querySelector('.name');
//         name.value = params[i].name;
//         name.addEventListener('change', ()=>{
//             let idx = Array.prototype.slice.call(scannerList.children).indexOf(li);
//             config.points[idx].name = name.value; // TODO numery punktow
//         });

//         let posX = li.querySelector('.x');
//         posX.value = params[i].x;
//         posX.addEventListener('change', ()=>{
//             let idx = Array.prototype.slice.call(scannerList.children).indexOf(li);
//             console.log(`x[${idx}] -> ${posX.value}`);
//             config.scanners[idx].x = parseFloat(posX.value);
//         });

//         let posY = li.querySelector('.y');
//         posY.value = params[i].y;
//         posY.addEventListener('change', ()=>{
//             let idx = Array.prototype.slice.call(scannerList.children).indexOf(li);
//             console.log(`y[${idx}] -> ${posY.value}`);
//             config.scanners[idx].y = parseFloat(posY.value);
//         });
        
//         let rem = li.querySelector('.remove');
//         rem.addEventListener('click', ()=>{
//             let idx = Array.prototype.slice.call(scannerList.children).indexOf(li);
//             console.log(`Removed element #${idx}`);
//             config.scanners.splice(idx, 1);

//             for (let i = 0; i < config.lookup.length; i++) {
//                 config.lookup[i].scanners.splice(idx, 1);
//             }

//             li.remove();
//         });

//         if (append) {
//             config.scanners.push(params[i]);
//             for (let i = 0; i < config.lookup.length; i++) {
//                 config.lookup[i].scanners.push(0);
//             }
//         }

//         let cas = li.querySelector('.case');

//         let idx = Array.prototype.slice.call(scannerList.children).indexOf(li);

//         console.log(idx);
//         updateCases(cas, config.scanners[idx].model);
//     }
// }

// DEVELOPMENT