function createContour(points) {
    let step = 0;
    // Create edges
    let edges = createEdges(points);

    /*
    // Insert origin lines
    for (let i = 0; i < points.length; i++) {
        edges.push([{x: 0, y: 0}, points[i]]);
    }
    */

    console.log(`Step ${++step} complete`);

    console.log(`Found ${edges.length} edges`);
    // Remove duplicates
    {
        let i = 0;
        while (i < edges.length) {
            let j = i;
            while (++j < edges.length) {
                if (
                    equ(edges[i][0], edges[j][0]) && equ(edges[i][1], edges[j][1]) ||
                    equ(edges[i][0], edges[j][1]) && equ(edges[i][1], edges[j][0])
                ) {
                    edges.splice(j--, 1);
                }
            }
            i++;
        }
    }
    console.log(`Found ${edges.length} edges after cleanup`);

    console.log(`Step ${++step} complete`);

    // Remove dots
    {
        let i = 0;
        while (i < edges.length) {
            if (equ(edges[i][0], edges[i][1])) {
                edges.splice(i, 1);
            } else {
                i++;
            }
        }
    }
    console.log(`Found ${edges.length} edges after dot cleanup`);

    console.log(`Step ${++step} complete`);

    // Split edges
    {
        let i = 0;
        while (i < edges.length) {
            let j = i;
            while (++j < edges.length) {
                if (
                    !equ(edges[i][0], edges[j][0]) &&
                    !equ(edges[i][0], edges[j][1]) &&
                    !equ(edges[i][1], edges[j][0]) &&
                    !equ(edges[i][1], edges[j][1]) &&
                    intersect(edges[i], edges[j])
                ) {
                    //console.log(`[(${edges[i][0].x}, ${edges[i][0].y}), (${edges[i][1].x}, ${edges[i][1].y})], [(${edges[j][0].x}, ${edges[j][0].y}), (${edges[j][1].x}, ${edges[j][1].y})]`);
                    //console.log(edges[i], edges[j]);
                    let e2 = edges[j]; edges.splice(j, 1);
                    let e1 = edges[i]; edges.splice(i, 1);
                    //console.log(e1, e2);
                    let intr = lineIntersection(e1, e2);

                    let l1 = dst(e1[0], e1[1]);
                    let l2 = dst(e2[0], e2[1]);

                    if (
                        dst(e1[0], intr) + dst(e1[1], intr) <= l1 + 0.1 &&
                        dst(e2[0], intr) + dst(e2[1], intr) <= l2 + 0.1
                    ) {
                        edges.push([e1[0], intr], [intr, e1[1]], [e2[0], intr], [intr, e2[1]]);
                        //console.log(i, j, [e1[0], intr], [intr, e1[1]], [e2[0], intr], [intr, e2[1]]);
                        i--;
                        break;
                    }
                }
            }
            ++i;
        }
    }
    console.log(`Step ${++step} complete`);

    // Remove duplicates
    {
        let i = 0;
        while (i < edges.length) {
            let j = i;
            while (++j < edges.length) {
                if (
                    equ(edges[i][0], edges[j][0]) && equ(edges[i][1], edges[j][1]) ||
                    equ(edges[i][0], edges[j][1]) && equ(edges[i][1], edges[j][0])
                ) {
                    edges.splice(j--, 1);
                }
            }
            i++;
        }
    }
    console.log(`Step ${++step} complete`);

    // Remove dots
    {
        let i = 0;
        while (i < edges.length) {
            if (equ(edges[i][0], edges[i][1])) {
                edges.splice(i, 1);
            } else {
                i++;
            }
        }
    }
    console.log(`Step ${++step} complete`);

    // Marge colinear segments
    {
        let edgeSet = [];
        for (let i = 0; i < edges.length; i++) {
            let pts = [];
            for (let j = i; j < edges.length; j++) {
                if (colinearOverlap(edges[i], edges[j])) {
                    pts.push(...edges[j]);
                }
            }

            // Find edge point
            let ep = pts[0];
            let dt = 0;
            for (let j = 0; j < pts.length; j++) {
                let dtx = 0;
                for (let k = 0; k < pts.length; k++) {
                    dtx += dst(pts[j], pts[k]);
                }
                if (dtx > dt) {
                    dt = dtx;
                    ep = pts[j];
                }
            }

            pts.sort((a, b) => {
                return dst(ep, a) - dst(ep, b);
            });

            //console.log(pts);

            edgeSet.push(...createEdges(pts));
        }

        edges = [...edgeSet];
    }
    console.log(`Step ${++step} complete`);

    // Remove duplicates
    {
        let i = 0;
        while (i < edges.length) {
            let j = i;
            while (++j < edges.length) {
                if (
                    equ(edges[i][0], edges[j][0]) && equ(edges[i][1], edges[j][1]) ||
                    equ(edges[i][0], edges[j][1]) && equ(edges[i][1], edges[j][0])
                ) {
                    edges.splice(j--, 1);
                }
            }
            i++;
        }
    }
    console.log(`Step ${++step} complete`);

    // Remove dots
    {
        let i = 0;
        while (i < edges.length) {
            if (equ(edges[i][0], edges[i][1])) {
                edges.splice(i, 1);
            } else {
                i++;
            }
        }
    }
    console.log(`Step ${++step} complete`);

    //return edges;

    return findPath(edges);
}

