function drawAGV(config, id) {
    if (id == -1) return;

    let size = getSize(config, id);

    canvas.width = size.w;
    canvas.height = size.h;

    const tcanvas = document.createElement('canvas');
    const tctx = tcanvas.getContext('2d');
    
    tcanvas.width = size.w;
    tcanvas.height = size.h;
    //tctx.translate(size.w/2, size.h/2);
    tctx.translate(-size.x, -size.y);

    ctx.translate(-size.x, -size.y);

    console.log(size);

    if (image) {
        ctx.save();
        ctx.drawImage(image, config.image.x - config.image.width / 2, config.image.y - config.image.height / 2, config.image.width, config.image.height);
        ctx.restore();
    }

    //ctx.translate(size.x, size.y);
    ctx.translate(size.x, size.y);

    let cids = config.lookup[id].scanners;
    for (let x = 0; x < config.scanners.length; x++) {
        let scanner = config.scanners[x];
        if (cids[x] != -1 && size.w > 0 && size.h > 0) {
            for (let i = 0; i < scanner.model[cids[x]].fields.length; i++) {
                //tctx.clearRect(-size.w/2, -size.h/2, size.w, size.h);
                tctx.clearRect(size.x, size.y, size.w, size.h);
                
                tctx.save();
                tctx.translate(scanner.x, scanner.y);
                drawField(scanner.model[cids[x]].fields[i], tctx);
                tctx.restore();

                ctx.drawImage(tcanvas, 0, 0);
            }
        }
    }

    let src = canvas.toDataURL();
    preview.src = src;
}

function getSize(config, id) {
    let maxX = (config.image.x + config.image.width / 2) || 0;
    let maxY = (config.image.y + config.image.height / 2) || 0;
    let minX = (config.image.x - config.image.width / 2) || 0;
    let minY = (config.image.y - config.image.height / 2) || 0;

    let cids = config.lookup[id].scanners;
    for (let x = 0; x < config.scanners.length; x++) {
        let scanner = config.scanners[x];
        if (cids[x] != -1) {
            for (let i = 0; i < scanner.model[cids[x]].fields.length; i++) {
                for (let j = 0; j < scanner.model[cids[x]].fields[i].fields.length; j++) {
                    switch(scanner.model[cids[x]].fields[i].fields[j].type) {
                        case 'Polygon':
                            for (let k = 0; k < scanner.model[cids[x]].fields[i].fields[j].points.length; k++) {
                                let currentX = scanner.x + scanner.model[cids[x]].fields[i].fields[j].points[k].x;
                                let currentY = scanner.y + scanner.model[cids[x]].fields[i].fields[j].points[k].y;
                                maxX = maxX < currentX ? currentX : maxX;
                                minX = minX > currentX ? currentX : minX;
                                maxY = maxY < currentY ? currentY : maxY;
                                minY = minY > currentY ? currentY : minY;
                            }
                            break;
                        case 'Sector':
                            let currentXP = (scanner.x + scanner.model[cids[x]].fields[i].fields[j].x + scanner.model[cids[x]].fields[i].fields[j].radius);
                            let currentYP = (scanner.y + scanner.model[cids[x]].fields[i].fields[j].y + scanner.model[cids[x]].fields[i].fields[j].radius);
                            let currentXN = (scanner.x + scanner.model[cids[x]].fields[i].fields[j].x - scanner.model[cids[x]].fields[i].fields[j].radius);
                            let currentYN = (scanner.y + scanner.model[cids[x]].fields[i].fields[j].y - scanner.model[cids[x]].fields[i].fields[j].radius);
                            maxX = maxX < currentXP ? currentXP : maxX;
                            minX = minX > currentXN ? currentXN : minX;
                            maxY = maxY < currentYP ? currentYP : maxY;
                            minY = minY > currentYN ? currentYN : minY;
                            break;
                    }
                }
            }
        }
    }

    return { w: maxX - minX, h: maxY - minY, x: minX, y: minY};
}