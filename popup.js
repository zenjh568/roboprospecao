document.addEventListener('DOMContentLoaded', () => {
    const btnIniciar = document.getElementById('btnIniciar');
    const btnPausar = document.getElementById('btnPausar');
    const btnParar = document.getElementById('btnParar');
    const status = document.getElementById('statusMsg');

    const enviarComando = (acao, msg) => {
        status.innerText = msg;
        chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
            if (tabs[0]) chrome.tabs.sendMessage(tabs[0].id, { acao: acao });
        });
    };

    btnIniciar.addEventListener('click', () => enviarComando('iniciar', 'Robô Rodando... ▶️'));
    btnPausar.addEventListener('click', () => enviarComando('pausar', 'Robô Pausado ⏸️'));
    btnParar.addEventListener('click', () => enviarComando('parar', 'Robô Parado ⏹️'));
});