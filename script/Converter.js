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
        const result = {};
        parseNode(result, xml.documentElement);
        return result;
    }
    
    function parseNode(obj, node) {
        if (node.nodeType === Node.ELEMENT_NODE) {
            const nodeName = node.nodeName;
            if (!obj[nodeName]) {
                obj[nodeName] = {};
            }
    
            if (node.hasAttributes()) {
                const attributes = node.attributes;
                for (let i = 0; i < attributes.length; i++) {
                    const attr = attributes[i];
                    obj[nodeName][`@${attr.nodeName}`] = attr.nodeValue;
                }
            }
    
            if (node.hasChildNodes()) {
                const children = node.childNodes;
                for (let i = 0; i < children.length; i++) {
                    const childNode = children[i];
                    parseNode(obj[nodeName], childNode);
                }
            }
        } else if (node.nodeType === Node.TEXT_NODE) {
            obj['#text'] = node.textContent.trim();
        }
    }
    
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
});
