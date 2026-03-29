(() => {
    if (window.__vanessaLeadsV59Init) return;
    window.__vanessaLeadsV59Init = true;

    // Referência aos Agentes Inteligentes
    const AI = window.AgentesInteligentes;
    const { Logger, Stats, Finder, Analyzer, Recovery, Watchdog, Retry } = AI;

    let estadoRobo = 'PARADO'; 
    let loopRodando = false;
    let painelMinimizado = false; 

    function garantirPainel() {
        if (document.getElementById('v-leads-panel')) {
            const btnIniciar = document.getElementById('v-leads-iniciar');
            if (btnIniciar) btnIniciar.innerText = estadoRobo === 'PAUSADO' ? "▶️ CONTINUAR" : "▶️ INICIAR FLUXO";
            
            // LÓGICA DE TROCA AUTOMÁTICA DO TEXTO DO COMENTÁRIO
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
          <div id="v-leads-panel" style="position:fixed; top:40px; left:20px; width:${painelMinimizado ? '50px' : '560px'}; background:${painelMinimizado ? 'transparent' : '#000'}; border:${painelMinimizado ? 'none' : '2px solid #ff007f'}; border-radius:10px; z-index:9999999; font-family:'Segoe UI',sans-serif; box-shadow:0 15px 35px rgba(0,0,0,0.9); transition: width 0.3s; cursor: move; display: block;">
            
            <div id="v-leads-mini" style="display:${painelMinimizado ? 'flex' : 'none'}; justify-content:center; align-items:center; width:50px; height:50px; background:linear-gradient(135deg, #4b0082, #ff007f); border-radius:50%; cursor:pointer; border:2px solid #fff;">
                <span style="font-size:24px; pointer-events:none;">🤖</span>
            </div>
            
            <div id="v-leads-full" style="display:${painelMinimizado ? 'none' : 'block'};">
                <div id="v-leads-header" style="background:linear-gradient(135deg, #000, #4b0082, #ff007f); padding:10px; text-align:center; border-bottom:1px solid #ff007f; border-radius:8px 8px 0 0; position:relative; user-select:none;">
                    <h2 style="font-size:11px; text-transform:uppercase; letter-spacing:1px; margin:0; color:#fff; font-weight:900; pointer-events:none;">PROSPECÇÃO MARATONA 💬</h2>
                    <div style="position:absolute; right:12px; top:8px; display:flex; gap:12px; align-items:center;">
                        <div id="v-btn-ocultar" title="Ocultar Painel (Alt+Z)" style="cursor:pointer; color:#fff; font-size:16px;">👁️</div>
                        <div id="v-btn-minimizar" title="Minimizar para o ícone" style="cursor:pointer; color:#fff; font-size:16px; font-weight:bold; margin-top:-6px;">_</div>
                    </div>
                </div>
                
                <div style="padding:10px; background:#111; display:flex; gap:10px; border-radius:0 0 10px 10px; max-height: 85vh; overflow-y: auto;">
                    <div style="flex:1.2; background:#000; border:1px solid #333; padding:10px; border-radius:8px; cursor: default;">
                        <div style="display:flex; justify-content:space-between; margin-bottom:8px;">
                            <p style="font-size:9px; color:#ff99cc; font-weight:bold; margin:0; text-transform:uppercase; cursor: move;">Ações do Robô:</p>
                            <p style="font-size:8px; color:#aaa; font-weight:bold; margin:0; text-transform:uppercase;">Espera (seg)</p>
                        </div>
                        <div style="display:flex; flex-direction:column; gap:6px;">
                            <div style="display:flex; justify-content:space-between; align-items:center;"><label style="font-size:10px; color:#fff; cursor:pointer;"><input type="checkbox" id="v-step-1" checked> 1. Abrir WhatsApp</label><input type="number" id="v-time-1" value="5.0" step="0.5" style="width:45px; background:#111; color:#00ffcc; border:1px solid #333; border-radius:3px; font-size:10px; text-align:center;"></div>
                            <div style="display:flex; justify-content:space-between; align-items:center;"><label style="font-size:10px; color:#fff; cursor:pointer;"><input type="checkbox" id="v-step-2" checked> 2. Clicar no Clipe 📎</label><input type="number" id="v-time-2" value="3.0" step="0.5" style="width:45px; background:#111; color:#00ffcc; border:1px solid #333; border-radius:3px; font-size:10px; text-align:center;"></div>
                            <div style="display:flex; justify-content:space-between; align-items:center;"><label style="font-size:10px; color:#fff; cursor:pointer;"><input type="checkbox" id="v-step-3" checked> 3. Abrir Template 📄</label><input type="number" id="v-time-3" value="4.0" step="0.5" style="width:45px; background:#111; color:#00ffcc; border:1px solid #333; border-radius:3px; font-size:10px; text-align:center;"></div>
                            <div style="display:flex; justify-content:space-between; align-items:center;"><label style="font-size:10px; color:#fff; cursor:pointer;"><input type="checkbox" id="v-step-4" checked> 4. Abrir Lista ▼</label><input type="number" id="v-time-4" value="3.0" step="0.5" style="width:45px; background:#111; color:#00ffcc; border:1px solid #333; border-radius:3px; font-size:10px; text-align:center;"></div>
                            <div style="display:flex; justify-content:space-between; align-items:center;"><label style="font-size:10px; color:#fff; cursor:pointer;"><input type="checkbox" id="v-step-5" checked> 5. Selecionar na Lista ✅</label><input type="number" id="v-time-5" value="5.0" step="0.5" style="width:45px; background:#111; color:#00ffcc; border:1px solid #333; border-radius:3px; font-size:10px; text-align:center;"></div>
                            <div style="display:flex; justify-content:space-between; align-items:center;"><label style="font-size:10px; color:#00ffcc; font-weight:bold; cursor:pointer;"><input type="checkbox" id="v-step-6" checked> 6. Preencher Dinâmico</label><input type="number" id="v-time-6" value="1.5" step="0.5" style="width:45px; background:#111; color:#00ffcc; border:1px solid #333; border-radius:3px; font-size:10px; text-align:center;"></div>
                            <div style="display:flex; justify-content:space-between; align-items:center;"><label style="font-size:10px; color:#fff; cursor:pointer;"><input type="checkbox" id="v-step-7" checked> 7. Enviar WhatsApp</label><input type="number" id="v-time-7" value="5.0" step="0.5" style="width:45px; background:#111; color:#00ffcc; border:1px solid #333; border-radius:3px; font-size:10px; text-align:center;"></div>
                            <div style="display:flex; justify-content:space-between; align-items:center;"><label style="font-size:10px; color:#fff; cursor:pointer;"><input type="checkbox" id="v-step-8" checked> 8. Fechar Aba Zap</label><input type="number" id="v-time-8" value="3.0" step="0.5" style="width:45px; background:#111; color:#00ffcc; border:1px solid #333; border-radius:3px; font-size:10px; text-align:center;"></div>
                            <div style="display:flex; justify-content:space-between; align-items:center;"><label style="font-size:10px; color:#00ffcc; font-weight:bold; cursor:pointer;"><input type="checkbox" id="v-step-9" checked> 9. Salvar Comentário</label><input type="number" id="v-time-9" value="3.0" step="0.5" style="width:45px; background:#111; color:#00ffcc; border:1px solid #333; border-radius:3px; font-size:10px; text-align:center;"></div>
                            <div style="display:flex; justify-content:space-between; align-items:center;"><label style="font-size:10px; color:#e0b0ff; font-weight:bold; cursor:pointer;"><input type="checkbox" id="v-step-10"> 10. Agendamento ⏱️</label><input type="number" id="v-time-10" value="4.0" step="0.5" style="width:45px; background:#111; color:#e0b0ff; border:1px solid #333; border-radius:3px; font-size:10px; text-align:center;"></div>
                            <div style="display:flex; justify-content:space-between; align-items:center;"><label style="font-size:10px; color:#fff; cursor:pointer;"><input type="checkbox" id="v-step-11"> 11. Check / OK Final</label><input type="number" id="v-time-11" value="3.0" step="0.5" style="width:45px; background:#111; color:#00ffcc; border:1px solid #333; border-radius:3px; font-size:10px; text-align:center;"></div>
                            <div style="display:flex; justify-content:space-between; align-items:center;"><label style="font-size:10px; color:#00ffcc; font-weight:bold; cursor:pointer;"><input type="checkbox" id="v-step-12" checked> 12. Fechar Cliente 🧹</label><input type="number" id="v-time-12" value="5.0" step="0.5" style="width:45px; background:#111; color:#ff99cc; font-weight:bold; border:1px solid #ff007f; border-radius:3px; font-size:10px; text-align:center;"></div>
                        </div>
                    </div>

                    <div style="flex:1; display:flex; flex-direction:column; gap:8px;">
                        <div style="background:#000; border:1px solid #333; padding:8px; border-radius:8px; cursor: default;">
                            <p style="font-size:9px; color:#00ffcc; font-weight:bold; margin:0 0 6px 0; text-transform:uppercase; cursor: move;">Configuração Zap & Comentário:</p>
                            <label style="font-size:8px; color:#aaa;">TEMPLATE ALVO:</label>
                            <select id="v-target-template" style="width:100%; background:#111; color:#fff; border:1px solid #ff007f; border-radius:4px; padding:4px; font-size:9px; margin-bottom:6px; cursor: pointer;">
                                <option value="mar_maratona (MARKETING)" selected>mar_maratona (MARKETING)</option>
                                <option value="5acompanhamento (MARKETING)">5acompanhamento (MARKETING)</option>
                                <option value="4acompanhamento (MARKETING)">4acompanhamento (MARKETING)</option>
                                <option value="1_vendas_inicial (MARKETING)">1_vendas_inicial (MARKETING)</option>
                                <option value="livre02_inicial (MARKETING)">livre02_inicial (MARKETING)</option>
                                <option value="livre02_sem_retorno (MARKETING)">livre02_sem_retorno (MARKETING)</option>
                                <option value="livre02_acompanhamento (MARKETING)">livre02_acompanhamento (MARKETING)</option>
                                <option value="livre02_resgate (MARKETING)">livre02_resgate (MARKETING)</option>
                            </select>
                            <label style="font-size:8px; color:#00ffcc; font-weight:bold;">TEXTO DO COMENTÁRIO (PASSO 9):</label>
                            <textarea id="v-texto-comentario" style="width:100%; height: 35px; resize:none; background:#111; color:#fff; border:1px solid #00ffcc; border-radius:4px; padding:4px; font-size:9px; cursor: text;">CONVITE DA MARATONA ENVIADO, AGUARDANDO CONFIRMAÇÃO</textarea>
                        </div>

                        <div style="background:#000; border:1px solid #333; padding:8px; border-radius:8px; cursor: default;">
                            <p style="font-size:9px; color:#e0b0ff; font-weight:bold; margin:0 0 6px 0; text-transform:uppercase; cursor: move;">Configuração Agendamento (10):</p>
                            <label style="font-size:8px; color:#aaa;">AÇÃO APÓS MENSAGEM:</label>
                            <select id="v-tipo-agendamento" style="width:100%; background:#111; color:#fff; border:1px solid #e0b0ff; border-radius:4px; padding:4px; font-size:9px; margin-bottom:6px; cursor: pointer;">
                                <option value="lembrete">Lembrete (Ícone Roxo Claro)</option>
                                <option value="agendamento">Agendamento (Ícone Roxo Escuro)</option>
                            </select>
                            <div style="display:flex; gap:4px; margin-bottom:6px;">
                                <input type="date" id="v-data-agenda" title="Selecione a Data" style="flex:1; background:#111; color:#fff; border:1px solid #e0b0ff; border-radius:4px; padding:4px; font-size:9px; cursor: pointer;">
                            </div>
                            <textarea id="v-texto-agenda" placeholder="Motivo do agendamento/lembrete..." style="width:100%; height: 30px; resize:none; background:#111; color:#fff; border:1px solid #e0b0ff; border-radius:4px; padding:4px; font-size:9px;"></textarea>
                        </div>

                        <div style="background:#000; border:1px solid #333; padding:10px; border-radius:8px; cursor: default; display:flex; flex-direction:column; justify-content:center; flex-grow:1;">
                            <button id="v-leads-iniciar" style="width:100%; border:none; padding:10px; border-radius:6px; font-weight:bold; cursor:pointer; color:#fff; background:#ff007f; margin-bottom:8px; font-size:11px;">▶️ INICIAR FLUXO</button>
                            <div style="display:flex; gap:8px;">
                                <button id="v-leads-pausar" style="flex:1; border:none; padding:8px; border-radius:6px; font-weight:bold; cursor:pointer; background:#ffaa00; font-size:10px;">⏸️ PAUSAR</button>
                                <button id="v-leads-parar" style="flex:1; border:none; padding:8px; border-radius:6px; font-weight:bold; cursor:pointer; color:#fff; background:#cc0000; font-size:10px;">⏹️ PARAR</button>
                            </div>
                            <div id="v-status-msg" style="margin-top:8px; font-size:9px; text-align:center; color:#00ffcc; font-weight:bold; padding:6px; background:#111; border-radius:4px; border:1px solid #222;">Aguardando Comando...</div>
                        </div>
                    </div>
                </div>
            </div>
          </div>
        `;
        if (document.body) document.body.insertAdjacentHTML('beforeend', html);
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
        if (e.target.id === 'v-btn-ocultar') { const panel = document.getElementById('v-leads-panel'); if (panel) panel.style.display = 'none'; }
        if (e.target.id === 'v-btn-minimizar') { painelMinimizado = true; document.getElementById('v-leads-full').style.display = 'none'; document.getElementById('v-leads-mini').style.display = 'flex'; }
        if (e.target.id === 'v-leads-mini') { painelMinimizado = false; document.getElementById('v-leads-mini').style.display = 'none'; document.getElementById('v-leads-full').style.display = 'block'; }
        if (e.target.id === 'v-leads-iniciar') {
            if (estadoRobo !== 'RODANDO') {
                estadoRobo = 'RODANDO';
                Stats.iniciar();
                Logger.limpar();
                Logger.agent('Sistema iniciado - Agentes ativados');
                AI.atualizarIndicador(true);
                Watchdog.iniciar(async (passo, tempoInativo) => {
                    Logger.warn(`Watchdog: Travamento detectado em "${passo}" (${tempoInativo}s). Tentando recuperar...`);
                    const recuperou = await Recovery.tentarRecuperar();
                    if (!recuperou) {
                        Logger.error('Watchdog: Recuperação falhou. Considere reiniciar o fluxo.');
                    }
                });
                loopPrincipal();
            }
        }
        if (e.target.id === 'v-leads-pausar') { estadoRobo = 'PAUSADO'; atualizarStatus("⏸️ Pausado", "#ffaa00"); Logger.info('Fluxo pausado pelo usuário'); }
        if (e.target.id === 'v-leads-parar') { estadoRobo = 'PARADO'; atualizarStatus("⏹️ Parado", "#ff3333"); Watchdog.parar(); AI.atualizarIndicador(false); Logger.info('Fluxo parado pelo usuário'); }
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
        for (let i = 0; i < ms / 100; i++) {
            if (estadoRobo === 'PARADO') throw new Error("STOP");
            while (estadoRobo === 'PAUSADO') { await new Promise(r => setTimeout(r, 500)); }
            await new Promise(r => setTimeout(r, 100));
        }
    };

    async function digitarComoHumano(elemento, texto) {
        if (!elemento || !texto) return;
        elemento.focus();
        elemento.value = ''; 
        for (let i = 0; i < texto.length; i++) {
            if (estadoRobo === 'PARADO') throw new Error("STOP");
            elemento.value += texto[i];
            elemento.dispatchEvent(new Event('input', { bubbles: true }));
            await safeWait(40 + Math.random() * 60); 
        }
        elemento.dispatchEvent(new Event('change', { bubbles: true }));
    }

    function descobrirNomeCliente(abaAlvo) {
        let nome = "";
        try {
            if (abaAlvo && abaAlvo.innerText) { nome = abaAlvo.innerText.replace(/×|x/gi, '').trim().split(/[\/\s-]/)[0]; }
            if (!nome || nome.length < 2) {
                const elementosTexto = Array.from(document.querySelectorAll('div, span, td, p'));
                for (let i = 0; i < elementosTexto.length; i++) {
                    if (elementosTexto[i].innerText && elementosTexto[i].innerText.trim() === 'Nome') {
                        if (elementosTexto[i+1]) { nome = elementosTexto[i+1].innerText.split(/[\/\s-]/)[0]; break; }
                    }
                }
            }
        } catch(e) {}
        nome = nome.replace(/[^a-zA-ZáàâãéèêíïóôõöúçÁÀÂÃÉÈÊÍÏÓÔÕÖÚÇ]/g, "");
        return (nome && nome.length >= 2) ? nome.charAt(0).toUpperCase() + nome.slice(1).toLowerCase() : "Cliente";
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
            // Verificação de página válida pelo Analyzer
            if (!Analyzer.paginaValida()) {
                Logger.error('Analyzer: Página inválida! Não está no duleads.');
                estadoRobo = 'PARADO';
                return;
            }

            Stats.registrarProcessado();
            Watchdog.alimentar('leitura_abas');
            atualizarStatus("🔍 Lendo Abas Abertas...", "#00ffcc");
            Logger.info('Iniciando fluxo para próximo cliente...');

            const abas = Array.from(document.querySelectorAll('.q-tab, [role="tab"]'));
            const abaAlvo = abas.find(aba => aba.querySelector('.fa-times, .fas.fa-times') && !aba.hasAttribute('data-v-done'));
            
            if (!abaAlvo) {
                atualizarStatus("✅ Todas as abas concluídas!", "#ff99cc");
                Logger.success('Todas as abas foram concluídas!');
                estadoRobo = 'PARADO';
                Watchdog.parar();
                AI.atualizarIndicador(false);
                return;
            }

            simularClique(abaAlvo);
            await safeWait(3000); 

            let temWhatsApp = true; 

            // PASSO 1: Abrir WhatsApp
            if (isAtivo(1)) {
                const sucesso = await Retry.executarComRetry(async () => {
                    Watchdog.alimentar('passo_1_whatsapp');
                    atualizarStatus("1. Abrindo Zap...", "#00ffcc");
                    Logger.info('Passo 1: Abrindo WhatsApp...');
                    const btnZap = await Finder.buscarComFallback([
                        () => { const btns = Array.from(document.querySelectorAll('button, .q-btn')).filter(b => b.querySelector('.fa-whatsapp, .fab.fa-whatsapp')); return btns[btns.length - 1]; },
                        () => document.querySelector('[class*="whatsapp"]'),
                        () => Array.from(document.querySelectorAll('button')).find(b => b.textContent.toLowerCase().includes('whatsapp'))
                    ], 6000);
                    if (btnZap) {
                        await simularCliqueFirme(btnZap);
                        await safeWait(getWait(1, 5000));
                        if (document.body.innerText.includes('whatsapp ativo')) { temWhatsApp = false; Logger.warn('Passo 1: WhatsApp não ativo para este contato.'); }
                        return true;
                    }
                    Logger.warn('Passo 1: Botão do WhatsApp não encontrado.');
                    return false;
                }, 'Abrir WhatsApp', 3);
                if (!sucesso) Logger.warn('Passo 1: Pulando - não foi possível abrir WhatsApp.');
            }

            if (temWhatsApp) {
                // PASSO 2: Clicar no Clipe
                if (isAtivo(2)) {
                    await Retry.executarComRetry(async () => {
                        Watchdog.alimentar('passo_2_clipe');
                        Logger.info('Passo 2: Clicando no clipe...');
                        const clipe = await Finder.aguardarElemento(() => document.querySelector('.fa-paperclip'), 5000);
                        if (clipe) { await simularCliqueFirme(clipe.closest('button') || clipe); await safeWait(getWait(2, 3000)); return true; }
                        Logger.warn('Passo 2: Clipe não encontrado.');
                        return false;
                    }, 'Clicar Clipe', 2);
                }

                // PASSO 3: Abrir Template
                if (isAtivo(3)) {
                    await Retry.executarComRetry(async () => {
                        Watchdog.alimentar('passo_3_template');
                        Logger.info('Passo 3: Abrindo template...');
                        const btnTemp = await Finder.aguardarElemento(() => document.querySelector('.fa-file-alt'), 5000);
                        if (btnTemp) { await simularCliqueFirme(btnTemp.closest('button') || btnTemp); await safeWait(getWait(3, 4000)); return true; }
                        Logger.warn('Passo 3: Botão template não encontrado.');
                        return false;
                    }, 'Abrir Template', 2);
                }

                // PASSO 4: Abrir Lista
                if (isAtivo(4)) {
                    await Retry.executarComRetry(async () => {
                        Watchdog.alimentar('passo_4_lista');
                        Logger.info('Passo 4: Abrindo lista...');
                        const modal = await Finder.aguardarElemento(() => document.querySelector('.q-dialog'), 5000);
                        if (modal) {
                            const seta = modal.querySelector('.fa-caret-down');
                            if (seta) { await simularCliqueFirme(seta.closest('.q-field') || seta); await safeWait(getWait(4, 3000)); return true; }
                        }
                        Logger.warn('Passo 4: Lista/seta não encontrada.');
                        return false;
                    }, 'Abrir Lista', 2);
                }

                // PASSO 5: Selecionar na Lista
                if (isAtivo(5)) {
                    await Retry.executarComRetry(async () => {
                        Watchdog.alimentar('passo_5_selecionar');
                        atualizarStatus("5. Selecionando Template...", "#00ffcc");
                        Logger.info('Passo 5: Selecionando template na lista...');
                        const txtBruto = document.getElementById('v-target-template').value.toUpperCase().trim();
                        
                        const menu = await Finder.aguardarElemento(() => document.querySelector('.q-menu'), 5000);
                        if (!menu) { Logger.warn('Passo 5: Menu não apareceu.'); return false; }

                        const itemsMenu = Array.from(document.querySelectorAll('.q-menu .q-item'));
                        let item = null;

                        if (txtBruto.includes('LIVRE02') || txtBruto.includes('LIVRE1')) {
                            item = itemsMenu.find(i => i.innerText.toUpperCase().includes('LIVRE02 (MARKETING)'));
                            if (!item) item = itemsMenu.find(i => i.innerText.toUpperCase().includes('LIVRE1 (MARKETING)'));
                            if (!item) item = itemsMenu.find(i => i.innerText.toUpperCase().includes('LIVRE 02 (MARKETING)'));
                            if (!item) item = itemsMenu.find(i => i.innerText.toUpperCase().includes('LIVRE 1 (MARKETING)'));
                        } else {
                            let textoBusca = txtBruto.split(' ')[0];
                            item = itemsMenu.find(i => i.innerText.toUpperCase().includes(textoBusca));
                        }

                        if (item) { await simularCliqueFirme(item); await safeWait(getWait(5, 5000)); return true; }
                        Logger.warn('Passo 5: Template alvo não encontrado na lista.');
                        return false;
                    }, 'Selecionar Template', 3);
                }

                // PASSO 6: Preencher Dinâmico
                if (isAtivo(6)) {
                    await Retry.executarComRetry(async () => {
                        Watchdog.alimentar('passo_6_dinamico');
                        atualizarStatus("6. Preenchendo Dinâmico...", "#00ffcc");
                        Logger.info('Passo 6: Preenchendo campos dinâmicos...');
                        const modal = await Finder.aguardarElemento(() => document.querySelector('.q-dialog'), 5000);
                        if (modal) {
                            let nomeCliente = descobrirNomeCliente(abaAlvo);
                            let nomeUnidade = descobrirUnidadeAutomatica(); 
                            let nomeVendedor = descobrirNomeVendedor(); 
                            Logger.info(`Passo 6: Cliente="${nomeCliente}" Unidade="${nomeUnidade}" Vendedor="${nomeVendedor}"`);
                            
                            const inputs = Array.from(modal.querySelectorAll('input.q-field__native')).filter(inp => !inp.closest('.q-select') && !inp.readOnly);
                            const templateSelecionado = document.getElementById('v-target-template').value.toUpperCase();
                            let tempo = getWait(6, 1500);

                            if (templateSelecionado.includes('5ACOMPANHAMENTO')) {
                                if (inputs.length >= 1) { await digitarComoHumano(inputs[0], nomeCliente); await safeWait(tempo); }
                            } else {
                                if (inputs.length >= 1) { await digitarComoHumano(inputs[0], nomeCliente); await safeWait(tempo); } 
                                if (inputs.length >= 2) { await digitarComoHumano(inputs[1], "Hiago"); await safeWait(tempo); }
                                
                                const ehTemplateLivre = templateSelecionado.includes('LIVRE02') || templateSelecionado.includes('LIVRE1');
                                
                                if (ehTemplateLivre && inputs.length >= 3) {
                                    let msg = "Estou retornando seu contato referente ao interesse na compra de um de nossos veículos. Posso te enviar mais detalhes por aqui?"; 
                                    
                                    if (templateSelecionado.includes('INICIAL')) {
                                        msg = "Recebemos o seu interesse em um de nossos veículos. Posso te enviar mais detalhes e as condições por aqui?";
                                    } else if (templateSelecionado.includes('SEM_RETORNO')) {
                                        msg = "Tentei contato anteriormente sobre o veículo que você gostou, mas não tivemos retorno. Ainda tem interesse ou já comprou seu carro?";
                                    } else if (templateSelecionado.includes('ACOMPANHAMENTO')) {
                                        let trechoVendedor = nomeVendedor ? `o(a) vendedor(a) ${nomeVendedor}` : "a nossa equipe de vendas";
                                        msg = `Conversamos há alguns dias e direcionei seu atendimento para ${trechoVendedor}. Estou passando para acompanhar como está a compra do seu veículo. Está tudo certo ou posso te ajudar em algo?`;
                                    } else if (templateSelecionado.includes('RESGATE')) {
                                        msg = "Estou atualizando nosso sistema e vi que você buscou um veículo com a gente há um tempo. Já conseguiu comprar o seu carro ou ainda está pesquisando?";
                                    }
                                    
                                    await digitarComoHumano(inputs[2], msg);
                                    await safeWait(tempo);
                                } 
                                else if (inputs.length >= 3) { 
                                    await digitarComoHumano(inputs[2], nomeUnidade); 
                                    await safeWait(tempo); 
                                }
                            }
                            return true;
                        }
                        Logger.warn('Passo 6: Modal não encontrado para preenchimento.');
                        return false;
                    }, 'Preencher Dinâmico', 2);
                }

                // PASSO 7: Enviar WhatsApp
                if (isAtivo(7)) {
                    await Retry.executarComRetry(async () => {
                        Watchdog.alimentar('passo_7_enviar');
                        Logger.info('Passo 7: Enviando WhatsApp...');
                        const btnS = await Finder.aguardarElemento(
                            () => Array.from(document.querySelectorAll('.q-dialog button')).find(b => b.innerText.includes('ENVIAR')),
                            6000
                        );
                        if (btnS) { simularClique(btnS); await safeWait(getWait(7, 5000)); return true; }
                        Logger.warn('Passo 7: Botão ENVIAR não encontrado.');
                        return false;
                    }, 'Enviar WhatsApp', 3);
                }

                // PASSO 8: Fechar Aba Zap
                if (isAtivo(8)) {
                    await Retry.executarComRetry(async () => {
                        Watchdog.alimentar('passo_8_fechar_zap');
                        Logger.info('Passo 8: Fechando aba do WhatsApp...');
                        const btnFecharZap = await Finder.buscarComFallback([
                            () => { const iconesX = Array.from(document.querySelectorAll('.fa-times')); return iconesX.find(i => i.closest('.q-toolbar')); },
                            () => document.querySelector('.q-toolbar .fa-times'),
                            () => document.querySelector('.q-toolbar button')
                        ], 4000);
                        if (btnFecharZap) { simularClique(btnFecharZap.closest('button') || btnFecharZap); await safeWait(getWait(8, 3000)); return true; }
                        Logger.warn('Passo 8: Botão fechar zap não encontrado.');
                        return false;
                    }, 'Fechar Aba Zap', 2);
                }

                // PASSO 9: Salvar Comentário
                if (isAtivo(9)) {
                    await Retry.executarComRetry(async () => {
                        Watchdog.alimentar('passo_9_comentario');
                        atualizarStatus("9. Salvando Comentário...", "#00ffcc");
                        Logger.info('Passo 9: Salvando comentário...');
                        const fab = document.querySelector('.fa-ellipsis-v');
                        if (fab) { await simularCliqueFirme(fab.closest('button') || fab); await safeWait(2000); }
                        
                        let coment = await Finder.aguardarElemento(
                            () => document.querySelector('.fa-comment-dots.text-white') || Array.from(document.querySelectorAll('.fa-comment-dots')).pop(),
                            5000
                        );
                        if (coment) {
                            await simularCliqueFirme(coment.closest('button, .q-btn') || coment); await safeWait(3000);
                            const campo = await Finder.aguardarElemento(
                                () => document.querySelector('.q-dialog textarea') || document.querySelector('textarea'),
                                5000
                            );
                            if (campo) {
                                await digitarComoHumano(campo, document.getElementById('v-texto-comentario').value);
                                
                                const modalComentario = document.querySelector('.q-dialog');
                                let btnOk = null;
                                if (modalComentario) {
                                    btnOk = Array.from(modalComentario.querySelectorAll('button')).find(b => b.innerText.trim() === 'OK' || b.innerText.trim() === 'SALVAR');
                                } else {
                                    btnOk = Array.from(document.querySelectorAll('button')).find(b => b.innerText.trim() === 'OK' || b.innerText.trim() === 'SALVAR');
                                }

                                if (btnOk) { 
                                    await simularCliqueFirme(btnOk); 
                                    await safeWait(getWait(9, 3000)); 
                                    await safeWait(2000); 
                                    return true;
                                }
                            }
                        }
                        Logger.warn('Passo 9: Não foi possível salvar comentário.');
                        return false;
                    }, 'Salvar Comentário', 3);
                }

                // ----- PASSO 10: AGENDAMENTO (CLICANDO NO CALENDÁRIO) -----
                if (isAtivo(10)) {
                    await Retry.executarComRetry(async () => {
                        Watchdog.alimentar('passo_10_agendamento');
                        atualizarStatus("10. Criando Agendamento...", "#e0b0ff");
                        Logger.info('Passo 10: Criando agendamento...');
                        
                        const fab = document.querySelector('.fa-ellipsis-v');
                        if (fab) { await simularCliqueFirme(fab.closest('button') || fab); await safeWait(2000); }

                        const tipoAgenda = document.getElementById('v-tipo-agendamento').value;
                        let btnAgenda = null;

                        if (tipoAgenda === 'lembrete') {
                            btnAgenda = await Finder.buscarComFallback([
                                () => document.querySelector('a.bg-purple, button.bg-purple'),
                                () => Array.from(document.querySelectorAll('.fa-clock')).pop()
                            ], 4000);
                        } else {
                            btnAgenda = await Finder.buscarComFallback([
                                () => document.querySelector('a.bg-deep-purple, button.bg-deep-purple'),
                                () => Array.from(document.querySelectorAll('.fa-calendar, .fa-calendar-alt')).pop()
                            ], 4000);
                        }

                        if (btnAgenda) {
                            await simularCliqueFirme(btnAgenda.closest('button, a, .q-btn') || btnAgenda);
                            await safeWait(3000); 

                            const modalAgenda = await Finder.aguardarElemento(() => document.querySelector('.q-dialog'), 5000);
                            if (modalAgenda) {
                                
                                const valDataBruta = document.getElementById('v-data-agenda').value;
                                const valTexto = document.getElementById('v-texto-agenda').value;

                                // LÓGICA DE NAVEGAÇÃO NO CALENDÁRIO QUASAR
                                if (valDataBruta) {
                                    atualizarStatus("Buscando data no calendário...", "#e0b0ff");
                                    const dPartes = valDataBruta.split('-');
                                    const alvoAno = parseInt(dPartes[0]);
                                    const alvoMes = parseInt(dPartes[1]) - 1;
                                    const alvoDia = parseInt(dPartes[2]);

                                    const spansModal = Array.from(modalAgenda.querySelectorAll('span'));
                                    const spanData = spansModal.find(s => /\d{2}\/\d{2}\/\d{4}/.test(s.textContent || s.innerText));
                                    
                                    if (spanData) {
                                        const btnDataClicavel = spanData.closest('button') || spanData.closest('.cursor-pointer') || spanData;
                                        simularClique(btnDataClicavel);
                                        await safeWait(2000);

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
                                                const setaClicavel = setaIcone ? (setaIcone.closest('button') || setaIcone) : null;
                                                if (setaClicavel) { simularClique(setaClicavel); await safeWait(800); } 
                                                else break;
                                            } else if (anoTela > alvoAno || (anoTela === alvoAno && mesIdx > alvoMes)) {
                                                const setaIcone = menuCal.querySelector('i.fa-chevron-left');
                                                const setaClicavel = setaIcone ? (setaIcone.closest('button') || setaIcone) : null;
                                                if (setaClicavel) { simularClique(setaClicavel); await safeWait(800); }
                                                else break;
                                            } else {
                                                break;
                                            }
                                        }

                                        await safeWait(1000);
                                        const menusCalFinal = document.querySelectorAll('.q-menu');
                                        const calFinal = menusCalFinal[menusCalFinal.length - 1];
                                        if (calFinal) {
                                            const botoesDia = Array.from(calFinal.querySelectorAll('.q-date__calendar-item button, .q-date__calendar-days button'));
                                            const btnDia = botoesDia.find(b => (b.textContent||'').trim() === alvoDia.toString());
                                            if(btnDia) { simularClique(btnDia); await safeWait(1000); }

                                            const btnOkData = Array.from(calFinal.querySelectorAll('button')).find(b => {
                                                const txt = (b.textContent||'').trim().toUpperCase();
                                                return txt === 'OK' || txt === 'FECHAR';
                                            });
                                            if (btnOkData) simularClique(btnOkData);
                                        }
                                        await safeWait(1500);
                                    }
                                }

                                // LÓGICA DE INSERIR OBSERVAÇÃO
                                const textareas = Array.from(modalAgenda.querySelectorAll('textarea'));
                                if (textareas.length >= 1 && valTexto) { 
                                    atualizarStatus("Inserindo observação...", "#e0b0ff");
                                    const textareaObs = textareas[0];
                                    simularClique(textareaObs);
                                    await safeWait(500);
                                    
                                    const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, "value").set;
                                    nativeInputValueSetter.call(textareaObs, valTexto);
                                    
                                    textareaObs.dispatchEvent(new Event('input', { bubbles: true }));
                                    textareaObs.dispatchEvent(new Event('change', { bubbles: true }));
                                    await safeWait(1000); 
                                }

                                // Salva o agendamento inteiro
                                let btnOkAgenda = Array.from(modalAgenda.querySelectorAll('button')).find(b => b.innerText.trim().toUpperCase() === 'OK' || b.innerText.trim().toUpperCase() === 'SALVAR');
                                if (btnOkAgenda) {
                                    await simularCliqueFirme(btnOkAgenda);
                                    await safeWait(getWait(10, 3000));
                                }
                                return true;
                            }
                        }
                        Logger.warn('Passo 10: Agendamento não pôde ser criado.');
                        return false;
                    }, 'Agendamento', 2);
                }

                // PASSO 11: Check Final
                if (isAtivo(11)) {
                    await Retry.executarComRetry(async () => {
                        Watchdog.alimentar('passo_11_check');
                        atualizarStatus("11. Verificando Check Final...", "#00ffcc");
                        Logger.info('Passo 11: Verificando check final...');
                        const btnCheck = Array.from(document.querySelectorAll('button')).find(b => b.querySelector('.fa-check'));
                        if (btnCheck) {
                            simularClique(btnCheck);
                            await safeWait(2000);
                            const spanOk = Array.from(document.querySelectorAll('span.block')).find(s => s.innerText.trim().toLowerCase() === 'ok');
                            if (spanOk) { simularClique(spanOk.closest('button')); await safeWait(getWait(11, 3000)); }
                            return true;
                        }
                        Logger.warn('Passo 11: Botão check não encontrado.');
                        return false;
                    }, 'Check Final', 2);
                }
            }

            // PASSO 12: Fechar Cliente
            if (isAtivo(12)) {
                await Retry.executarComRetry(async () => {
                    Watchdog.alimentar('passo_12_fechar');
                    atualizarStatus("12. Fechando Aba do Cliente...", "#ff99cc");
                    Logger.info('Passo 12: Fechando aba do cliente...');
                    const btnFecharAba = abaAlvo.querySelector('.fas.fa-times, .fa-times');
                    if (btnFecharAba) { simularClique(btnFecharAba.closest('div, button, .q-tab') || btnFecharAba); await safeWait(getWait(12, 5000)); return true; }
                    Logger.warn('Passo 12: Botão fechar aba não encontrado.');
                    return false;
                }, 'Fechar Cliente', 2);
            } else { abaAlvo.setAttribute('data-v-done', 'true'); abaAlvo.style.borderBottom = "4px solid #ff3333"; }

            Stats.registrarSucesso();
            atualizarStatus("✅ Cliente Concluído!", "#00ffcc");
            Logger.success('✅ Cliente concluído com sucesso!');
            await safeWait(2500); 

        } catch (e) {
            if (e.message === "STOP") {
                atualizarStatus("⏹️ Parado.", "#ff3333");
                Logger.info('Fluxo parado pelo usuário.');
            } else {
                Stats.registrarErro();
                Logger.error(`Erro no fluxo: ${e.message}`);
                atualizarStatus(`Erro: ${e.message}`, "#ff3333");
                
                // Tentativa de recuperação automática antes de desistir
                Logger.agent('Tentando recuperação automática após erro...');
                const recuperou = await Recovery.tentarRecuperar();
                if (recuperou) {
                    Logger.success('Recuperação bem-sucedida. Continuando fluxo...');
                    return; // Permite que o loop continue
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
        Logger.agent('Loop principal iniciado.');
        while (estadoRobo === 'RODANDO' || estadoRobo === 'PAUSADO') {
            if (estadoRobo === 'RODANDO') {
                // Análise preventiva antes de cada iteração
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
        Logger.agent('Loop principal finalizado.');
        Stats.renderizar();
    }
})();