function parseFields(xml) {
    let parser = new DOMParser();

    let input = parser.parseFromString(xml, "text/xml");

    let zones = {};
    
    let fieldSets = input.querySelectorAll("Fieldset");
    for (let i = 0; i < fieldSets.length; i++) {
        let element = fieldSets[i];

        let fieldsetName = element.getAttribute("Name");
        zones[fieldsetName] = {};

        let fields = element.querySelectorAll("Field");
        for (let i = 0; i < fields.length; i++) {
            let element = fields[i];

            let fieldName = element.getAttribute("Name");
            zones[fieldsetName][fieldName] = {
                fieldType: element.getAttribute("Fieldtype"),
                fields: [],
                cutouts: []
            };

            let polygons = element.querySelectorAll('Polygon');
            for (let i = 0; i < polygons.length; i++) {
                let element = polygons[i];

                let polygon = {
                    type: 'Polygon',
                    points: []
                };

                let points = element.querySelectorAll("Point");
                for (let i = 0; i < points.length; i++) {
                    let element = points[i];
                    polygon.points.push({x: parseInt(element.getAttribute("X")), y: -parseInt(element.getAttribute("Y"))});
                };

                switch(element.getAttribute('Type')) {
                    case 'Field': zones[fieldsetName][fieldName].fields.push(polygon); break;
                    case 'CutOut': zones[fieldsetName][fieldName].cutouts.push(polygon); break;
                }
            };

            let rectangles = element.querySelectorAll('Rectangle');
            for (let i = 0; i < rectangles.length; i++) {
                let element = rectangles[i];

                let ox = parseInt(element.getAttribute('OriginX'));
                let oy = -parseInt(element.getAttribute('OriginY'));
                let w = parseInt(element.getAttribute('Width'));
                let h = parseInt(element.getAttribute('Height'));
                let ang = parseInt(element.getAttribute('Rotation'));

                let polygon = {
                    type: 'Polygon',
                    points: [
                        {x: ox, y: oy},
                        {x: ox + Math.cos(ang) * w, y: oy + Math.sin(ang) * w},
                        {x: ox + Math.cos(ang) * w - Math.sin(ang) * h, y: oy + Math.sin(ang) * w + Math.cos(ang) * h},
                        {x: ox - Math.sin(ang) * h, y: oy + Math.cos(ang) * h},
                        {x: ox, y: oy}
                    ]
                };

                switch(element.getAttribute('Type')) {
                    case 'Field': zones[fieldsetName][fieldName].fields.push(polygon); break;
                    case 'CutOut': zones[fieldsetName][fieldName].cutouts.push(polygon); break;
                }
            }

            let circles = element.querySelectorAll('Circle');
            for (let i = 0; i < circles.length; i++) {
                let element = circles[i];
                let x = parseInt(element.getAttribute("CenterX"));
                let y = -parseInt(element.getAttribute("CenterY"));
                let radius = parseInt(element.getAttribute("Radius"));

                let sector = {
                    type: 'Sector',
                    x: x,
                    y: y,
                    radius: radius,
                    startAngle: -Math.PI,
                    endAngle: Math.PI
                };

                if (x * x + y * y > radius * radius) {
                    switch(element.getAttribute('Type')) {
                        case 'Field': zones[fieldsetName][fieldName].fields.push(sector); break;
                        case 'CutOut': zones[fieldsetName][fieldName].cutouts.push(sector); break;
                    }
                }
            }

            let sectors = element.querySelectorAll('CircleSector');
            for (let i = 0; i < sectors.length; i++) {
                let element = sectors[i];
                let x = parseInt(element.getAttribute('CenterX'));
                let y = -parseInt(element.getAttribute('CenterY'));
                let radius = parseInt(element.getAttribute('Radius'));
                let startAngle = -parseFloat(element.getAttribute('EndAngle')) / 180 * Math.PI;
                let endAngle = -parseFloat(element.getAttribute('StartAngle')) / 180 * Math.PI;

                let sector = {
                    type: 'Sector',
                    x: x,
                    y: y,
                    radius: radius,
                    startAngle: startAngle < -Math.PI ? startAngle + 2 * Math.PI : startAngle,
                    endAngle: endAngle < -Math.PI ? endAngle + 2 * Math.PI : endAngle
                };

                if (x * x + y * y > radius * radius) {
                    switch(element.getAttribute('Type')) {
                        case 'Field': zones[fieldsetName][fieldName].fields.push(sector); break;
                        case 'CutOut': zones[fieldsetName][fieldName].cutouts.push(sector); break;
                    }
                }
            }

            let contours = element.querySelectorAll('ContourLine');
            for (let i = 0; i < contours.length; i++) {
                let element = contours[i];
                
                let polygon = {
                    type: 'Polygon',
                    points: []
                };
                
                let points = element.querySelectorAll('Point');
                //polygon.points.push({x: 0, y: 0});
                for (let i = 0; i < points.length; i++) {
                    let element = points[i];
                    polygon.points.push({
                        x: parseInt(element.getAttribute('X')),
                        y: -parseInt(element.getAttribute('Y'))
                    });
                }
                //polygon.points.push({x: 0, y: 0});

                /*switch(element.getAttribute('Type')) {
                    case 'Field': zones[fieldsetName][fieldName].fields.push(polygon); break;
                    case 'CutOut': zones[fieldsetName][fieldName].cutouts.push(polygon); break;
                }*/
                zones[fieldsetName][fieldName].fields.push(polygon);
            }
        };
    };

    return zones;
}