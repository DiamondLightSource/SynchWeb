

export function convertToCSV(data) {

    const result = [
        // headers
        Object.keys(data['0']),
        // values
        ...Object.values(data).map(item => Object.values(item))
    ]
        .reduce((string, item) => {
            string += item.join(',') + '\n';
            return string;
    }, '');

    return result;
}

export function exportCSV(csv) {

    const anchor = document.createElement('a');
    anchor.href = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv);
    anchor.target = '_blank';
    anchor.download = 'summary_export.csv';
    anchor.click();

}

