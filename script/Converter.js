document.addEventListener('DOMContentLoaded', () => {
    const dropZone = document.getElementById('dropZone');
    const output = document.getElementById('output');
    let reader;

    dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        e.stopPropagation();
        dropZone.classList.add('highlight');
    });

    dropZone.addEventListener('dragleave', (e) => {
        e.preventDefault();
        e.stopPropagation();
        dropZone.classList.remove('highlight');
    });

    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        e.stopPropagation();
        dropZone.classList.remove('highlight');

        const file = e.dataTransfer.files[0];
        if (file && file.type === 'text/xml') {
            reader = new FileReader();

            reader.onload = function(e) {
                const xmlContent = e.target.result;
                try {
                    const parser = new DOMParser();
                    const xmlDoc = parser.parseFromString(xmlContent, 'text/xml');
                    const jsonString = JSON.stringify(xmlToJson(xmlDoc), null, 2);
                    output.textContent = jsonString;
                } catch (error) {
                    alert('Invalid XML format. Please drop a valid XML file.');
                }
            };

            reader.readAsText(file);
        } else {
            output.textContent = 'Please drop an XML file.';
        }
    });
    
    function xmlToJson(xml) {
        const dataNode = xml.querySelector('data');
        const items = dataNode.querySelectorAll('item');
    
        const result = {
            data: Array.from(items).map(item => ({
                id: item.querySelector('id').textContent,
                name: item.querySelector('name').textContent,
                price: item.querySelector('price').textContent
            }))
        };
    
        return result;
    }
    
});

const downloadButton = document.getElementById('downloadButton');
downloadButton.addEventListener('click', () => {
    const jsonContent = output.textContent;
    if (jsonContent) {
        const currentDate = new Date();
        const fileName = `json_${currentDate.toISOString()}.json`;

        const blob = new Blob([jsonContent], { type: 'application/json' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = fileName;
        link.click();
    }
});
