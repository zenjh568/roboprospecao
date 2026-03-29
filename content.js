(() => {
    if (window.__vanessaLeadsV59Init) return;
    window.__vanessaLeadsV59Init = true;

    // Referência aos Agentes Inteligentes
    const AI = window.AgentesInteligentes;
    const { Logger, Stats, Finder, Analyzer, Recovery, Watchdog, Retry, Human, Vision } = AI;

    let estadoRobo = 'PARADO'; 
    let loopRodando = false;
    let painelMinimizado = false; 

    document.addEventListener('keydown', (e) => {
        if (e.altKey && e.key.toLowerCase() === 'z') {
            const panel = document.getElementById('v-leads-panel');
            if (panel) panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
        }
    });

    function atualizarEstadoVisual() {
        const mini = document.getElementById('v-leads-mini');
        if (mini) {
            if (estadoRobo === 'RODANDO') {
                mini.classList.add('v-robo-trabalhando');
                mini.classList.remove('v-robo-parado');
            } else {
                mini.classList.remove('v-robo-trabalhando');
                mini.classList.add('v-robo-parado');
            }
        }
        
        let blocker = document.getElementById('v-block-overlay');
        if (!blocker) {
            blocker = document.createElement('div');
            blocker.id = 'v-block-overlay';
            blocker.style.cssText = 'position:fixed;top:0;left:0;width:100vw;height:100vh;z-index:9999990;background:rgba(0,0,0,0.1);display:none;cursor:not-allowed;';
            blocker.addEventListener('click', e => { e.stopPropagation(); e.preventDefault(); }, true);
            blocker.addEventListener('mousedown', e => { e.stopPropagation(); e.preventDefault(); }, true);
            document.body.appendChild(blocker);
        }
        blocker.style.display = (estadoRobo === 'RODANDO') ? 'block' : 'none';

        const btnIniciar = document.getElementById('v-leads-iniciar');
        if (btnIniciar) btnIniciar.innerText = estadoRobo === 'PAUSADO' ? "▶️ CONTINUAR FLUXO" : "▶️ INICIAR FLUXO";
    }

    function garantirPainel() {
        if (document.getElementById('v-leads-panel')) {
            atualizarEstadoVisual();
            
            // Lógica de troca automática de texto de comentário (opcional, se quiser usar)
            const selectTemplate = document.getElementById('v-target-template');
            const campoComentario = document.getElementById('v-texto-comentario');
            if (selectTemplate && campoComentario) {
                if (selectTemplate.value.includes('5acompanhamento')) {
                    if (campoComentario.value.includes('MARATONA')) {
                        campoComentario.value = "FOLLOW-UP PARA PREVISÃO DE COMPRA E MANUTENÇÃO DE INTERESSE.";
                    }
                } else if (selectTemplate.value.includes('mar_maratona')) {
                    if (campoComentario.value.includes('FOLLOW-UP')) {
                        campoComentario.value = "CONVITE DA MARATONA ENVIADO, AGUARDANDO CONFIRMAÇÃO";
                    }
                }
            }
            return;
        } 

        const html = `
          <style>
            @keyframes v-pulse-green {
              0% { box-shadow: 0 0 0 0 rgba(0, 204, 68, 0.7); }
              70% { box-shadow: 0 0 0 15px rgba(0, 204, 68, 0); }
              100% { box-shadow: 0 0 0 0 rgba(0, 204, 68, 0); }
            }
            .v-robo-trabalhando { animation: v-pulse-green 1.5s infinite; background: linear-gradient(135deg, #00cc44, #00ff44) !important; border-color: #fff !important; }
            .v-robo-parado { background: linear-gradient(135deg, #222, #444) !important; border-color: #666 !important; box-shadow: none !important; }
          </style>

          <div id="v-leads-panel" style="position:fixed; top:40px; left:20px; width:${painelMinimizado ? '50px' : '640px'}; background:${painelMinimizado ? 'transparent' : '#000'}; border:${painelMinimizado ? 'none' : '2px solid #ff6600'}; border-radius:10px; z-index:9999999; font-family:'Segoe UI',sans-serif; box-shadow:${painelMinimizado ? 'none' : '0 15px 35px rgba(0,0,0,0.9)'}; transition: width 0.3s; cursor: move; display: block;">
            
            <div id="v-leads-mini" class="v-robo-parado" style="display:${painelMinimizado ? 'flex' : 'none'}; justify-content:center; align-items:center; width:50px; height:50px; border-radius:50%; cursor:pointer; transition: all 0.3s;">
                <span style="font-size:26px; pointer-events:none; margin-top:2px;">🤖</span>
            </div>
            
            <div id="v-leads-full" style="display:${painelMinimizado ? 'none' : 'block'};">
                <div id="v-leads-header" style="background:linear-gradient(135deg, #000, #ff6600, #00cc44); padding:10px; text-align:center; border-bottom:1px solid #ff6600; border-radius:8px 8px 0 0; position:relative; user-select:none;">
                    <h2 style="font-size:12px; text-transform:uppercase; letter-spacing:1px; margin:0; color:#fff; font-weight:900; pointer-events:none;">PROSPECÇÃO 🤖</h2>
                    <div style="position:absolute; right:12px; top:8px; display:flex; gap:12px; align-items:center;">
                        <div id="v-btn-ocultar" title="Ocultar Tudo (Aperte Alt+Z para voltar)" style="cursor:pointer; color:#fff; font-size:16px;">👁️</div>
                        <div id="v-btn-minimizar" title="Minimizar para o ícone" style="cursor:pointer; color:#fff; font-size:16px; font-weight:bold; margin-top:-6px;">_</div>
                    </div>
                </div>
                
                <div style="padding:10px; background:#111; display:flex; gap:10px; border-radius:0 0 10px 10px; max-height: 85vh; overflow-y: auto;">
                    
                    <div style="flex:1; background:#000; border:1px solid #333; padding:10px; border-radius:8px; cursor: default; min-width: 250px;">
                        <div style="display:flex; justify-content:space-between; margin-bottom:8px;">
                            <p style="font-size:9px; color:#ff6600; font-weight:bold; margin:0; text-transform:uppercase; cursor: move;">Ações do Robô:</p>
                            <p style="font-size:8px; color:#aaa; font-weight:bold; margin:0; text-transform:uppercase;">Espera (s)</p>
                        </div>
                        <div style="display:flex; flex-direction:column; gap:6px;">
                            <div style="display:flex; justify-content:space-between; align-items:center;"><label style="font-size:10px; color:#fff; cursor:pointer;"><input type="checkbox" id="v-step-1" checked> 1. Abrir WhatsApp</label><input type="number" id="v-time-1" value="5.0" step="0.5" style="width:45px; background:#111; color:#00cc44; border:1px solid #333; border-radius:3px; font-size:10px; text-align:center;"></div>
                            <div style="display:flex; justify-content:space-between; align-items:center;"><label style="font-size:10px; color:#fff; cursor:pointer;"><input type="checkbox" id="v-step-2" checked> 2. Clicar no Clipe 📎</label><input type="number" id="v-time-2" value="3.0" step="0.5" style="width:45px; background:#111; color:#00cc44; border:1px solid #333; border-radius:3px; font-size:10px; text-align:center;"></div>
                            <div style="display:flex; justify-content:space-between; align-items:center;"><label style="font-size:10px; color:#fff; cursor:pointer;"><input type="checkbox" id="v-step-3" checked> 3. Abrir Template 📄</label><input type="number" id="v-time-3" value="4.0" step="0.5" style="width:45px; background:#111; color:#00cc44; border:1px solid #333; border-radius:3px; font-size:10px; text-align:center;"></div>
                            <div style="display:flex; justify-content:space-between; align-items:center;"><label style="font-size:10px; color:#fff; cursor:pointer;"><input type="checkbox" id="v-step-4" checked> 4. Abrir Lista ▼</label><input type="number" id="v-time-4" value="3.0" step="0.5" style="width:45px; background:#111; color:#00cc44; border:1px solid #333; border-radius:3px; font-size:10px; text-align:center;"></div>
                            <div style="display:flex; justify-content:space-between; align-items:center;"><label style="font-size:10px; color:#fff; cursor:pointer;"><input type="checkbox" id="v-step-5" checked> 5. Selecionar na Lista ✅</label><input type="number" id="v-time-5" value="5.0" step="0.5" style="width:45px; background:#111; color:#00cc44; border:1px solid #333; border-radius:3px; font-size:10px; text-align:center;"></div>
                            <div style="display:flex; justify-content:space-between; align-items:center;"><label style="font-size:10px; color:#00cc44; font-weight:bold; cursor:pointer;"><input type="checkbox" id="v-step-6" checked> 6. Preencher Dinâmico</label><input type="number" id="v-time-6" value="1.5" step="0.5" style="width:45px; background:#111; color:#00cc44; border:1px solid #333; border-radius:3px; font-size:10px; text-align:center;"></div>
                            <div style="display:flex; justify-content:space-between; align-items:center;"><label style="font-size:10px; color:#fff; cursor:pointer;"><input type="checkbox" id="v-step-7" checked> 7. Enviar WhatsApp</label><input type="number" id="v-time-7" value="5.0" step="0.5" style="width:45px; background:#111; color:#00cc44; border:1px solid #333; border-radius:3px; font-size:10px; text-align:center;"></div>
                            <div style="display:flex; justify-content:space-between; align-items:center;"><label style="font-size:10px; color:#fff; cursor:pointer;"><input type="checkbox" id="v-step-8" checked> 8. Fechar Aba Zap</label><input type="number" id="v-time-8" value="3.0" step="0.5" style="width:45px; background:#111; color:#00cc44; border:1px solid #333; border-radius:3px; font-size:10px; text-align:center;"></div>
                            <div style="display:flex; justify-content:space-between; align-items:center;"><label style="font-size:10px; color:#666; cursor:pointer;"><input type="checkbox" id="v-step-9"> 9. Salvar Comentário</label><input type="number" id="v-time-9" value="3.0" step="0.5" style="width:45px; background:#111; color:#666; border:1px solid #333; border-radius:3px; font-size:10px; text-align:center;"></div>
                            <div style="display:flex; justify-content:space-between; align-items:center;"><label style="font-size:10px; color:#666; cursor:pointer;"><input type="checkbox" id="v-step-10"> 10. Agendamento ⏱️</label><input type="number" id="v-time-10" value="4.0" step="0.5" style="width:45px; background:#111; color:#666; border:1px solid #333; border-radius:3px; font-size:10px; text-align:center;"></div>
                            <div style="display:flex; justify-content:space-between; align-items:center;"><label style="font-size:10px; color:#666; cursor:pointer;"><input type="checkbox" id="v-step-11"> 11. Check / OK Final</label><input type="number" id="v-time-11" value="3.0" step="0.5" style="width:45px; background:#111; color:#666; border:1px solid #333; border-radius:3px; font-size:10px; text-align:center;"></div>
                            <div style="display:flex; justify-content:space-between; align-items:center;"><label style="font-size:10px; color:#ff6600; font-weight:bold; cursor:pointer;"><input type="checkbox" id="v-step-12" checked> 12. Fechar Aba Cliente</label><input type="number" id="v-time-12" value="5.0" step="0.5" style="width:45px; background:#111; color:#ff6600; border:1px solid #ff6600; border-radius:3px; font-size:10px; text-align:center;"></div>
                        </div>
                    </div>

                    <div style="flex:1.2; display:flex; flex-direction:column; gap:8px;">
                        <div style="background:#000; border:1px solid #333; padding:8px; border-radius:8px; cursor: default;">
                            <p style="font-size:9px; color:#00cc44; font-weight:bold; margin:0 0 6px 0; text-transform:uppercase; cursor: move;">Configurações do Disparo:</p>
                            <label style="font-size:8px; color:#aaa;">MODO DE EXECUÇÃO:</label>
                            <select id="v-modo-execucao" style="width:100%; background:#111; color:#fff; border:1px solid #ff6600; border-radius:4px; padding:4px; font-size:9px; margin-bottom:6px; cursor: pointer;">
                                <option value="abas" selected>Abas Superiores (Abertas)</option>
                                <option value="lateral">Lista Lateral (Descendo)</option>
                            </select>
                            <label style="font-size:8px; color:#aaa;">TEMPLATE ALVO:</label>
                            <div style="display:flex; gap:4px; margin-bottom:6px;">
                                <select id="v-target-template" style="flex:1; background:#111; color:#fff; border:1px solid #ff6600; border-radius:4px; padding:4px; font-size:9px; cursor: pointer;">
                                    <option value="mar_maratona (MARKETING)" selected>mar_maratona (MARKETING)</option>
                                    <option value="5acompanhamento (MARKETING)">5acompanhamento (MARKETING)</option>
                                    <option value="4acompanhamento (MARKETING)">4acompanhamento (MARKETING)</option>
                                    <option value="1_vendas_inicial (MARKETING)">1_vendas_inicial (MARKETING)</option>
                                    <option value="livre02_inicial (MARKETING)">livre02_inicial (MARKETING)</option>
                                    <option value="livre02_sem_retorno (MARKETING)">livre02_sem_retorno (MARKETING)</option>
                                    <option value="livre02_acompanhamento (MARKETING)">livre02_acompanhamento (MARKETING)</option>
                                    <option value="livre02_resgate (MARKETING)">livre02_resgate (MARKETING)</option>
                                </select>
                                <button id="v-btn-add-template" title="Adicionar Novo Template" style="background:#00cc44; color:#fff; border:none; border-radius:4px; cursor:pointer; font-weight:bold; padding:0 8px;">➕</button>
                            </div>
                            <label style="font-size:8px; color:#00cc44; font-weight:bold;">MENSAGEM (PARÂMETRO 3):</label>
                            <textarea id="v-texto-param3" style="width:100%; height: 40px; resize:none; background:#111; color:#fff; border:1px solid #00cc44; border-radius:4px; padding:4px; font-size:9px; cursor: text;">Escreva sua mensagem personalizada aqui...</textarea>
                        </div>

                        <div style="background:#000; border:1px solid #333; padding:8px; border-radius:8px; cursor: default;">
                            <p style="font-size:9px; color:#ff6600; font-weight:bold; margin:0 0 6px 0; text-transform:uppercase; cursor: move;">Comentário / Agendamento:</p>
                            <label style="font-size:8px; color:#aaa;">TEXTO (COMENTÁRIO OU OBS. DA AGENDA):</label>
                            <textarea id="v-texto-comentario" style="width:100%; height: 35px; resize:none; background:#111; color:#fff; border:1px solid #ff6600; border-radius:4px; padding:4px; font-size:9px; margin-bottom:4px; cursor: text;">Ação realizada pelo Robô.</textarea>
                            <div id="v-box-agendamento" style="display:none; padding-top:6px; margin-top:4px; border-top:1px dashed #333;">
                                <label style="font-size:8px; color:#ff6600; font-weight:bold;">TIPO E DATA DO AGENDAMENTO (PASSO 10):</label>
                                <div style="display:flex; gap:4px; margin-top:4px;">
                                    <select id="v-tipo-agendamento" style="flex:1; background:#111; color:#fff; border:1px solid #ff6600; border-radius:4px; padding:4px; font-size:9px; cursor: pointer;">
                                        <option value="lembrete">Lembrete (Ícone Roxo Claro)</option>
                                        <option value="agendamento" selected>Agendamento (Ícone Roxo Escuro)</option>
                                    </select>
                                    <input type="date" id="v-data-agenda" title="Selecione a Data" style="flex:1; background:#111; color:#fff; border:1px solid #ff6600; border-radius:4px; padding:4px; font-size:9px; cursor: pointer;">
                                </div>
                            </div>
                        </div>

                        <div style="background:#000; border:1px solid #333; padding:10px; border-radius:8px; cursor: default; display:flex; flex-direction:column; justify-content:center; flex-grow:1;">
                            <button id="v-leads-iniciar" style="width:100%; border:none; padding:10px; border-radius:6px; font-weight:bold; cursor:pointer; color:#000; background:#00cc44; margin-bottom:8px; font-size:11px;">▶️ INICIAR FLUXO</button>
                            <div style="display:flex; gap:8px;">
                                <button id="v-leads-pausar" style="flex:1; border:none; padding:8px; border-radius:6px; font-weight:bold; cursor:pointer; color:#000; background:#ffaa00; font-size:10px;">⏸️ PAUSAR</button>
                                <button id="v-leads-parar" style="flex:1; border:none; padding:8px; border-radius:6px; font-weight:bold; cursor:pointer; color:#fff; background:#cc0000; font-size:10px;">⏹️ PARAR</button>
                            </div>
                            <div id="v-status-msg" style="margin-top:8px; font-size:9px; text-align:center; color:#00cc44; font-weight:bold; padding:6px; background:#111; border-radius:4px; border:1px solid #222;">Aguardando Comando...</div>
                        </div>
                    </div>
                </div>
            </div>
          </div>
        `;
        if (document.body) document.body.insertAdjacentHTML('beforeend', html);

        setTimeout(() => {
            const checkAgenda = document.getElementById('v-step-10');
            if (checkAgenda && !checkAgenda.dataset.bound) {
                checkAgenda.dataset.bound = 'true';
                checkAgenda.addEventListener('change', (e) => {
                    const box = document.getElementById('v-box-agendamento');
                    if (box) box.style.display = e.target.checked ? 'block' : 'none';
                });
            }
        }, 300);
    }

    setInterval(() => { garantirPainel(); AI.criarPainelAgentes(); }, 1500);

    let isDragging = false, dragX, dragY, panelLeft, panelTop;
    document.addEventListener('mousedown', (e) => {
        const panel = document.getElementById('v-leads-panel');
        if (panel && panel.contains(e.target) && !['v-btn-minimizar', 'v-btn-ocultar'].includes(e.target.id)) {
            const tag = e.target.tagName;
            if (['INPUT', 'SELECT', 'BUTTON', 'LABEL', 'OPTION', 'TEXTAREA'].includes(tag)) return;
            isDragging = true; 
            const rect = panel.getBoundingClientRect();
            dragX = e.clientX; dragY = e.clientY; panelLeft = rect.left; panelTop = rect.top;
            panel.style.right = 'auto'; panel.style.bottom = 'auto'; panel.style.left = panelLeft + 'px'; panel.style.top = panelTop + 'px';
        }
    });
    document.addEventListener('mousemove', (e) => { if (isDragging) { const p = document.getElementById('v-leads-panel'); p.style.left = (panelLeft + e.clientX - dragX) + 'px'; p.style.top = (panelTop + e.clientY - dragY) + 'px'; } });
    document.addEventListener('mouseup', () => { isDragging = false; });

    document.addEventListener('click', (e) => {
        if (e.target.id === 'v-btn-add-template') {
            const novo = prompt("Digite o NOME EXATO do novo template (como está no sistema):");
            if (novo && novo.trim() !== "") {
                const select = document.getElementById('v-target-template');
                const opt = document.createElement('option');
                opt.value = novo.trim();
                opt.text = novo.trim();
                select.appendChild(opt);
                select.value = novo.trim();
                Logger.human(`Memorizei o novo template: ${novo.trim()}`);
            }
        }
        if (e.target.id === 'v-btn-ocultar') { 
            const panel = document.getElementById('v-leads-panel'); 
            if (panel) panel.style.display = 'none'; 
        }
        if (e.target.id === 'v-btn-minimizar') { 
            painelMinimizado = true; 
            document.getElementById('v-leads-full').style.display = 'none'; 
            document.getElementById('v-leads-mini').style.display = 'flex'; 
            const panel = document.getElementById('v-leads-panel');
            panel.style.background = 'transparent'; panel.style.border = 'none'; panel.style.boxShadow = 'none';
        }
        if (e.target.closest('#v-leads-mini')) { 
            painelMinimizado = false; 
            document.getElementById('v-leads-mini').style.display = 'none'; 
            document.getElementById('v-leads-full').style.display = 'block'; 
            const panel = document.getElementById('v-leads-panel');
            panel.style.background = '#000'; panel.style.border = '2px solid #ff6600'; panel.style.boxShadow = '0 15px 35px rgba(0,0,0,0.9)';
        }
        if (e.target.id === 'v-leads-iniciar') {
            if (estadoRobo !== 'RODANDO') {
                estadoRobo = 'RODANDO'; Stats.iniciar(); Logger.limpar();
                Logger.human('Assumindo os controles... Agentes ativados!');
                AI.atualizarIndicador(true); atualizarEstadoVisual();
                Watchdog.iniciar(async (passo, tempoInativo) => {
                    Logger.warn(`Watchdog: Travamento detectado em "${passo}" (${tempoInativo}s). Tentando recuperar...`);
                    const recuperou = await Recovery.tentarRecuperar();
                    if (!recuperou) Logger.error('Watchdog: Recuperação falhou. Considere reiniciar o fluxo.');
                });
                loopPrincipal();
            }
        }
        if (e.target.id === 'v-leads-pausar') { estadoRobo = 'PAUSADO'; atualizarStatus("⏸️ Pausado", "#ffaa00"); Logger.human('Pausa solicitada. Parando assim que possível.'); atualizarEstadoVisual(); }
        if (e.target.id === 'v-leads-parar') { estadoRobo = 'PARADO'; atualizarStatus("⏹️ Parado", "#ff3333"); Watchdog.parar(); AI.atualizarIndicador(false); Logger.human('Fluxo interrompido.'); atualizarEstadoVisual(); }
    });

    const atualizarStatus = (msg, cor) => { const box = document.getElementById('v-status-msg'); if (box) { box.innerText = msg; box.style.color = cor; } };
    const isAtivo = (n) => document.getElementById(`v-step-${n}`)?.checked;
    const getWait = (passo, defaultMs) => { const el = document.getElementById(`v-time-${passo}`); return el ? parseFloat(el.value) * 1000 : defaultMs; };
    const simularClique = (el) => { if(!el) return false; el.click(); return true; };

    const simularCliqueFirme = async (el) => {
        if (!el) return false;
        el.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, view: window }));
        await new Promise(r => setTimeout(r, 200)); 
        el.dispatchEvent(new MouseEvent('mouseup', { bubbles: true, view: window }));
        el.click();
        return true;
    };

    const safeWait = async (ms) => {
        const msVariado = Human.variacaoTempo(ms); // Variação de tempo do agente humano
        for (let i = 0; i < msVariado / 100; i++) {
            if (estadoRobo === 'PARADO') throw new Error("STOP");
            while (estadoRobo === 'PAUSADO') { await new Promise(r => setTimeout(r, 500)); }
            await new Promise(r => setTimeout(r, 100));
        }
    };

    // FUNÇÃO MELHORADA: Extrai exatamente a primeira palavra da grid do cliente 
    function descobrirNomeCliente(abaAlvo) {
        let nome = "";
        try {
            // 1. Busca precisa na tabela/grid principal da tela (procura pelo rótulo exato "Nome" igual sua foto)
            const elementosTexto = Array.from(document.querySelectorAll('div, span, td, th, p, strong, label'));
            for (let i = 0; i < elementosTexto.length; i++) {
                const txt = (elementosTexto[i].innerText || '').trim();
                if (txt === 'Nome' || txt === 'NOME:') {
                    // Pega o elemento vizinho, que é onde o nome real fica
                    let proximo = elementosTexto[i].nextElementSibling || elementosTexto[i+1];
                    if (proximo && proximo.innerText) {
                        // Corta pelo primeiro espaço, pegando SÓ o primeiro nome
                        nome = proximo.innerText.trim().split(/\s+/)[0]; 
                        break;
                    }
                }
            }

            // 2. Fallback caso a grid demore a carregar, pega o nome no elemento clicado (lista ou aba)
            if (!nome || nome.length < 2) {
                if (abaAlvo && abaAlvo.innerText) {
                    nome = abaAlvo.innerText.replace(/×|x/gi, '').trim().split(/[\/\s\n-]/)[0];
                }
            }
        } catch(e) {}

        // Limpa pra deixar apenas letras e padroniza a primeira letra maiúscula (ex: lAura -> Laura)
        nome = nome.replace(/[^a-zA-ZáàâãéèêíïóôõöúçÁÀÂÃÉÈÊÍÏÓÔÕÖÚÇ]/g, "");
        if (nome && nome.length >= 2) {
            return nome.charAt(0).toUpperCase() + nome.slice(1).toLowerCase();
        }
        return "Cliente"; // Caso de emergência extrema
    }

    function descobrirUnidadeAutomatica() {
        try {
            const tagsFortes = Array.from(document.querySelectorAll('strong, b, div, span, td'));
            let linhaDealer = tagsFortes.find(el => el.innerText && el.innerText.trim().toUpperCase() === 'DEALER')?.closest('tr, .row, .q-item');
            if (linhaDealer) {
                let limpo = linhaDealer.innerText.replace(/DEALER/ig, '').replace(/:/g, '').trim();
                let unidade = limpo.includes('-') ? limpo.split('-').pop().trim() : limpo;
                return unidade.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
            }
        } catch(e) {}
        return "Concessionária";
    }

    function descobrirNomeVendedor() {
        let vendedor = "";
        try {
            const labels = Array.from(document.querySelectorAll('.col-label'));
            let labelEncontrada = labels.find(el => {
                let txt = el.innerText ? el.innerText.trim().toUpperCase() : "";
                return txt === 'VENDEDOR' || txt === 'CONSULTOR' || txt === 'RESPONSÁVEL';
            });

            if (labelEncontrada && labelEncontrada.parentElement) {
                let dataElement = labelEncontrada.parentElement.querySelector('.col-data');
                if (dataElement) { vendedor = dataElement.innerText.trim(); }
            }

            if (!vendedor || vendedor.length < 2) {
                const elementosTexto = Array.from(document.querySelectorAll('strong, b, div, span, td, p'));
                for (let i = 0; i < elementosTexto.length; i++) {
                    let texto = elementosTexto[i].innerText ? elementosTexto[i].innerText.trim().toUpperCase() : "";
                    if (texto === 'VENDEDOR' || texto === 'CONSULTOR') {
                        let prox = elementosTexto[i+1];
                        if (prox && prox.innerText && !prox.innerText.toUpperCase().includes('VENDEDOR')) {
                            vendedor = prox.innerText.split(/[\/\n-]/)[0].trim(); 
                            break;
                        }
                    }
                }
            }
        } catch(e) {}

        vendedor = vendedor.replace(/[^a-zA-ZáàâãéèêíïóôõöúçÁÀÂÃÉÈÊÍÏÓÔÕÖÚÇ\s]/g, "").trim();
        if (vendedor && vendedor.length >= 2) {
            let partes = vendedor.split(/\s+/);
            if (partes.length > 0 && partes[0].toUpperCase() !== 'VENDEDOR') {
                return partes[0].charAt(0).toUpperCase() + partes[0].slice(1).toLowerCase();
            }
        }
        return "";
    }

    async function executarFluxoZap() {
        try {
            if (!Analyzer.paginaValida()) { Logger.error('Analyzer: Página inválida! Não está no duleads.'); estadoRobo = 'PARADO'; atualizarEstadoVisual(); return; }

            Stats.registrarProcessado();
            Watchdog.alimentar('leitura_abas');
            atualizarStatus("🔍 Buscando próximo Lead...", "#00cc44");
            
            const modoExecucao = document.getElementById('v-modo-execucao').value;
            let leadAlvo = null;

            if (modoExecucao === 'abas') {
                const abas = Array.from(document.querySelectorAll('.q-tab, [role="tab"]'));
                leadAlvo = abas.find(aba => aba.querySelector('.fa-times, .fas.fa-times') && !aba.hasAttribute('data-v-done'));
            } else {
                // Modo Lateral
                let itens = Array.from(document.querySelectorAll('.q-item--clickable, tr.cursor-pointer, .q-table tbody tr, .card-lead'));
                let itensLista = itens.filter(i => !i.closest('.q-header') && !i.closest('.q-menu') && !i.closest('.q-tab'));
                leadAlvo = itensLista.find(item => !item.hasAttribute('data-v-done'));

                // NOVA INTELIGÊNCIA: Se não achar nenhum lead, procura o botão "Carregar mais"
                if (!leadAlvo) {
                    const btnCarregar = Array.from(document.querySelectorAll('button, div.cursor-pointer, a.cursor-pointer')).find(b => {
                        const txt = (b.innerText || '').toLowerCase();
                        return txt.includes('carregar mais') || txt.includes('mostrar mais') || txt.includes('load more') || txt.includes('ver mais');
                    });

                    if (btnCarregar && Finder.estaVisivel(btnCarregar)) {
                        Logger.agent('Fim da lista atual! Encontrei o botão "Carregar mais". Clicando para descer...');
                        atualizarStatus("⬇️ Carregando mais leads...", "#ffaa00");
                        
                        await Human.cliqueNatural(btnCarregar);
                        await safeWait(4000); // Aguarda o sistema carregar os novos clientes
                        
                        // Tenta de novo mapear a lista
                        itens = Array.from(document.querySelectorAll('.q-item--clickable, tr.cursor-pointer, .q-table tbody tr, .card-lead'));
                        itensLista = itens.filter(i => !i.closest('.q-header') && !i.closest('.q-menu') && !i.closest('.q-tab'));
                        leadAlvo = itensLista.find(item => !item.hasAttribute('data-v-done'));
                    }
                }
            }
            
            if (!leadAlvo) {
                atualizarStatus("✅ Todos os leads concluídos!", "#ff6600");
                Logger.success('Fila concluída ou não há mais botões para carregar. Trabalho finalizado!');
                estadoRobo = 'PARADO'; Watchdog.parar(); AI.atualizarIndicador(false); atualizarEstadoVisual();
                return;
            }

            // O Human clique (agents.js) já vai dar scroll na lista para o robô alcançar o cliente visualmente
            await Human.cliqueNatural(leadAlvo);
            await safeWait(3500); // Aguarda a tela central do cliente carregar

            let temWhatsApp = true; 

            // PASSO 1: Abrir WhatsApp
            if (isAtivo(1)) {
                const sucesso = await Retry.executarComRetry(async () => {
                    Watchdog.alimentar('passo_1_whatsapp');
                    atualizarStatus("1. Abrindo Zap...", "#00cc44");
                    const btnZap = await Finder.buscarComFallback([
                        () => { const btns = Array.from(document.querySelectorAll('button, .q-btn')).filter(b => b.querySelector('.fa-whatsapp, .fab.fa-whatsapp')); return btns[btns.length - 1]; },
                        () => document.querySelector('[class*="whatsapp"]'),
                        () => Array.from(document.querySelectorAll('button')).find(b => b.textContent.toLowerCase().includes('whatsapp'))
                    ], 6000);
                    if (btnZap) {
                        await Human.cliqueNatural(btnZap);
                        await safeWait(getWait(1, 5000));
                        if (document.body.innerText.includes('whatsapp ativo')) { temWhatsApp = false; Logger.warn('Passo 1: WhatsApp não ativo.'); }
                        return true;
                    }
                    return false;
                }, 'Abrir WhatsApp', 3);
                if (!sucesso) Logger.warn('Passo 1: Pulando - não foi possível abrir WhatsApp.');
            }

            if (temWhatsApp) {
                // PASSO 2: Clicar no Clipe
                if (isAtivo(2)) {
                    await Retry.executarComRetry(async () => {
                        Watchdog.alimentar('passo_2_clipe');
                        const clipe = await Finder.aguardarElemento(() => document.querySelector('.fa-paperclip'), 5000);
                        if (clipe) { await Human.cliqueNatural(clipe.closest('button') || clipe); await safeWait(getWait(2, 3000)); return true; }
                        return false;
                    }, 'Clicar Clipe', 2);
                }

                // PASSO 3: Abrir Template
                if (isAtivo(3)) {
                    await Retry.executarComRetry(async () => {
                        Watchdog.alimentar('passo_3_template');
                        const btnTemp = await Finder.aguardarElemento(() => document.querySelector('.fa-file-alt'), 5000);
                        if (btnTemp) { await Human.cliqueNatural(btnTemp.closest('button') || btnTemp); await safeWait(getWait(3, 4000)); return true; }
                        return false;
                    }, 'Abrir Template', 2);
                }

                // PASSO 4: Abrir Lista
                if (isAtivo(4)) {
                    await Retry.executarComRetry(async () => {
                        Watchdog.alimentar('passo_4_lista');
                        const modal = await Finder.aguardarElemento(() => document.querySelector('.q-dialog'), 5000);
                        if (modal) {
                            const seta = modal.querySelector('.fa-caret-down');
                            if (seta) { await Human.cliqueNatural(seta.closest('.q-field') || seta); await safeWait(getWait(4, 3000)); return true; }
                        }
                        return false;
                    }, 'Abrir Lista', 2);
                }

                // PASSO 5: Selecionar na Lista
                if (isAtivo(5)) {
                    await Retry.executarComRetry(async () => {
                        Watchdog.alimentar('passo_5_selecionar');
                        atualizarStatus("5. Selecionando Template...", "#00cc44");
                        const txtBruto = document.getElementById('v-target-template').value.toUpperCase().trim();
                        const menu = await Finder.aguardarElemento(() => document.querySelector('.q-menu'), 5000);
                        if (!menu) return false;

                        const itemsMenu = Array.from(document.querySelectorAll('.q-menu .q-item'));
                        let item = itemsMenu.find(i => i.innerText.toUpperCase().includes(txtBruto.split(' ')[0]));

                        if (!item && (txtBruto.includes('LIVRE02') || txtBruto.includes('LIVRE1'))) {
                            item = itemsMenu.find(i => i.innerText.toUpperCase().includes('LIVRE02')) || itemsMenu.find(i => i.innerText.toUpperCase().includes('LIVRE1'));
                        }

                        if (item) { await Human.cliqueNatural(item); await safeWait(getWait(5, 5000)); return true; }
                        return false;
                    }, 'Selecionar Template', 3);
                }

                // PASSO 6: Preencher Dinâmico
                if (isAtivo(6)) {
                    await Retry.executarComRetry(async () => {
                        Watchdog.alimentar('passo_6_dinamico');
                        atualizarStatus("6. Preenchendo Dinâmico...", "#00cc44");
                        const modal = await Finder.aguardarElemento(() => document.querySelector('.q-dialog'), 5000);
                        if (modal) {
                            // A tela do cliente já está aberta, a função extrai exatamente o nome fatiado
                            let nomeCliente = descobrirNomeCliente(leadAlvo);
                            let nomeVendedor = descobrirNomeVendedor(); 
                            
                            Logger.human(`Nome que li na tela: "${nomeCliente}"`);
                            
                            const inputs = Array.from(modal.querySelectorAll('input.q-field__native')).filter(inp => !inp.closest('.q-select') && !inp.readOnly);
                            let tempo = getWait(6, 1500);

                            // O Agente Humano cuida da digitação natural (Parâmetro 1, 2 e 3)
                            if (inputs.length >= 1) { await Human.digitarNatural(inputs[0], nomeCliente, () => estadoRobo === 'PARADO'); await safeWait(tempo); }
                            if (inputs.length >= 2) { await Human.digitarNatural(inputs[1], "Vanessa", () => estadoRobo === 'PARADO'); await safeWait(tempo); }
                            if (inputs.length >= 3) {
                                let msgParam3 = document.getElementById('v-texto-param3').value;
                                await Human.digitarNatural(inputs[2], msgParam3, () => estadoRobo === 'PARADO'); await safeWait(tempo);
                            }
                            return true;
                        }
                        return false;
                    }, 'Preencher Dinâmico', 2);
                }

                // PASSO 7: Enviar WhatsApp
                if (isAtivo(7)) {
                    await Retry.executarComRetry(async () => {
                        Watchdog.alimentar('passo_7_enviar');
                        const btnS = await Finder.aguardarElemento(
                            () => Array.from(document.querySelectorAll('.q-dialog button')).find(b => b.innerText.includes('ENVIAR')),
                            6000
                        );
                        if (btnS) { 
                            await Human.cliqueNatural(btnS); 
                            await safeWait(getWait(7, 5000)); 
                            
                            // Agente Visão tenta verificar se a mensagem foi para o chat
                            const msgTexto = document.getElementById('v-texto-param3').value;
                            await Vision.confirmarMensagemNaTela(msgTexto, 5000); 
                            return true; 
                        }
                        return false;
                    }, 'Enviar WhatsApp', 3);
                }

                // PASSO 8: Fechar Aba Zap
                if (isAtivo(8)) {
                    await Retry.executarComRetry(async () => {
                        Watchdog.alimentar('passo_8_fechar_zap');
                        const btnFecharZap = await Finder.buscarComFallback([
                            () => { const iconesX = Array.from(document.querySelectorAll('.fa-times')); return iconesX.find(i => i.closest('.q-toolbar')); },
                            () => document.querySelector('.q-toolbar .fa-times'),
                            () => document.querySelector('.q-toolbar button')
                        ], 4000);
                        if (btnFecharZap) { await Human.cliqueNatural(btnFecharZap.closest('button') || btnFecharZap); await safeWait(getWait(8, 3000)); return true; }
                        return false;
                    }, 'Fechar Aba Zap', 2);
                }

                // PASSO 9: Salvar Comentário
                if (isAtivo(9)) {
                    await Retry.executarComRetry(async () => {
                        Watchdog.alimentar('passo_9_comentario');
                        atualizarStatus("9. Salvando Comentário...", "#00ffcc");
                        const fab = document.querySelector('.fa-ellipsis-v');
                        if (fab) { await simularCliqueFirme(fab.closest('button') || fab); await safeWait(2000); }
                        
                        let coment = await Finder.aguardarElemento(() => document.querySelector('.fa-comment-dots.text-white') || Array.from(document.querySelectorAll('.fa-comment-dots')).pop(), 5000);
                        if (coment) {
                            await simularCliqueFirme(coment.closest('button, .q-btn') || coment); await safeWait(3000);
                            const campo = await Finder.aguardarElemento(() => document.querySelector('.q-dialog textarea') || document.querySelector('textarea'), 5000);
                            if (campo) {
                                await Human.digitarNatural(campo, document.getElementById('v-texto-comentario').value, () => estadoRobo === 'PARADO');
                                const modalComentario = document.querySelector('.q-dialog');
                                let btnOk = modalComentario ? Array.from(modalComentario.querySelectorAll('button')).find(b => b.innerText.trim() === 'OK' || b.innerText.trim() === 'SALVAR') : Array.from(document.querySelectorAll('button')).find(b => b.innerText.trim() === 'OK' || b.innerText.trim() === 'SALVAR');
                                if (btnOk) { await simularCliqueFirme(btnOk); await safeWait(getWait(9, 3000)); await safeWait(2000); return true; }
                            }
                        }
                        return false;
                    }, 'Salvar Comentário', 3);
                }

                // PASSO 10: AGENDAMENTO
                if (isAtivo(10)) {
                    await Retry.executarComRetry(async () => {
                        Watchdog.alimentar('passo_10_agendamento');
                        atualizarStatus("10. Criando Agendamento...", "#e0b0ff");
                        const fab = document.querySelector('.fa-ellipsis-v');
                        if (fab) { await simularCliqueFirme(fab.closest('button') || fab); await safeWait(2000); }

                        const tipoAgenda = document.getElementById('v-tipo-agendamento').value;
                        let btnAgenda = tipoAgenda === 'lembrete' ? 
                            await Finder.buscarComFallback([() => document.querySelector('a.bg-purple, button.bg-purple'), () => Array.from(document.querySelectorAll('.fa-clock')).pop()], 4000) : 
                            await Finder.buscarComFallback([() => document.querySelector('a.bg-deep-purple, button.bg-deep-purple'), () => Array.from(document.querySelectorAll('.fa-calendar, .fa-calendar-alt')).pop()], 4000);

                        if (btnAgenda) {
                            await simularCliqueFirme(btnAgenda.closest('button, a, .q-btn') || btnAgenda);
                            await safeWait(3000); 

                            const modalAgenda = await Finder.aguardarElemento(() => document.querySelector('.q-dialog'), 5000);
                            if (modalAgenda) {
                                const valDataBruta = document.getElementById('v-data-agenda').value;
                                const valTexto = document.getElementById('v-texto-agenda').value;

                                if (valDataBruta) {
                                    const dPartes = valDataBruta.split('-');
                                    const alvoAno = parseInt(dPartes[0]);
                                    const alvoMes = parseInt(dPartes[1]) - 1;
                                    const alvoDia = parseInt(dPartes[2]);

                                    const spansModal = Array.from(modalAgenda.querySelectorAll('span'));
                                    const spanData = spansModal.find(s => /\d{2}\/\d{2}\/\d{4}/.test(s.textContent || s.innerText));
                                    
                                    if (spanData) {
                                        const btnDataClicavel = spanData.closest('button') || spanData.closest('.cursor-pointer') || spanData;
                                        simularClique(btnDataClicavel); await safeWait(2000);

                                        const mesesRef = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
                                        let tentativas = 24; 

                                        while (tentativas-- > 0) {
                                            if (estadoRobo === 'PARADO') throw new Error("STOP");
                                            const menusAtivos = document.querySelectorAll('.q-menu');
                                            const menuCal = menusAtivos[menusAtivos.length - 1];
                                            if (!menuCal) { await safeWait(500); continue; }

                                            const spansCal = Array.from(menuCal.querySelectorAll('span'));
                                            const mesTelaElem = spansCal.find(el => mesesRef.includes((el.textContent||'').trim()));
                                            const anoTelaElem = spansCal.find(el => /^20\d{2}$/.test((el.textContent||'').trim()));
                                            if (!mesTelaElem || !anoTelaElem) { await safeWait(500); continue; }

                                            const mesIdx = mesesRef.indexOf(mesTelaElem.textContent.trim());
                                            const anoTela = parseInt(anoTelaElem.textContent.trim());

                                            if (anoTela < alvoAno || (anoTela === alvoAno && mesIdx < alvoMes)) {
                                                const setaIcone = menuCal.querySelector('i.fa-chevron-right');
                                                if (setaIcone) { simularClique(setaIcone.closest('button') || setaIcone); await safeWait(800); } else break;
                                            } else if (anoTela > alvoAno || (anoTela === alvoAno && mesIdx > alvoMes)) {
                                                const setaIcone = menuCal.querySelector('i.fa-chevron-left');
                                                if (setaIcone) { simularClique(setaIcone.closest('button') || setaIcone); await safeWait(800); } else break;
                                            } else { break; }
                                        }

                                        await safeWait(1000);
                                        const menusCalFinal = document.querySelectorAll('.q-menu');
                                        const calFinal = menusCalFinal[menusCalFinal.length - 1];
                                        if (calFinal) {
                                            const botoesDia = Array.from(calFinal.querySelectorAll('.q-date__calendar-item button, .q-date__calendar-days button'));
                                            const btnDia = botoesDia.find(b => (b.textContent||'').trim() === alvoDia.toString());
                                            if(btnDia) { simularClique(btnDia); await safeWait(1000); }
                                            const btnOkData = Array.from(calFinal.querySelectorAll('button')).find(b => { const txt = (b.textContent||'').trim().toUpperCase(); return txt === 'OK' || txt === 'FECHAR'; });
                                            if (btnOkData) simularClique(btnOkData);
                                        }
                                        await safeWait(1500);
                                    }
                                }

                                const textareas = Array.from(modalAgenda.querySelectorAll('textarea'));
                                if (textareas.length >= 1 && valTexto) { 
                                    const textareaObs = textareas[0];
                                    simularClique(textareaObs); await safeWait(500);
                                    const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, "value").set;
                                    nativeInputValueSetter.call(textareaObs, valTexto);
                                    textareaObs.dispatchEvent(new Event('input', { bubbles: true })); textareaObs.dispatchEvent(new Event('change', { bubbles: true }));
                                    await safeWait(1000); 
                                }

                                let btnOkAgenda = Array.from(modalAgenda.querySelectorAll('button')).find(b => b.innerText.trim().toUpperCase() === 'OK' || b.innerText.trim().toUpperCase() === 'SALVAR');
                                if (btnOkAgenda) { await simularCliqueFirme(btnOkAgenda); await safeWait(getWait(10, 3000)); }
                                return true;
                            }
                        }
                        return false;
                    }, 'Agendamento', 2);
                }

                // PASSO 11: Check Final
                if (isAtivo(11)) {
                    await Retry.executarComRetry(async () => {
                        Watchdog.alimentar('passo_11_check');
                        atualizarStatus("11. Verificando Check...", "#00ffcc");
                        const btnCheck = Array.from(document.querySelectorAll('button')).find(b => b.querySelector('.fa-check'));
                        if (btnCheck) {
                            simularClique(btnCheck); await safeWait(2000);
                            const spanOk = Array.from(document.querySelectorAll('span.block')).find(s => s.innerText.trim().toLowerCase() === 'ok');
                            if (spanOk) { simularClique(spanOk.closest('button')); await safeWait(getWait(11, 3000)); }
                            return true;
                        }
                        return false;
                    }, 'Check Final', 2);
                }
            }

            // PASSO 12: Fechar Cliente
            if (isAtivo(12)) {
                await Retry.executarComRetry(async () => {
                    Watchdog.alimentar('passo_12_fechar');
                    atualizarStatus("12. Fechando Aba...", "#ff99cc");
                    const btnFecharAba = leadAlvo.querySelector('.fas.fa-times, .fa-times');
                    if (btnFecharAba) { await Human.cliqueNatural(btnFecharAba.closest('div, button, .q-tab') || btnFecharAba); await safeWait(getWait(12, 5000)); return true; }
                    return false;
                }, 'Fechar Cliente', 2);
            } else { 
                leadAlvo.setAttribute('data-v-done', 'true'); 
                if (modoExecucao === 'abas') leadAlvo.style.borderBottom = "4px solid #ff3333";
                else leadAlvo.style.borderLeft = "4px solid #ff3333";
            }

            Stats.registrarSucesso();
            atualizarStatus("✅ Cliente Concluído!", "#00ffcc");
            Logger.success('✅ Cliente concluído com sucesso!');
            await safeWait(2500); 

        } catch (e) {
            if (e.message === "STOP") {
                atualizarStatus("⏹️ Parado.", "#ff3333");
            } else {
                Stats.registrarErro();
                Logger.error(`Erro no fluxo: ${e.message}`);
                atualizarStatus(`Erro: ${e.message}`, "#ff3333");
                
                const recuperou = await Recovery.tentarRecuperar();
                if (recuperou) {
                    Logger.success('Recuperação bem-sucedida. Pulando cliente com erro e continuando...');
                    const modoExecucao = document.getElementById('v-modo-execucao').value;
                    let leadAtual = null;
                    if (modoExecucao === 'abas') {
                        const abas = Array.from(document.querySelectorAll('.q-tab, [role="tab"]'));
                        leadAtual = abas.find(aba => aba.querySelector('.fa-times, .fas.fa-times') && !aba.hasAttribute('data-v-done'));
                    } else {
                        const itens = Array.from(document.querySelectorAll('.q-item--clickable, tr.cursor-pointer, .card-lead'));
                        const itensLista = itens.filter(i => !i.closest('.q-header') && !i.closest('.q-menu') && !i.closest('.q-tab'));
                        leadAtual = itensLista.find(item => !item.hasAttribute('data-v-done'));
                    }
                    if (leadAtual) {
                        leadAtual.setAttribute('data-v-done', 'true');
                        if (modoExecucao === 'abas') leadAtual.style.borderBottom = "4px solid #ff3333";
                        else leadAtual.style.borderLeft = "4px solid #ff3333";
                    }
                    return; 
                }
            }
            estadoRobo = 'PARADO';
            Watchdog.parar();
            AI.atualizarIndicador(false);
        }
    }

    async function loopPrincipal() {
        if (loopRodando) return;
        loopRodando = true;
        while (estadoRobo === 'RODANDO' || estadoRobo === 'PAUSADO') {
            if (estadoRobo === 'RODANDO') {
                const analise = Analyzer.detectarTravamento();
                if (analise.travado) {
                    Logger.warn(`Analyzer: Estado travado detectado antes do fluxo: ${analise.problemas.join(', ')}`);
                    await Recovery.tentarRecuperar();
                    await new Promise(r => setTimeout(r, 2000));
                }
                await executarFluxoZap();
            }
            await new Promise(r => setTimeout(r, 1000));
        }
        loopRodando = false;
        Stats.renderizar();
    }

    chrome.runtime.onMessage.addListener((msg) => {
        function iniciarRobo(origem) {
            garantirPainel();
            if (estadoRobo !== 'RODANDO') {
                estadoRobo = 'RODANDO';
                Stats.iniciar();
                Logger.limpar();
                Logger.human(`Vamos lá! Sistema iniciado via ${origem}`);
                AI.atualizarIndicador(true);
                atualizarEstadoVisual();
                Watchdog.iniciar(async (passo, tempoInativo) => {
                    Logger.warn(`Watchdog: Travamento em "${passo}" (${tempoInativo}s). Tentando recuperar...`);
                    await Recovery.tentarRecuperar();
                });
                loopPrincipal();
            }
        }

        if (msg.acao === 'ligar') { iniciarRobo('popup (ligar)'); atualizarStatus('🟢 Robô Ligado', '#00ff44'); } 
        else if (msg.acao === 'desligar') { estadoRobo = 'PARADO'; atualizarStatus('🔴 Robô Desligado', '#ff3333'); Watchdog.parar(); AI.atualizarIndicador(false); atualizarEstadoVisual(); } 
        else if (msg.acao === 'iniciar') { iniciarRobo('popup (iniciar)'); } 
        else if (msg.acao === 'pausar') { estadoRobo = 'PAUSADO'; atualizarStatus('⏸️ Pausado', '#ffaa00'); atualizarEstadoVisual(); } 
        else if (msg.acao === 'parar') { estadoRobo = 'PARADO'; atualizarStatus('⏹️ Parado', '#ff3333'); Watchdog.parar(); AI.atualizarIndicador(false); atualizarEstadoVisual(); }
    });
})();