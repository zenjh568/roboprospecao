document.addEventListener('DOMContentLoaded', () => {
    const btnToggle = document.getElementById('btnToggle');
    const toggleLabel = document.getElementById('toggleLabel');
    const ledIndicator = document.getElementById('ledIndicator');
    const btnIniciar = document.getElementById('btnIniciar');
    const btnPausar = document.getElementById('btnPausar');
    const btnParar = document.getElementById('btnParar');
    const status = document.getElementById('statusMsg');

    let roboLigado = false;

    // Restore persisted toggle state
    chrome.storage.local.get('roboLigado', (data) => {
        roboLigado = !!data.roboLigado;
        atualizarToggleUI();
    });

    function atualizarToggleUI() {
        if (roboLigado) {
            btnToggle.className = 'btn btn-toggle btn-toggle-on';
            ledIndicator.className = 'led led-green';
            toggleLabel.innerText = 'DESLIGAR ROBÔ';
        } else {
            btnToggle.className = 'btn btn-toggle btn-toggle-off';
            ledIndicator.className = 'led led-gray';
            toggleLabel.innerText = 'LIGAR ROBÔ';
        }
    }

    btnToggle.addEventListener('click', () => {
        roboLigado = !roboLigado;
        chrome.storage.local.set({ roboLigado });
        atualizarToggleUI();
        if (roboLigado) {
            enviarComando('ligar', '🟢 Robô Ligado');
        } else {
            enviarComando('desligar', '🔴 Robô Desligado');
        }
    });

    const enviarComando = (acao, msg) => {
        status.innerText = msg;
        chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
            if (tabs[0]) chrome.tabs.sendMessage(tabs[0].id, { acao: acao });
        });
    };

    btnIniciar.addEventListener('click', () => enviarComando('iniciar', '🤖 Robô + Agentes Rodando... ▶️'));
    btnPausar.addEventListener('click', () => enviarComando('pausar', 'Robô Pausado ⏸️'));
    btnParar.addEventListener('click', () => enviarComando('parar', 'Robô Parado ⏹️'));
});