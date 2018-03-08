let points = [{
    name: 'A',
    parents: ['B', 'C']
}, {
    name: 'C',
    parents: ['D', 'M']
}, {
    name: 'D',
    parents: ['E']
}, {
    name: 'E',
    parents: ['P', 'L', 'F']
}, {
    name: 'F',
    parents: ['C']
}, {
    name: 'M',
    parents: ['N']
}, {

    name: 'N',
    parents: ['K']
}, {
    name: 'K',
    parents: ['M']
}, {
    name: 'P',
    parents: []
},
{
    name: 'L',
    parents: []
}, {
    name: 'B',
    parents: []
}]


function getParents(name) {
    let parents = [];
    points.map((point) => {
        if (name === point.name) {
            parents = point.parents;
        }
    })
    return parents;
}


let flag = false;

function scanPath(start, end, path) {
    let nextLists = getParents(start);
    let nextJump = false;


    for (let i = 0; i < nextLists.length; i++) {
        nextJump = nextLists[i];
        if (path.indexOf(nextJump) < 0) {
            console.log('nextJump:' + nextJump)
            !flag && path.push(nextJump);

            if (nextJump === end) {
                flag = true;
            }

            !flag && scanPath(nextJump, end, path);
        }

    }
    !flag && path.pop();
    return path;
}

console.log(scanPath('A', 'F', ['A']));