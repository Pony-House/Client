import { contextBridge, ipcRenderer } from 'electron';
import { generateApiKey } from 'generate-api-key';

contextBridge.exposeInMainWorld('electronDB', {
    run: (value1, value2) => {
        const id = generateApiKey();
        ipcRenderer.send('requestDB', 'run', id, value1, value2);
    },
    all: (value1, value2) => {
        const id = generateApiKey();
        ipcRenderer.send('requestDB', 'all', id, value1, value2);
    },
    runPing: () => {
        const id = generateApiKey();
        ipcRenderer.send('requestDBPing', id);
    },
});

ipcRenderer.on('requestDB', (event, result) => {
    console.log(result);
});
