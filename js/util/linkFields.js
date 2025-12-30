function linkFields(fields, cases) {
    let model = [];

    for (let i = 0; i < cases.length; i++) {
        model[i] = {name: cases[i].name, fields: []};
        for (let j = 0; j < cases[i].fields.length; j++) {
            if (cases[i].fields[j]) {
                model[i].fields.push(fields[cases[i].fields[j][0]][cases[i].fields[j][1]]);
            }
        }
    }

    return model;
}