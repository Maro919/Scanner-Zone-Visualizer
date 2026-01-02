function drawField(field, ctx) {
    if (field) {
        switch(field.fieldType) {
            case 'ProtectiveSafeBlanking': ctx.fillStyle = `rgba(255, 57, 0, 0.25)`; break;
            case 'WarningSafeBlanking': ctx.fillStyle = `rgba(255, 179, 0, 0.25)`; break;
            //case 'Contour': ctx.fillStyle = `rgba(255, 57, 0, 0.25)`; break;
            case 'Contour': ctx.fillStyle = `rgba(0, 255, 212, 0.25)`; break;
            default: ctx.fillStyle = `rgba(0, 0, 0, 0.25)`; break;
        }

        //console.log(field.fieldType);
        for (let j = 0; j < field.fields.length; j++) {
            switch(field.fields[j].type) {
                case 'Polygon': fieldPolygon(field.fields[j], ctx); break;
                case 'Sector': fieldSector(field.fields[j], ctx); break;
            }
        }

        for (let j = 0; j < field.cutouts.length; j++) {
            switch(field.cutouts[j].type) {
                case 'Polygon': cutoutPolygon(field.cutouts[j], ctx); break;
                case 'Sector': cutoutSector(field.cutouts[j], ctx); break;
            }
        }
    }
}

// Field polygon
function fieldPolygon(poly, ctx) {
    ctx.save();

    ctx.save();
    ctx.beginPath();
    polygon(poly.points, ctx);
    ctx.setLineDash([5, 2, 10, 15, 5, 2, 5, 2, 10, 2, 5, 15, 10, 2, 10, 2, 10, 15, 5, 2, 10, 2, 5, 15, 10, 2, 10, 15, 5, 2, 5, 15, 10, 2, 5, 2, 10, 2, 5, 20]);
    ctx.stroke();
    ctx.restore();

    ctx.beginPath();
    
    let points = poly.points;
    /*
    for (let i = 1; i < points.length; i++) {
        polygon([
            {x: 0, y: 0},
            points[i - 1],
            points[i],
            {x: 0, y: 0}
        ], ctx);
    }
    ctx.fill();*/

    let pts = [];
    for (let i = 1; i < points.length; i++) {
        pts.push(
            {x: 0, y: 0},
            points[i - 1],
            points[i],
            {x: 0, y: 0}
        );
    }

    let contour = createContour(pts);
    //console.log(contour);
    polygon(contour, ctx);
    ctx.fill();
    //ctx.stroke();

    ctx.restore();
}

// Cutout polygon
function cutoutPolygon(poly, ctx) {
    ctx.save();
    ctx.beginPath();

    let points = poly.points;
    /*
    for (let i = 1; i < points.length; i++) {
        let l1 = Math.sqrt(points[i - 1].x * points[i - 1].x + points[i - 1].y * points[i - 1].y);
        let v1 = {x: points[i - 1].x / l1, y: points[i - 1].y / l1};
        let l2 = Math.sqrt(points[i].x * points[i].x + points[i].y * points[i].y);
        let v2 = {x: points[i].x / l2, y: points[i].y / l2};

        polygon([
            points[i - 1],
            {x: points[i - 1].x + v1.x * 10000, y: points[i - 1].y + v1.y * 10000},
            {x: points[i].x + v2.x * 10000, y: points[i].y + v2.y * 10000},
            points[i],
            points[i - 1]
        ], ctx);
    }
    ctx.clip();
    ctx.clearRect(-10000, -10000, 20000, 20000);
    //ctx.stroke();
    */
    let pts = [];
    for (let i = 1; i < points.length; i++) {
        let l1 = Math.sqrt(points[i - 1].x * points[i - 1].x + points[i - 1].y * points[i - 1].y);
        let v1 = {x: points[i - 1].x / l1, y: points[i - 1].y / l1};
        let l2 = Math.sqrt(points[i].x * points[i].x + points[i].y * points[i].y);
        let v2 = {x: points[i].x / l2, y: points[i].y / l2};

        let p = [
            points[i - 1],
            {x: points[i - 1].x + v1.x * 500, y: points[i - 1].y + v1.y * 500},
            {x: points[i].x + v2.x * 500, y: points[i].y + v2.y * 500},
            points[i],
            points[i - 1]
        ];

        pts.push(...p);
    }

    let contour = createContour(pts);
    polygon(contour, ctx);
    ctx.clip();
    ctx.clearRect(-10000, -10000, 20000, 20000);
    ctx.stroke();

    ctx.restore();
}