function findPath(edg) {
    let edges = cloneEdges(edg);

    for (let i = 0; i < edges.length; i++) {
        // Clear visited
        for (let j = 0; j < edges.length; j++) {
            edges[j][0].visited = false;
            edges[j][1].visited = false;
        }

        let path = [edges[i][0]];
        edges[i][0].visited = true;
        let candidate = edges[i][1];
        while (candidate.visited != true) {
            candidate.visited = true;
            path.push(candidate);
            let minH = 2;
            for (let j = 0; j < edges.length; j++) {
                if (
                    equ(path[path.length - 1], edges[j][0]) &&
                    !equ(path[path.length - 2], edges[j][1])
                ) {
                    let hed = heading({x: path[path.length - 1].x - path[path.length - 2].x, y: path[path.length - 1].y - path[path.length - 2].y}, {x: edges[j][1].x - path[path.length - 1].x, y: edges[j][1].y - path[path.length - 1].y});
                    if (hed <= minH) {
                        minH = hed;
                        candidate = edges[j][1];
                    }
                } else if (
                    equ(path[path.length - 1], edges[j][1]) &&
                    !equ(path[path.length - 2], edges[j][0])
                ) {
                    let hed = heading({x: path[path.length - 1].x - path[path.length - 2].x, y: path[path.length - 1].y - path[path.length - 2].y}, {x: edges[j][0].x - path[path.length - 1].x, y: edges[j][0].y - path[path.length - 1].y});
                    if (hed <= minH) {
                        minH = hed;
                        candidate = edges[j][0];
                    }
                }
            }
        }

        if (path.length > 2 && cwPoly(path)) {
            console.log(path);
            return path;
        }
    }

    for (let i = 0; i < edges.length; i++) {
        // Clear visited
        for (let j = 0; j < edges.length; j++) {
            edges[j][0].visited = false;
            edges[j][1].visited = false;
        }

        let path = [edges[i][1]];
        edges[i][1].visited = true;
        let candidate = edges[i][0];
        while (candidate.visited != true) {
            candidate.visited = true;
            path.push(candidate);
            let minH = 2;
            for (let j = 0; j < edges.length; j++) {
                if (
                    equ(path[path.length - 1], edges[j][0]) &&
                    !equ(path[path.length - 2], edges[j][1])
                ) {
                    let hed = heading({x: path[path.length - 1].x - path[path.length - 2].x, y: path[path.length - 1].y - path[path.length - 2].y}, {x: edges[j][1].x - path[path.length - 1].x, y: edges[j][1].y - path[path.length - 1].y});
                    if (hed <= minH) {
                        minH = hed;
                        candidate = edges[j][1];
                    }
                } else if (
                    equ(path[path.length - 1], edges[j][1]) &&
                    !equ(path[path.length - 2], edges[j][0])
                ) {
                    let hed = heading({x: path[path.length - 1].x - path[path.length - 2].x, y: path[path.length - 1].y - path[path.length - 2].y}, {x: edges[j][0].x - path[path.length - 1].x, y: edges[j][0].y - path[path.length - 1].y});
                    if (hed <= minH) {
                        minH = hed;
                        candidate = edges[j][0];
                    }
                }
            }
        }

        if (path.length > 2 && cwPoly(path)) {
            console.log(path);
            return path;
        }
    }
}

