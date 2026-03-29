/**
 * Sistema de Agentes Inteligentes - Prospecção Maratona
 * * Agentes:
 * 1. Watchdog   - Detecta travamentos e passos congelados
 * 2. Retry      - Reexecuta passos com backoff exponencial
 * 3. Finder     - Busca elementos com espera inteligente e fallbacks
 * 4. Analyzer   - Analisa estado do fluxo e detecta anomalias
 * 5. Stats      - Rastreia métricas de sucesso, erro e retentativas
 * 6. Logger     - Log em tempo real no painel
 * 7. Recovery   - Recuperação automática de modais travados e estados inválidos
 * 8. Human      - Simula comportamento, digitação e atrasos humanos (NOVO)
 * 9. Vision     - Valida visualmente se ações ocorreram na tela (NOVO)
 */

const AgentesInteligentes = (() => {
    // ==================== LOGGER ====================
    const Logger = (() => {
        const MAX_LOGS = 80;
        const logs = [];

        function addLog(tipo, msg) {
            const hora = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
            logs.push({ tipo, msg, hora });
            if (logs.length > MAX_LOGS) logs.shift();
            renderizar();
        }

        function renderizar() {
            const el = document.getElementById('v-agent-logs');
            if (!el) return;
            el.innerHTML = logs.map(l => {
                const cores = { info: '#00cc44', warn: '#ffaa00', error: '#ff3333', success: '#00ff88', agent: '#ff6600', human: '#00ffff' };
                const cor = cores[l.tipo] || '#aaa';
                const icone = l.tipo === 'human' ? '👤' : (l.tipo === 'agent' ? '🤖' : '');
                return `<div style="font-size:8px;color:${cor};margin-bottom:1px;line-height:1.3;"><span style="color:#555;">[${l.hora}]</span> ${icone} ${l.msg}</div>`;
            }).join('');
            el.scrollTop = el.scrollHeight;
        }

        function limpar() { logs.length = 0; renderizar(); }

        return {
            info: (msg) => addLog('info', msg),
            warn: (msg) => addLog('warn', msg),
            error: (msg) => addLog('error', msg),
            success: (msg) => addLog('success', msg),
            agent: (msg) => addLog('agent', msg),
            human: (msg) => addLog('human', msg),
            limpar,
            getLogs: () => [...logs]
        };
    })();

    // ==================== STATS ====================
    const Stats = (() => {
        const dados = { clientesProcessados: 0, clientesSucesso: 0, clientesErro: 0, retentativas: 0, recoveries: 0, watchdogAtivacoes: 0, inicioSessao: null, ultimaAcao: null };
        function iniciar() { dados.inicioSessao = Date.now(); dados.ultimaAcao = Date.now(); }
        function registrarProcessado() { dados.clientesProcessados++; dados.ultimaAcao = Date.now(); renderizar(); }
        function registrarSucesso() { dados.clientesSucesso++; dados.ultimaAcao = Date.now(); renderizar(); }
        function registrarErro() { dados.clientesErro++; dados.ultimaAcao = Date.now(); renderizar(); }
        function registrarRetentativa() { dados.retentativas++; dados.ultimaAcao = Date.now(); renderizar(); }
        function registrarRecovery() { dados.recoveries++; dados.ultimaAcao = Date.now(); renderizar(); }
        function registrarWatchdog() { dados.watchdogAtivacoes++; renderizar(); }
        function marcarAcao() { dados.ultimaAcao = Date.now(); }
        function tempoSessao() {
            if (!dados.inicioSessao) return '00:00';
            const diff = Math.floor((Date.now() - dados.inicioSessao) / 1000);
            const min = Math.floor(diff / 60).toString().padStart(2, '0');
            const seg = (diff % 60).toString().padStart(2, '0');
            return `${min}:${seg}`;
        }
        function tempoDesdeUltimaAcao() { return dados.ultimaAcao ? Math.floor((Date.now() - dados.ultimaAcao) / 1000) : 0; }
        function renderizar() {
            const el = document.getElementById('v-agent-stats');
            if (!el) return;
            const taxa = dados.clientesProcessados > 0 ? Math.round((dados.clientesSucesso / dados.clientesProcessados) * 100) : 0;
            el.innerHTML = `
                <span style="color:#00cc44;">✅ ${dados.clientesSucesso}</span>
                <span style="color:#ff3333;">❌ ${dados.clientesErro}</span>
                <span style="color:#ffaa00;">🔄 ${dados.retentativas}</span>
                <span style="color:#ff6600;">🛡️ ${dados.recoveries}</span>
                <span style="color:#aaa;">⏱️ ${tempoSessao()}</span>
                <span style="color:${taxa >= 80 ? '#00cc44' : taxa >= 50 ? '#ffaa00' : '#ff3333'};">📊 ${taxa}%</span>
            `;
        }
        function resetar() { Object.keys(dados).forEach(k => dados[k] = 0); dados.inicioSessao = null; dados.ultimaAcao = null; renderizar(); }
        return { iniciar, registrarProcessado, registrarSucesso, registrarErro, registrarRetentativa, registrarRecovery, registrarWatchdog, marcarAcao, tempoDesdeUltimaAcao, tempoSessao, resetar, renderizar, getDados: () => ({ ...dados }) };
    })();

    // ==================== FINDER ====================
    const Finder = (() => {
        async function aguardarElemento(seletorFn, timeoutMs = 8000, intervaloMs = 300) {
            const inicio = Date.now();
            while (Date.now() - inicio < timeoutMs) {
                const el = seletorFn();
                if (el) return el;
                await new Promise(r => setTimeout(r, intervaloMs));
            }
            return null;
        }
        async function buscarComFallback(estrategias, timeoutMs = 5000) {
            for (const estrategia of estrategias) {
                const el = await aguardarElemento(estrategia, timeoutMs);
                if (el) return el;
            }
            return null;
        }
        function estaVisivel(el) {
            if (!el) return false;
            const rect = el.getBoundingClientRect();
            const style = window.getComputedStyle(el);
            return rect.width > 0 && rect.height > 0 && style.display !== 'none' && style.visibility !== 'hidden' && style.opacity !== '0';
        }
        return { aguardarElemento, buscarComFallback, estaVisivel };
    })();

    // ==================== ANALYZER ====================
    const Analyzer = (() => {
        function diagnosticar() {
            return {
                temModal: !!document.querySelector('.q-dialog'),
                temMenu: !!document.querySelector('.q-menu'),
                temOverlay: !!document.querySelector('.q-overlay, .q-loading'),
                temErroNaTela: !!(document.body.innerText.match(/erro|error|falha|fail/i)),
                temLoadingSpinner: !!document.querySelector('.q-spinner, .q-loading, .q-inner-loading'),
                urlAtual: window.location.href
            };
        }
        function detectarTravamento() {
            const diag = diagnosticar();
            const problemas = [];
            if (diag.temOverlay) problemas.push('overlay_bloqueante');
            if (diag.temLoadingSpinner) problemas.push('loading_spinner');
            if (diag.temModal && diag.temMenu) problemas.push('modal_e_menu_abertos');
            return { travado: problemas.length > 0, problemas, diagnostico: diag };
        }
        function paginaValida() { return window.location.href.includes('app.duleads.com.br'); }
        return { diagnosticar, detectarTravamento, paginaValida };
    })();

    // ==================== RECOVERY ====================
    const Recovery = (() => {
        async function fecharModais() {
            const modais = document.querySelectorAll('.q-dialog');
            let fechou = false;
            for (const modal of modais) {
                const btnFechar = modal.querySelector('.fa-times, [aria-label="close"]');
                if (btnFechar) {
                    const btnClicavel = btnFechar.closest('button') || btnFechar;
                    btnClicavel.click();
                    fechou = true;
                    await new Promise(r => setTimeout(r, 500));
                }
            }
            if (!fechou && modais.length > 0) {
                document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
                await new Promise(r => setTimeout(r, 500));
            }
            return fechou || modais.length > 0;
        }
        async function fecharMenus() {
            const menus = document.querySelectorAll('.q-menu');
            let fechou = false;
            for (const menu of menus) {
                document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
                fechou = true;
                await new Promise(r => setTimeout(r, 300));
            }
            return fechou;
        }
        function removerOverlays() {
            const overlays = document.querySelectorAll('.q-overlay, .q-loading');
            overlays.forEach(o => { if (o.parentElement) o.parentElement.removeChild(o); });
            return overlays.length > 0;
        }
        async function tentarRecuperar() {
            Logger.agent('Analisando estado travado...');
            const analise = Analyzer.detectarTravamento();
            if (!analise.travado) return true;
            Logger.warn(`Problemas detectados: ${analise.problemas.join(', ')}`);
            let recuperou = false;
            for (const problema of analise.problemas) {
                switch (problema) {
                    case 'overlay_bloqueante': recuperou = removerOverlays() || recuperou; break;
                    case 'loading_spinner': await new Promise(r => setTimeout(r, 5000)); recuperou = !document.querySelector('.q-spinner'); break;
                    case 'modal_e_menu_abertos': recuperou = await fecharMenus() || recuperou; break;
                }
            }
            if (recuperou) { Logger.success('Estado recuperado com sucesso!'); Stats.registrarRecovery(); } 
            else { Logger.error('Não foi possível recuperar automaticamente.'); }
            return recuperou;
        }
        return { fecharModais, fecharMenus, removerOverlays, tentarRecuperar };
    })();

    // ==================== WATCHDOG ====================
    const Watchdog = (() => {
        let timerId = null, passoAtual = '', callbackTravamento = null;
        const TIMEOUT_PADRAO = 45000; 
        function iniciar(onTravamento) {
            callbackTravamento = onTravamento;
            if (timerId) clearInterval(timerId);
            timerId = setInterval(verificar, 5000);
        }
        function parar() { if (timerId) { clearInterval(timerId); timerId = null; } }
        function alimentar(nomePasso) { passoAtual = nomePasso; Stats.marcarAcao(); }
        function verificar() {
            const tempoInativo = Stats.tempoDesdeUltimaAcao();
            if (tempoInativo > TIMEOUT_PADRAO / 1000) {
                Logger.warn(`Watchdog: Inatividade de ${tempoInativo}s no passo "${passoAtual}".`);
                Stats.registrarWatchdog();
                if (callbackTravamento) callbackTravamento(passoAtual, tempoInativo);
            }
        }
        return { iniciar, parar, alimentar };
    })();

    // ==================== HUMAN (Humano) ====================
    const Human = (() => {
        // Adiciona variação aleatória de tempo (ex: 5000ms vira algo entre 4500ms e 5500ms)
        function variacaoTempo(msBase) {
            const variacao = msBase * 0.15; // 15% de variação
            return msBase + (Math.random() * variacao * 2 - variacao);
        }

        async function cliqueNatural(el) {
            if (!el) return false;
            // "Move" o mouse até o elemento
            el.scrollIntoView({ behavior: 'smooth', block: 'center' });
            await new Promise(r => setTimeout(r, variacaoTempo(300))); 
            
            // Simula aperto do botão, pequena pausa, e soltura
            el.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, view: window }));
            await new Promise(r => setTimeout(r, variacaoTempo(100))); 
            el.dispatchEvent(new MouseEvent('mouseup', { bubbles: true, view: window }));
            el.click();
            return true;
        }

        async function digitarNatural(elemento, texto, checkStopFn) {
            if (!elemento || !texto) return;
            elemento.focus();
            elemento.value = ''; 
            
            for (let i = 0; i < texto.length; i++) {
                if (checkStopFn && checkStopFn()) throw new Error("STOP");
                
                // 3% de chance de "esbarrar" na tecla errada e apagar (comportamento humano)
                if (Math.random() < 0.03 && i > 0 && texto[i] !== ' ') {
                    const teclaErrada = String.fromCharCode(texto.charCodeAt(i) + 1);
                    elemento.value += teclaErrada;
                    elemento.dispatchEvent(new Event('input', { bubbles: true }));
                    await new Promise(r => setTimeout(r, variacaoTempo(150))); // Nota o erro
                    
                    elemento.value = elemento.value.slice(0, -1); // Apaga (Backspace)
                    elemento.dispatchEvent(new Event('input', { bubbles: true }));
                    await new Promise(r => setTimeout(r, variacaoTempo(200))); // Corrige
                }

                elemento.value += texto[i];
                elemento.dispatchEvent(new Event('input', { bubbles: true }));
                
                // Pausas para "pensar" (2% de chance)
                if (Math.random() < 0.02) {
                    await new Promise(r => setTimeout(r, variacaoTempo(600)));
                } else {
                    await new Promise(r => setTimeout(r, variacaoTempo(45))); // Velocidade normal de digitação
                }
            }
            elemento.dispatchEvent(new Event('change', { bubbles: true }));
        }

        return { variacaoTempo, cliqueNatural, digitarNatural };
    })();

    // ==================== VISION (Validador Visual) ====================
    const Vision = (() => {
        // Verifica se uma mensagem foi adicionada ao chat do whatsapp
        async function confirmarMensagemNaTela(textoEsperado, timeoutMs = 8000) {
            Logger.human('Vision: Lendo a tela para confirmar envio...');
            const inicio = Date.now();
            while (Date.now() - inicio < timeoutMs) {
                // Tenta achar o balão de mensagem que contenha partes do texto
                const mensagens = document.querySelectorAll('.message-out, div[data-pre-plain-text]');
                if (mensagens.length > 0) {
                    // Pega a última mensagem enviada
                    const ultima = mensagens[mensagens.length - 1].innerText.toLowerCase();
                    const palavraChave = textoEsperado.split(' ')[0].toLowerCase();
                    if (ultima.includes(palavraChave)) {
                        Logger.human('Vision: Envio confirmado visualmente!');
                        return true;
                    }
                }
                await new Promise(r => setTimeout(r, 500));
            }
            Logger.warn('Vision: Não foi possível ver a mensagem na tela.');
            return false;
        }
        return { confirmarMensagemNaTela };
    })();

    // ==================== RETRY ====================
    const Retry = (() => {
        async function executarComRetry(fn, nomePasso, maxTentativas = 3, baseWaitMs = 2000) {
            for (let tentativa = 1; tentativa <= maxTentativas; tentativa++) {
                try {
                    Watchdog.alimentar(nomePasso);
                    const resultado = await fn();
                    if (resultado !== false) {
                        if (tentativa > 1) Logger.success(`Retry: "${nomePasso}" OK na tentativa ${tentativa}/${maxTentativas}`);
                        return true;
                    }
                    throw new Error(`Passo retornou false`);
                } catch (e) {
                    if (e.message === 'STOP') throw e;
                    if (tentativa < maxTentativas) {
                        const espera = Human.variacaoTempo(baseWaitMs * tentativa);
                        Logger.warn(`Falha em "${nomePasso}" (${tentativa}/${maxTentativas}). Tentando em ${Math.round(espera)}ms...`);
                        Stats.registrarRetentativa();
                        await Recovery.tentarRecuperar();
                        await new Promise(r => setTimeout(r, espera));
                    } else {
                        Logger.error(`Falha definitiva em "${nomePasso}".`);
                        return false;
                    }
                }
            }
            return false;
        }
        return { executarComRetry };
    })();

    // ==================== PAINEL UI DOS AGENTES ====================
    function criarPainelAgentes() {
        if (document.getElementById('v-agent-panel')) return;
        const html = `
            <div id="v-agent-panel" style="margin-top:6px; background:#0a0a0a; border:1px solid #ff6600; border-radius:6px; padding:6px; cursor:default;">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
                    <p style="font-size:8px; color:#ff6600; font-weight:bold; margin:0; text-transform:uppercase;">🤖 Agentes Inteligentes ativos</p>
                    <div style="display:flex; gap:4px;">
                        <span id="v-agent-indicator" style="width:8px; height:8px; border-radius:50%; background:#555; display:inline-block;" title="Status"></span>
                        <span id="v-agent-toggle" style="font-size:8px; color:#aaa; cursor:pointer;" title="Expandir/Recolher">▼</span>
                    </div>
                </div>
                <div id="v-agent-stats" style="display:flex; gap:6px; flex-wrap:wrap; font-size:8px; margin-bottom:4px; padding:3px; background:#111; border-radius:3px;"></div>
                <div id="v-agent-logs-container" style="display:block;">
                    <div id="v-agent-logs" style="max-height:90px; overflow-y:auto; background:#050505; border:1px solid #222; border-radius:3px; padding:3px; scrollbar-width:thin;"></div>
                </div>
            </div>
        `;
        const painelConteudo = document.querySelector('#v-leads-full > div:last-child > div:last-child');
        if (painelConteudo) painelConteudo.insertAdjacentHTML('beforeend', html);

        setTimeout(() => {
            const toggle = document.getElementById('v-agent-toggle');
            if (toggle) {
                toggle.addEventListener('click', () => {
                    const container = document.getElementById('v-agent-logs-container');
                    if (container) {
                        const visivel = container.style.display !== 'none';
                        container.style.display = visivel ? 'none' : 'block';
                        toggle.textContent = visivel ? '▶' : '▼';
                    }
                });
            }
        }, 100);
    }

    function atualizarIndicador(ativo) {
        const ind = document.getElementById('v-agent-indicator');
        if (ind) {
            ind.style.background = ativo ? '#00cc44' : '#555';
            ind.style.boxShadow = ativo ? '0 0 5px #00cc44' : 'none';
        }
    }

    return { Logger, Stats, Finder, Analyzer, Recovery, Watchdog, Retry, Human, Vision, criarPainelAgentes, atualizarIndicador };
})();

window.AgentesInteligentes = AgentesInteligentes;