//Field sector approx
function fieldSector(sector, ctx) {
    let p1 = {x: sector.x + Math.cos(sector.startAngle) * sector.radius, y: sector.y + Math.sin(sector.startAngle) * sector.radius};
    let p2 = {x: sector.x + Math.cos(sector.endAngle) * sector.radius, y: sector.y + Math.sin(sector.endAngle) * sector.radius};

    let poly = {
        points: [
            sector,
            p1
        ]
    };
    if (sector.startAngle == -sector.endAngle) {
        poly = {
            points: [p1]
        }
    }

    if (sector.startAngle < sector.endAngle) {
        for (let i = sector.startAngle; i < sector.endAngle; i += Math.PI / 8) {
            poly.points.push(
                {x: sector.x + Math.cos(i) * sector.radius, y: sector.y + Math.sin(i) * sector.radius}
            );
        }
    } else {
        for (let i = sector.startAngle; i < sector.endAngle + 2 * Math.PI; i += Math.PI / 8) {
            poly.points.push(
                {x: sector.x + Math.cos(i) * sector.radius, y: sector.y + Math.sin(i) * sector.radius}
            );
        }
    }

    poly.points.push(p2);
    if (sector.startAngle != -sector.endAngle) {
        poly.points.push(sector);
    } else {
        poly.points.push(p1);
    }

    fieldPolygon(poly, ctx);
}

//Cutout sector approx
function cutoutSector(sector, ctx) {
    let p1 = {x: sector.x + Math.cos(sector.startAngle) * sector.radius, y: sector.y + Math.sin(sector.startAngle) * sector.radius};
    let p2 = {x: sector.x + Math.cos(sector.endAngle) * sector.radius, y: sector.y + Math.sin(sector.endAngle) * sector.radius};
    let poly = {
        points: [
            sector,
            p1
        ]
    };
    if (sector.startAngle == -sector.endAngle) {
        poly = {
            points: [p1]
        }
    }

    if (sector.startAngle < sector.endAngle) {
        for (let i = sector.startAngle; i < sector.endAngle; i += Math.PI / 8) {
            poly.points.push(
                {x: sector.x + Math.cos(i) * sector.radius, y: sector.y + Math.sin(i) * sector.radius}
            );
        }
    } else {
        for (let i = sector.startAngle; i < sector.endAngle + 2 * Math.PI; i += Math.PI / 8) {
            poly.points.push(
                {x: sector.x + Math.cos(i) * sector.radius, y: sector.y + Math.sin(i) * sector.radius}
            );
        }
    }

    poly.points.push(p2);
    if (sector.startAngle != -sector.endAngle) {
        poly.points.push(sector);
    } else {
        poly.points.push(p1);
    }

    cutoutPolygon(poly, ctx);
}