function cloneEdges(edges) {
    let edg = [];
    for (let i = 0; i < edges.length; i++) {
        edg.push([{x: edges[i][0].x, y: edges[i][0].y}, {x: edges[i][1].x, y: edges[i][1].y}]);
    }
    return edg;
}

function cwPoly(poly) {
    let sum = 0;
    for (let i = 1; i < poly.length; i++) {
        sum += (poly[i].x - poly[i - 1].x) * (poly[i].y + poly[i - 1].y);
    }
    return sum > 0;
}

function createEdges(points) {
    let edges = [];
    for (let i = 1; i < points.length; i++) {
        edges.push([points[i - 1], points[i]]);
    }
    return edges;
}

function mergeColinear(e1, e2) {
    if (
        colinear(e1[0], e1[1], e2[0]) && colinear(e1[0], e1[1], e2[1])
    ){
        let pts = [...e1, ...e2];
        pts.sort((a, b) => {
            return dst({x: 0, y: 0}, a) < dst({x: 0, y: 0}, b)
        });

        // Remove duplicates
        {
            let i = 0;
            while (i < pts.length) {
                let j = i
                while (++j < pts.length) {
                    if (equ(pts[i], pts[j])) {
                        pts.splice(j--, 1);
                    }
                }
                i++;
            }
        }

        edges = createEdges(pts);
    } else {
        edges.push(e1, e2);
    }
}

function lineIntersection(l1, l2) {
    //console.log(l1, l2);
    return {
        x: ((l1[0].x * l1[1].y - l1[0].y * l1[1].x) * (l2[0].x - l2[1].x) - (l1[0].x - l1[1].x) * (l2[0].x * l2[1].y - l2[0].y * l2[1].x)) / ((l1[0].x - l1[1].x) * (l2[0].y - l2[1].y) - (l1[0].y - l1[1].y) * (l2[0].x - l2[1].x)),
        y: ((l1[0].x * l1[1].y - l1[0].y * l1[1].x) * (l2[0].y - l2[1].y) - (l1[0].y - l1[1].y) * (l2[0].x * l2[1].y - l2[0].y * l2[1].x)) / ((l1[0].x - l1[1].x) * (l2[0].y - l2[1].y) - (l1[0].y - l1[1].y) * (l2[0].x - l2[1].x))
    };
}

function intersect(l1, l2) {
    return ccw(l1[0], l2[0], l2[1]) != ccw(l1[1], l2[0], l2[1]) && ccw(l1[0], l1[1], l2[0]) != ccw(l1[0], l1[1], l2[1]);
}

function ccw(v1, v2, v3) {
    return (v3.y - v1.y) * (v2.x - v1.x) > (v2.y - v1.y) * (v3.x - v1.x);
}

function equ(p1, p2) {
    return p1.x == p2.x && p1.y == p2.y;
}

function dst(v1, v2) {
    return Math.sqrt((v1.x - v2.x)*(v1.x - v2.x) + (v1.y - v2.y)*(v1.y - v2.y));
}

function colinear(p1, p2, p3) {
    let area = 0.5 * Math.abs(p1.x * (p2.y - p3.y) + p2.x * (p3.y - p1.y) + p3.x * (p1.y - p2.y));
    return area < Number.EPSILON;
}

function colinearOverlap(l1, l2) {
    let len = dst(l1[0], l1[1]);
    let ovA = dst(l1[0], l2[0]) + dst(l1[1], l2[0]) <= len + Number.EPSILON;
    let ovB = dst(l1[0], l2[1]) + dst(l1[1], l2[1]) <= len + Number.EPSILON;
    
    return (ovA && colinear(l1[0], l1[1], l2[1])) || (ovB && colinear(l1[0], l1[1], l2[0]));
}

function dot(v1, v2) {
    let nv1 = normalize(v1);
    let nv2 = normalize(v2);
    return nv1.x * nv2.x + nv1.y * nv2.y;
}

function heading(v1, v2) {
    let tv1 = {x: v1.y, y: -v1.x};
    let dt = dot(tv1, v2);
    let dtx = dot(v1, v2);

    if (dtx < 0) {
        dt = 2 * Math.sign(dt) - dt;
    }

    return dt;
}

function normalize(vec) {
    let len = Math.sqrt(vec.x * vec.x + vec.y * vec.y);
    return {x: vec.x / len, y: vec.y / len};
}