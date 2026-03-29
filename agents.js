/**
 * Sistema de Agentes Inteligentes - Prospecção Maratona
 * 
 * Agentes:
 * 1. Watchdog   - Detecta travamentos e passos congelados
 * 2. Retry      - Reexecuta passos com backoff exponencial
 * 3. Finder     - Busca elementos com espera inteligente e fallbacks
 * 4. Analyzer   - Analisa estado do fluxo e detecta anomalias
 * 5. Stats      - Rastreia métricas de sucesso, erro e retentativas
 * 6. Logger     - Log em tempo real no painel
 * 7. Recovery   - Recuperação automática de modais travados e estados inválidos
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
                const cores = { info: '#00ffcc', warn: '#ffaa00', error: '#ff3333', success: '#00ff88', agent: '#e0b0ff' };
                const cor = cores[l.tipo] || '#aaa';
                return `<div style="font-size:8px;color:${cor};margin-bottom:1px;line-height:1.3;"><span style="color:#555;">[${l.hora}]</span> ${l.msg}</div>`;
            }).join('');
            el.scrollTop = el.scrollHeight;
        }

        function limpar() { logs.length = 0; renderizar(); }

        return {
            info: (msg) => addLog('info', msg),
            warn: (msg) => addLog('warn', msg),
            error: (msg) => addLog('error', msg),
            success: (msg) => addLog('success', msg),
            agent: (msg) => addLog('agent', `🤖 ${msg}`),
            limpar,
            getLogs: () => [...logs]
        };
    })();

    // ==================== STATS ====================
    const Stats = (() => {
        const dados = {
            clientesProcessados: 0,
            clientesSucesso: 0,
            clientesErro: 0,
            retentativas: 0,
            recoveries: 0,
            watchdogAtivacoes: 0,
            inicioSessao: null,
            ultimaAcao: null
        };

        function iniciar() {
            dados.inicioSessao = Date.now();
            dados.ultimaAcao = Date.now();
        }

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

        function tempoDesdeUltimaAcao() {
            if (!dados.ultimaAcao) return 0;
            return Math.floor((Date.now() - dados.ultimaAcao) / 1000);
        }

        function renderizar() {
            const el = document.getElementById('v-agent-stats');
            if (!el) return;
            const taxa = dados.clientesProcessados > 0
                ? Math.round((dados.clientesSucesso / dados.clientesProcessados) * 100)
                : 0;
            el.innerHTML = `
                <span style="color:#00ff88;">✅ ${dados.clientesSucesso}</span>
                <span style="color:#ff3333;">❌ ${dados.clientesErro}</span>
                <span style="color:#ffaa00;">🔄 ${dados.retentativas}</span>
                <span style="color:#e0b0ff;">🛡️ ${dados.recoveries}</span>
                <span style="color:#aaa;">⏱️ ${tempoSessao()}</span>
                <span style="color:${taxa >= 80 ? '#00ff88' : taxa >= 50 ? '#ffaa00' : '#ff3333'};">📊 ${taxa}%</span>
            `;
        }

        function resetar() {
            dados.clientesProcessados = 0;
            dados.clientesSucesso = 0;
            dados.clientesErro = 0;
            dados.retentativas = 0;
            dados.recoveries = 0;
            dados.watchdogAtivacoes = 0;
            dados.inicioSessao = null;
            dados.ultimaAcao = null;
            renderizar();
        }

        return {
            iniciar, registrarProcessado, registrarSucesso, registrarErro,
            registrarRetentativa, registrarRecovery, registrarWatchdog,
            marcarAcao, tempoDesdeUltimaAcao, tempoSessao, resetar, renderizar,
            getDados: () => ({ ...dados })
        };
    })();

    // ==================== FINDER (Buscador Inteligente) ====================
    const Finder = (() => {
        /**
         * Aguarda um elemento aparecer no DOM com timeout configurável.
         * @param {Function} seletorFn - Função que retorna o elemento ou null
         * @param {number} timeoutMs - Tempo máximo de espera
         * @param {number} intervaloMs - Intervalo entre tentativas
         * @returns {Promise<Element|null>}
         */
        async function aguardarElemento(seletorFn, timeoutMs = 8000, intervaloMs = 300) {
            const inicio = Date.now();
            while (Date.now() - inicio < timeoutMs) {
                const el = seletorFn();
                if (el) return el;
                await new Promise(r => setTimeout(r, intervaloMs));
            }
            return null;
        }

        /**
         * Busca um elemento com múltiplos seletores de fallback.
         * @param {Array<Function>} estrategias - Array de funções seletoras
         * @param {number} timeoutMs - Timeout para cada estratégia
         * @returns {Promise<Element|null>}
         */
        async function buscarComFallback(estrategias, timeoutMs = 5000) {
            for (const estrategia of estrategias) {
                const el = await aguardarElemento(estrategia, timeoutMs);
                if (el) return el;
            }
            return null;
        }

        /**
         * Verifica se um elemento está visível e interagível.
         */
        function estaVisivel(el) {
            if (!el) return false;
            const rect = el.getBoundingClientRect();
            const style = window.getComputedStyle(el);
            return rect.width > 0 && rect.height > 0 &&
                   style.display !== 'none' && style.visibility !== 'hidden' &&
                   style.opacity !== '0';
        }

        /**
         * Aguarda um elemento ficar visível.
         */
        async function aguardarVisivel(seletorFn, timeoutMs = 8000) {
            const inicio = Date.now();
            while (Date.now() - inicio < timeoutMs) {
                const el = seletorFn();
                if (el && estaVisivel(el)) return el;
                await new Promise(r => setTimeout(r, 300));
            }
            return null;
        }

        return { aguardarElemento, buscarComFallback, estaVisivel, aguardarVisivel };
    })();

    // ==================== ANALYZER (Analisador de Fluxo) ====================
    const Analyzer = (() => {
        /**
         * Analisa o estado atual da página e retorna diagnóstico.
         */
        function diagnosticar() {
            const estado = {
                temModal: !!document.querySelector('.q-dialog'),
                temMenu: !!document.querySelector('.q-menu'),
                temOverlay: !!document.querySelector('.q-overlay, .q-loading'),
                quantidadeAbas: document.querySelectorAll('.q-tab, [role="tab"]').length,
                abasComFechar: document.querySelectorAll('.q-tab .fa-times, [role="tab"] .fa-times').length,
                temErroNaTela: !!(document.body.innerText.match(/erro|error|falha|fail/i)),
                temLoadingSpinner: !!document.querySelector('.q-spinner, .q-loading, .q-inner-loading'),
                urlAtual: window.location.href
            };
            return estado;
        }

        /**
         * Verifica se o fluxo está travado (modal inesperado, overlay, spinner).
         */
        function detectarTravamento() {
            const diag = diagnosticar();
            const problemas = [];

            if (diag.temOverlay) problemas.push('overlay_bloqueante');
            if (diag.temLoadingSpinner) problemas.push('loading_spinner');
            if (diag.temModal && diag.temMenu) problemas.push('modal_e_menu_abertos');

            return {
                travado: problemas.length > 0,
                problemas,
                diagnostico: diag
            };
        }

        /**
         * Verifica se a página de destino ainda está carregada corretamente.
         */
        function paginaValida() {
            return window.location.href.includes('app.duleads.com.br');
        }

        return { diagnosticar, detectarTravamento, paginaValida };
    })();

    // ==================== RECOVERY (Recuperação Automática) ====================
    const Recovery = (() => {
        /**
         * Fecha todos os modais abertos (q-dialog).
         */
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
            // Tenta pressionar ESC como fallback
            if (!fechou && modais.length > 0) {
                document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
                await new Promise(r => setTimeout(r, 500));
            }
            return fechou || modais.length > 0;
        }

        /**
         * Fecha menus dropdown abertos.
         */
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

        /**
         * Remove overlays bloqueantes.
         */
        function removerOverlays() {
            const overlays = document.querySelectorAll('.q-overlay, .q-loading');
            overlays.forEach(o => {
                if (o.parentElement) o.parentElement.removeChild(o);
            });
            return overlays.length > 0;
        }

        /**
         * Tenta recuperar de um estado travado automaticamente.
         * @returns {Promise<boolean>} true se conseguiu recuperar
         */
        async function tentarRecuperar() {
            Logger.agent('Recovery: Analisando estado...');
            const analise = Analyzer.detectarTravamento();

            if (!analise.travado) {
                Logger.agent('Recovery: Nenhum travamento detectado.');
                return true;
            }

            Logger.warn(`Recovery: Problemas detectados: ${analise.problemas.join(', ')}`);
            let recuperou = false;

            for (const problema of analise.problemas) {
                switch (problema) {
                    case 'overlay_bloqueante':
                        Logger.agent('Recovery: Removendo overlays...');
                        recuperou = removerOverlays() || recuperou;
                        break;
                    case 'loading_spinner':
                        Logger.agent('Recovery: Aguardando spinner sumir...');
                        await new Promise(r => setTimeout(r, 5000));
                        recuperou = !document.querySelector('.q-spinner, .q-loading, .q-inner-loading');
                        break;
                    case 'modal_e_menu_abertos':
                        Logger.agent('Recovery: Fechando menus extras...');
                        recuperou = await fecharMenus() || recuperou;
                        break;
                }
            }

            if (recuperou) {
                Logger.success('Recovery: Estado recuperado com sucesso!');
                Stats.registrarRecovery();
            } else {
                Logger.error('Recovery: Não foi possível recuperar automaticamente.');
            }

            return recuperou;
        }

        return { fecharModais, fecharMenus, removerOverlays, tentarRecuperar };
    })();

    // ==================== WATCHDOG ====================
    const Watchdog = (() => {
        let timerId = null;
        let passoAtual = '';
        let callbackTravamento = null;
        const TIMEOUT_PADRAO = 45000; // 45 segundos sem atividade = travado

        function iniciar(onTravamento) {
            callbackTravamento = onTravamento;
            if (timerId) clearInterval(timerId);
            timerId = setInterval(verificar, 5000);
            Logger.agent('Watchdog: Monitoramento iniciado.');
        }

        function parar() {
            if (timerId) { clearInterval(timerId); timerId = null; }
            Logger.agent('Watchdog: Monitoramento parado.');
        }

        function alimentar(nomePasso) {
            passoAtual = nomePasso;
            Stats.marcarAcao();
        }

        function verificar() {
            const tempoInativo = Stats.tempoDesdeUltimaAcao();
            if (tempoInativo > TIMEOUT_PADRAO / 1000) {
                Logger.warn(`Watchdog: Inatividade de ${tempoInativo}s no passo "${passoAtual}". Possível travamento!`);
                Stats.registrarWatchdog();
                if (callbackTravamento) callbackTravamento(passoAtual, tempoInativo);
            }
        }

        return { iniciar, parar, alimentar };
    })();

    // ==================== RETRY (Retentativa Inteligente) ====================
    const Retry = (() => {
        /**
         * Executa uma função com retentativas e backoff exponencial.
         * @param {Function} fn - Função async que executa o passo
         * @param {string} nomePasso - Nome do passo para log
         * @param {number} maxTentativas - Número máximo de tentativas
         * @param {number} baseWaitMs - Espera base entre tentativas
         * @returns {Promise<boolean>} true se o passo teve sucesso
         */
        async function executarComRetry(fn, nomePasso, maxTentativas = 3, baseWaitMs = 2000) {
            for (let tentativa = 1; tentativa <= maxTentativas; tentativa++) {
                try {
                    Watchdog.alimentar(nomePasso);
                    const resultado = await fn();
                    if (resultado !== false) {
                        if (tentativa > 1) {
                            Logger.success(`Retry: "${nomePasso}" OK na tentativa ${tentativa}/${maxTentativas}`);
                        }
                        return true;
                    }
                    throw new Error(`Passo "${nomePasso}" retornou false`);
                } catch (e) {
                    if (e.message === 'STOP') throw e;

                    if (tentativa < maxTentativas) {
                        const espera = baseWaitMs * tentativa;
                        Logger.warn(`Retry: "${nomePasso}" falhou (${tentativa}/${maxTentativas}). Retentando em ${espera}ms... [${e.message}]`);
                        Stats.registrarRetentativa();

                        // Tenta recuperar antes de retentar
                        await Recovery.tentarRecuperar();
                        await new Promise(r => setTimeout(r, espera));
                    } else {
                        Logger.error(`Retry: "${nomePasso}" falhou após ${maxTentativas} tentativas. [${e.message}]`);
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
            <div id="v-agent-panel" style="margin-top:6px; background:#0a0a0a; border:1px solid #4b0082; border-radius:6px; padding:6px; cursor:default;">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
                    <p style="font-size:8px; color:#e0b0ff; font-weight:bold; margin:0; text-transform:uppercase;">🤖 Agentes Inteligentes</p>
                    <div style="display:flex; gap:4px;">
                        <span id="v-agent-indicator" style="width:8px; height:8px; border-radius:50%; background:#555; display:inline-block;" title="Status dos agentes"></span>
                        <span id="v-agent-toggle" style="font-size:8px; color:#aaa; cursor:pointer;" title="Expandir/Recolher">▼</span>
                    </div>
                </div>
                <div id="v-agent-stats" style="display:flex; gap:6px; flex-wrap:wrap; font-size:8px; margin-bottom:4px; padding:3px; background:#111; border-radius:3px;"></div>
                <div id="v-agent-logs-container" style="display:block;">
                    <div id="v-agent-logs" style="max-height:90px; overflow-y:auto; background:#050505; border:1px solid #222; border-radius:3px; padding:3px; scrollbar-width:thin;"></div>
                </div>
            </div>
        `;

        // Insere no painel principal (abaixo dos botões)
        const painelConteudo = document.querySelector('#v-leads-full > div:last-child > div:last-child');
        if (painelConteudo) {
            painelConteudo.insertAdjacentHTML('beforeend', html);
        }

        // Toggle para expandir/recolher logs
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
            ind.style.background = ativo ? '#00ff88' : '#555';
            ind.title = ativo ? 'Agentes ativos' : 'Agentes inativos';
        }
    }

    // ==================== API PÚBLICA ====================
    return {
        Logger,
        Stats,
        Finder,
        Analyzer,
        Recovery,
        Watchdog,
        Retry,
        criarPainelAgentes,
        atualizarIndicador
    };
})();

// Exporta globalmente
window.AgentesInteligentes = AgentesInteligentes;