/*
// Field sector
function fieldSector(sector, ctx) {
    ctx.save();
    ctx.beginPath();

    let point = sector;

    let dst = Math.sqrt(point.x * point.x + point.y * point.y);
    let angle = Math.PI/2 + Math.atan2(point.radius, dst);

    let a1 = Math.atan2(point.y, point.x) + angle;
    let a2 = Math.atan2(point.y, point.x) - angle;

    a1 = a1 > Math.PI ? a1 - 2 * Math.PI : a1;
    a2 = a2 < -Math.PI ? a2 + 2 * Math.PI : a2;

    let v1 = {x: point.x + Math.cos(a1)*point.radius, y: point.y + Math.sin(a1)*point.radius};
    let v2 = {x: point.x + Math.cos(a2)*point.radius, y: point.y + Math.sin(a2)*point.radius};

    let center = {x: 0, y: 0};

    let poly;
    
    {
        let p1 = {x: point.x + Math.cos(point.startAngle) * point.radius, y: point.y + Math.sin(point.startAngle) * point.radius};
        let p2 = {x: point.x + Math.cos(point.endAngle) * point.radius, y: point.y + Math.sin(point.endAngle) * point.radius};

        poly = [
            point,
            p1,
            center,
            point
        ];
        polygon(poly, ctx);

        poly = [
            point,
            p2,
            center,
            point
        ];
        polygon(poly, ctx);
    }
    
    //console.log(point.startAngle, a1, point.endAngle);
    if (
        (point.startAngle < point.endAngle && a1 >= point.startAngle && a1 <= point.endAngle) ||
        (point.startAngle > point.endAngle && !(a1 >= point.endAngle && a1 <= point.startAngle))
    ) {
        poly = [
            point,
            center,
            v1,
            point
        ];
        polygon(poly, ctx);
    }
    
    //console.log(point.startAngle, a2, point.endAngle);
    if (
        (point.startAngle < point.endAngle && a2 >= point.startAngle && a2 <= point.endAngle) ||
        (point.startAngle > point.endAngle && !(a2 >= point.endAngle && a2 <= point.startAngle))
    ) {
        poly = [
            point,
            center,
            v2,
            point
        ];
        polygon(poly, ctx);
    }
    
    ctx.moveTo(point.x, point.y);
    ctx.arc(point.x, point.y, point.radius, point.endAngle, point.startAngle, true);
    ctx.closePath();

    ctx.fill();

    ctx.restore();
    //ctx.stroke();
}

// Cutout sector
function cutoutSector(sector, ctx) {
    ctx.save();
    ctx.beginPath();

    let point = sector;

    let dst = Math.sqrt(point.x * point.x + point.y * point.y);
    let angle = Math.PI/2 + Math.atan2(point.radius, dst);

    let a1 = Math.atan2(point.y, point.x) + angle;
    let a2 = Math.atan2(point.y, point.x) - angle;

    a1 = a1 > Math.PI ? a1 - 2 * Math.PI : a1;
    a2 = a2 < -Math.PI ? a2 + 2 * Math.PI : a2;

    let v1 = {x: point.x + Math.cos(a1)*point.radius, y: point.y + Math.sin(a1)*point.radius};
    let v2 = {x: point.x + Math.cos(a2)*point.radius, y: point.y + Math.sin(a2)*point.radius};

    let lv1 = Math.sqrt(v1.x * v1.x + v1.y * v1.y);
    let lv2 = Math.sqrt(v2.x * v2.x + v2.y * v2.y);

    let v12 = {x: v1.x / lv1 * 10000, y: v1.y / lv1 * 10000};
    let v22 = {x: v2.x / lv2 * 10000, y: v2.y / lv2 * 10000};
    let vcn = {x: point.x / dst, y: point.y / dst};
    let vc2 = {x: point.x + vcn.x * 10000, y: point.y + vcn.y * 10000};

    let poly;
    
    {
        let p1 = {x: point.x + Math.cos(point.startAngle) * point.radius, y: point.y + Math.sin(point.startAngle) * point.radius};
        let lp1 = Math.sqrt(p1.x * p1.x + p1.y * p1.y);
        let p12 = {x: p1.x + p1.x / lp1 * 10000, y: p1.y + p1.y / lp1 * 10000};

        let p2 = {x: point.x + Math.cos(point.endAngle) * point.radius, y: point.y + Math.sin(point.endAngle) * point.radius};
        let lp2 = Math.sqrt(p2.x * p2.x + p2.y * p2.y);
        let p22 = {x: p2.x + p2.x / lp2 * 10000, y: p2.y + p2.y / lp2 * 10000};

        poly = [
            point,
            p1,
            p12,
            vc2,
            point
        ];
        polygon(poly, ctx);

        poly = [
            point,
            p2,
            p22,
            vc2,
            point
        ];
        polygon(poly, ctx);
    }
    
    //console.log(point.startAngle, a1, point.endAngle);
    if (
        (point.startAngle < point.endAngle && a1 >= point.startAngle && a1 <= point.endAngle) ||
        (point.startAngle > point.endAngle && !(a1 >= point.endAngle && a1 <= point.startAngle))
    ) {
        poly = [
            point,
            vc2,
            v12,
            v1,
            point
        ];
        polygon(poly, ctx);
    }
    
    //console.log(point.startAngle, a2, point.endAngle);
    if (
        (point.startAngle < point.endAngle && a2 >= point.startAngle && a2 <= point.endAngle) ||
        (point.startAngle > point.endAngle && !(a2 >= point.endAngle && a2 <= point.startAngle))
    ) {
        poly = [
            point,
            vc2,
            v22,
            v2,
            point
        ];
        polygon(poly, ctx);
    }
    
    ctx.moveTo(point.x, point.y);
    ctx.arc(point.x, point.y, point.radius, point.endAngle, point.startAngle, true);
    ctx.closePath();

    ctx.clip();
    ctx.clearRect(-10000, -10000, 20000, 20000);

    ctx.restore();
    //ctx.stroke();
}
*/
function polygon(points, ctx) {
    let dir = 0;
    for (let i = 1; i < points.length; i++) {
        dir += (points[i].x - points[i - 1].x) * (points[i].y + points[i - 1].y);
    }

    if (dir > 0) {
        ctx.moveTo(points[0].x, points[0].y);
        for (let i = 1; i < points.length; i++) {
            ctx.lineTo(points[i].x, points[i].y);
        }
    } else {
        ctx.moveTo(points[points.length - 1].x, points[points.length - 1].y);
        for (let i = points.length - 2; i >= 0; i--) {
            ctx.lineTo(points[i].x, points[i].y);
        }
    }
    ctx.closePath();
}