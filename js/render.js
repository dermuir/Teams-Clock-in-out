const { ipcRenderer } = require('electron')

function minimizer() {
    ipcRenderer.send('minimize', 'minimize');
}
function maximizer() {
    ipcRenderer.send('maximize', 'maximize');
}
function restorer() {
    ipcRenderer.send('restore', 'restore');
}
function closer() {
    ipcRenderer.send('closer', 'closer');
}
function logout() {
    ipcRenderer.send('logout','true');
}


/*function loading() {
    ipcRenderer.on('loading', (event, arg) => {
        console.log(arg) // prints "pong"
    });
}*/

// TODO: Make the button restore maximisation/unmaximisation occurs with rpc asynchronous
/*
    // Toggle maximise/restore buttons when maximisation/unmaximisation occurs
    toggleMaxRestoreButtons();
    win.on('maximize', toggleMaxRestoreButtons);
    win.on('unmaximize', toggleMaxRestoreButtons);

    function toggleMaxRestoreButtons() {
        if (win.isMaximized()) {
            document.body.classList.add('maximized');
        } else {
            document.body.classList.remove('maximized');
        }
   }*/
