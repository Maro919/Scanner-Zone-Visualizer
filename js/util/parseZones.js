let dbg;

function parseZones(xml) {
    let parser = new DOMParser();

    let element = parser.parseFromString(xml, 'text/xml');

    let fields = element.getElementsByTagName('UserField');

    let userFields = [];

    for (let i = 0; i < fields.length; i++) {
        let element = fields[i];

        //console.log(element);

        dbg = element;

        let parent = element.parentNode.parentNode.querySelector('Name').innerHTML;
        let name = element.querySelector('Name').innerHTML;

        userFields[parseInt(element.getAttribute('Id'))] = [parent, name];
    }

    let zones = [];

    let evals = element.getElementsByTagName('Eval');
    for (let i = 0; i < evals.length; i++) {
        let element = evals[i];
        let cases = element.getElementsByTagName('UserFieldId');

        let path = [];

        for (let i = 0; i < cases.length; i++) {
            path[i] = userFields[parseInt(cases[i].innerHTML)];
        }

        zones[i] = path;
    }

    let names = [];
    let caseNames = element.querySelectorAll('Cases>Case>Name');
    for (let i = 0; i < caseNames.length; i++) {
        names[parseInt(caseNames[i].parentNode.getAttribute('Id'))] = caseNames[i].innerHTML;
    }

    let cases = [];

    for (let j = 0; j < zones[0].length; j++) {
        cases[j] = {name: names[j], fields: []};
        for (let i = 0; i < zones.length; i++) {
            cases[j].fields.push(zones[i][j]);
        }
    }

    let ordered = [];
    let order = element.querySelectorAll('SdImportExport>Cases>Case');
    for (let i = 0; i < order.length; i++) {
        ordered[i] = cases[parseInt(order[i].getAttribute('Id'))];
    }

    return ordered;
}