export function splitOnLast(str: string, sep: string): [first: string, rest: string] {
    const indexOfLast = str.lastIndexOf('.');
    return [str.substr(0, indexOfLast), str.substr(indexOfLast + 1)];
}

export function getNestedAttribute(obj: any, path: string): any {
    let o = obj;
    path = path.replace(/\[(\w+)\]/g, '.$1'); // convert indexes to properties
    path = path.replace(/^\./, '');           // strip a leading dot
    const a = path.split('.');
    for (let i = 0, n = a.length; i < n; ++i) {
        const k = a[i];
        if (k in o) {
            o = o[k];
        } else {
            return;
        }
    }
    return o;
}

export function getNestedAttributes(obj: any, path: string): any[] {
    return path.split(/\[]\.?/).filter(part => !!part).reduce(((previousValue, currentValue, i, a) => {
        const nestedObjects = previousValue.map(o => getNestedAttribute(o, currentValue));
        if (i < a.length - 1 || path.endsWith('[]')) { // if not last element
            return (nestedObjects as any[][]).reduce((prev, curr) => [...prev, ...curr], [] as any[]);
        }
        return nestedObjects;
    }), [obj] as any[])
}
