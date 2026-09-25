/**
 * Agenda Fotográfica - Script Principal
 */

// Estado da Aplicação
let visualizacaoAtual = 'cards'; // Modo Lista em Tabela
let dataCalendario = new Date();

// Estado da Paginação
let paginaAtual = 1;
const itensPorPagina = 10;

// Obter instância do Modal Bootstrap de forma segura
function obterInstanciaModal() {
  const modalEl = document.getElementById('modalEvento');
  if (modalEl && typeof bootstrap !== 'undefined') {
    return bootstrap.Modal.getOrCreateInstance(modalEl);
  }
  return null;
}

// Fechamento com limpeza forçada de qualquer backdrop preso
function fecharModalComLimpeza() {
  const modal = obterInstanciaModal();
  if (modal) {
    modal.hide();
  }

  setTimeout(() => {
    document.querySelectorAll('.modal-backdrop').forEach(el => el.remove());
    document.body.classList.remove('modal-open');
    document.body.style.removeProperty('padding-right');
    document.body.style.removeProperty('overflow');
  }, 150);
}

/* ===============================
   GERENCIAMENTO DE STORAGE
================================== */
function obterEventos() {
  try {
    return JSON.parse(localStorage.getItem('agenda_fotografo') || '[]');
  } catch (e) {
    console.error('Erro ao ler do localStorage:', e);
    return [];
  }
}

function salvarEventos(eventos) {
  localStorage.setItem('agenda_fotografo', JSON.stringify(eventos));
}

/* ===============================
   CONTROLE DO MODAL (NOVO / EDIÇÃO)
================================== */
function abrirModalNovoEvento(dataIso = '') {
  const form = document.getElementById('formEvento');
  if (form) form.reset();

  const inputIdx = document.getElementById('indiceEventoEdicao');
  if (inputIdx) inputIdx.value = '-1';

  const modalTitulo = document.getElementById('modalTitulo');
  if (modalTitulo) modalTitulo.innerText = 'Agendar Novo Trabalho';

  const btnSalvar = document.getElementById('btnSalvarModal');
  if (btnSalvar) {
    btnSalvar.innerText = 'Salvar na Agenda';
    btnSalvar.className = 'btn btn-success';
  }

  const secaoAniv = document.getElementById('secaoAniversario');
  if (secaoAniv) secaoAniv.classList.add('d-none');

  if (dataIso) {
    const elData = document.getElementById('dataEvento');
    if (elData) elData.value = dataIso;
  }

  const elHoraInicio = document.getElementById('horaInicio');
  const elHoraFim = document.getElementById('horaFim');
  if (elHoraInicio && !elHoraInicio.value) elHoraInicio.value = '14:00';
  if (elHoraFim && !elHoraFim.value) elHoraFim.value = '18:00';

  const modal = obterInstanciaModal();
  if (modal) modal.show();
}

function abrirModalEdicao(indice) {
  const eventos = obterEventos();
  const evt = eventos[indice];
  if (!evt) return;

  const inputIdx = document.getElementById('indiceEventoEdicao');
  if (inputIdx) inputIdx.value = indice;

  const modalTitulo = document.getElementById('modalTitulo');
  if (modalTitulo) modalTitulo.innerText = `Editar: ${evt.cliente}`;

  const btnSalvar = document.getElementById('btnSalvarModal');
  if (btnSalvar) {
    btnSalvar.innerText = 'Atualizar Alterações';
    btnSalvar.className = 'btn btn-primary';
  }

  document.getElementById('dataEvento').value = evt.data || '';
  document.getElementById('horaInicio').value = evt.horaInicio || '';
  document.getElementById('horaFim').value = evt.horaFim || '';
  document.getElementById('tipoEvento').value = evt.tipo || '';
  document.getElementById('qtdConvidados').value = evt.convidados || '';

  const isAniv = (evt.tipo || '').startsWith('aniversario');
  const secaoAniv = document.getElementById('secaoAniversario');
  if (isAniv && secaoAniv) {
    secaoAniv.classList.remove('d-none');
    document.getElementById('nomeAniversariante').value = evt.aniversariante || '';
    document.getElementById('idadeAniversariante').value = evt.idade || '';
    document.getElementById('generoAniversariante').value = evt.genero || 'menino';
    document.getElementById('temaFesta').value = evt.tema || '';
  } else if (secaoAniv) {
    secaoAniv.classList.add('d-none');
    document.getElementById('nomeAniversariante').value = '';
    document.getElementById('idadeAniversariante').value = '';
    document.getElementById('temaFesta').value = '';
  }

  document.getElementById('nomeCliente').value = evt.cliente || '';
  document.getElementById('telCliente').value = evt.telefone || '';
  document.getElementById('localEvento').value = evt.local || '';
  document.getElementById('obsEvento').value = evt.obs || '';

  const modal = obterInstanciaModal();
  if (modal) modal.show();
}

/* ===============================
   RENDERIZAÇÃO: MODO LINHAS (TABELA COM PAGINAÇÃO)
================================== */
function renderizarEventos() {
  const corpoTabela = document.getElementById('gridEventos');
  const infoPaginacao = document.getElementById('infoPaginacao');
  const containerPaginacao = document.getElementById('controlesPaginacao');
  if (!corpoTabela) return;
  corpoTabela.innerHTML = '';

  const todosEventos = obterEventos();

  const fData = document.getElementById('filtroData')?.value || '';
  const fHoraInicio = document.getElementById('filtroHoraInicio')?.value || '';
  const fHoraFim = document.getElementById('filtroHoraFim')?.value || '';
  const fTipo = document.getElementById('filtroTipo')?.value || 'todos';
  const fTexto = (document.getElementById('filtroTexto')?.value || '').trim().toLowerCase();

  const eventosIndexados = todosEventos.map((evt, idx) => ({ ...evt, _indiceOriginal: idx }));

  const eventosFiltrados = eventosIndexados.filter(evt => {
    if (fData && evt.data !== fData) return false;
    if (fHoraInicio && evt.horaInicio < fHoraInicio) return false;
    if (fHoraFim && evt.horaFim > fHoraFim) return false;

    if (fTipo === 'apenas_aniversarios') {
      if (!evt.tipo.startsWith('aniversario')) return false;
    } else if (fTipo !== 'todos') {
      if (evt.tipo !== fTipo) return false;
    }

    if (fTexto) {
      const c = (evt.cliente || '').toLowerCase();
      const a = (evt.aniversariante || '').toLowerCase();
      const t = (evt.tema || '').toLowerCase();
      const l = (evt.local || '').toLowerCase();

      const corresponde = c.includes(fTexto) || a.includes(fTexto) || t.includes(fTexto) || l.includes(fTexto);
      if (!corresponde) return false;
    }

    return true;
  });

  const totalEventos = eventosFiltrados.length;
  const totalPaginas = Math.ceil(totalEventos / itensPorPagina) || 1;

  if (paginaAtual > totalPaginas) paginaAtual = totalPaginas;
  if (paginaAtual < 1) paginaAtual = 1;

  if (totalEventos === 0) {
    corpoTabela.innerHTML = `
      <tr>
        <td colspan="6" class="text-center text-muted py-5">
          <i class="bi bi-calendar-x fs-1 d-block mb-2"></i>
          <p class="mb-0">Nenhum evento agendado ou encontrado para os filtros ativos.</p>
        </td>
      </tr>`;
    if (infoPaginacao) infoPaginacao.innerText = 'Mostrando 0 de 0 registros';
    if (containerPaginacao) containerPaginacao.innerHTML = '';
    return;
  }

  // Segmentação para a página atual
  const inicio = (paginaAtual - 1) * itensPorPagina;
  const fim = Math.min(inicio + itensPorPagina, totalEventos);
  const eventosPagina = eventosFiltrados.slice(inicio, fim);

  if (infoPaginacao) {
    infoPaginacao.innerText = `Mostrando ${inicio + 1} a ${fim} de ${totalEventos} registros`;
  }

  eventosPagina.forEach((evt) => {
    const isAniv = evt.tipo && evt.tipo.startsWith('aniversario');
    let dataFormatada = evt.data;
    if (evt.data && evt.data.includes('-')) {
      const [ano, mes, dia] = evt.data.split('-');
      dataFormatada = `${dia}/${mes}/${ano}`;
    }

    let badgeClass = 'bg-secondary';
    if (isAniv) badgeClass = 'bg-primary';
    else if (evt.tipo === 'formatura') badgeClass = 'bg-success';
    else if (evt.tipo === 'ensaio') badgeClass = 'bg-warning text-dark';

    const nomeDestaque = evt.aniversariante ? evt.aniversariante : 'Homenageado';

    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td class="ps-3">
        <strong class="d-block text-dark">${dataFormatada}</strong>
        <small class="text-muted"><i class="bi bi-clock"></i> ${evt.horaInicio} às ${evt.horaFim}</small>
      </td>
      <td>
        <span class="badge ${badgeClass} text-uppercase font-monospace" style="font-size: 0.75rem;">
          ${(evt.tipo || 'Evento').replace('_', ' ')}
        </span>
      </td>
      <td>
        <span class="fw-bold d-block text-dark">${evt.cliente || 'Sem nome'}</span>
        ${isAniv && (evt.aniversariante || evt.tema) ? `
          <small class="text-primary d-block">
            <strong>${nomeDestaque}</strong>${evt.idade ? `(${evt.idade} anos)` : ''} 
            ${evt.tema ? `• Tema: <em>${evt.tema}</em>` : ''}
          </small>
        ` : ''}
      </td>
      <td>
        <span class="text-truncate d-inline-block" style="max-width: 220px;" title="${evt.local || 'Local a definir'}">
          <i class="bi bi-geo-alt text-muted me-1"></i>${evt.local || '<span class="text-muted">A definir</span>'}
        </span>
      </td>
      <td class="text-center">
        ${evt.convidados ? `<span class="badge bg-light text-dark border">~${evt.convidados}</span>` : '<span class="text-muted">-</span>'}
      </td>
      <td class="text-end pe-3">
        <div class="btn-group btn-group-sm" role="group">
          <button class="btn btn-outline-secondary" title="Editar Evento" onclick="abrirModalEdicao(${evt._indiceOriginal})">
            <i class="bi bi-pencil"></i>
          </button>
          <button class="btn btn-outline-secondary" title="Google Agenda" onclick="adicionarAoGoogleCalendar(${evt._indiceOriginal})">
            <i class="bi bi-calendar-plus"></i>
          </button>
          <button class="btn btn-outline-success" title="WhatsApp" onclick="enviarResumoWhatsApp(${evt._indiceOriginal})">
            <i class="bi bi-whatsapp"></i>
          </button>
          <button class="btn btn-outline-primary" title="PDF / Contrato" onclick="gerarPdfContrato(${evt._indiceOriginal})">
            <i class="bi bi-file-earmark-pdf"></i>
          </button>
          <button class="btn btn-outline-danger" title="Excluir" onclick="removerEvento(${evt._indiceOriginal})">
            <i class="bi bi-trash"></i>
          </button>
        </div>
      </td>
    `;
    corpoTabela.appendChild(tr);
  });

  renderizarBotoesPaginacao(totalPaginas);
}

function renderizarBotoesPaginacao(totalPaginas) {
  const container = document.getElementById('controlesPaginacao');
  if (!container) return;
  container.innerHTML = '';

  if (totalPaginas <= 1) return;

  const liAnt = document.createElement('li');
  liAnt.className = `page-item ${paginaAtual === 1 ? 'disabled' : ''}`;
  liAnt.innerHTML = `<button class="page-link" aria-label="Anterior">&laquo;</button>`;
  liAnt.onclick = () => {
    if (paginaAtual > 1) {
      paginaAtual--;
      renderizarEventos();
    }
  };
  container.appendChild(liAnt);

  for (let i = 1; i <= totalPaginas; i++) {
    const li = document.createElement('li');
    li.className = `page-item ${i === paginaAtual ? 'active' : ''}`;
    li.innerHTML = `<button class="page-link">${i}</button>`;
    li.onclick = () => {
      paginaAtual = i;
      renderizarEventos();
    };
    container.appendChild(li);
  }

  const liProx = document.createElement('li');
  liProx.className = `page-item ${paginaAtual === totalPaginas ? 'disabled' : ''}`;
  liProx.innerHTML = `<button class="page-link" aria-label="Próximo">&raquo;</button>`;
  liProx.onclick = () => {
    if (paginaAtual < totalPaginas) {
      paginaAtual++;
      renderizarEventos();
    }
  };
  container.appendChild(liProx);
}

/* ===============================
   RENDERIZAÇÃO: MODO GRADE MENSAL
================================== */
function renderizarCalendario() {
  const gridDias = document.getElementById('gridDiasCalendario');
  const labelMes = document.getElementById('labelMesAnoAtual');
  if (!gridDias) return;

  gridDias.innerHTML = '';
  const eventos = obterEventos();

  const ano = dataCalendario.getFullYear();
  const mes = dataCalendario.getMonth();

  if (labelMes) {
    labelMes.innerText = dataCalendario.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
  }

  const primeiroDiaSemana = new Date(ano, mes, 1).getDay();
  const totalDiasMes = new Date(ano, mes + 1, 0).getDate();

  const hoje = new Date();
  const hojeStr = `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, '0')}-${String(hoje.getDate()).padStart(2, '0')}`;

  for (let i = 0; i < primeiroDiaSemana; i++) {
    const blank = document.createElement('div');
    blank.className = 'calendar-day empty';
    gridDias.appendChild(blank);
  }

  for (let dia = 1; dia <= totalDiasMes; dia++) {
    const dataIso = `${ano}-${String(mes + 1).padStart(2, '0')}-${String(dia).padStart(2, '0')}`;
    const diaDiv = document.createElement('div');
    diaDiv.className = 'calendar-day';

    if (dataIso === hojeStr) {
      diaDiv.classList.add('today');
    }

    diaDiv.innerHTML = `<span class="day-number">${dia}</span>`;

    diaDiv.onclick = () => abrirModalNovoEvento(dataIso);

    eventos.forEach((evt, idx) => {
      if (evt.data === dataIso) {
        const isAniv = evt.tipo && evt.tipo.startsWith('aniversario');
        
        let badgeClass = 'bg-secondary text-white';
        if (isAniv) badgeClass = 'bg-primary text-white';
        else if (evt.tipo === 'formatura') badgeClass = 'bg-success text-white';
        else if (evt.tipo === 'ensaio') badgeClass = 'bg-warning text-dark';

        const label = isAniv && evt.aniversariante 
          ? `${evt.horaInicio} - ${evt.aniversariante}` 
          : `${evt.horaInicio} - ${evt.cliente}`;

        const pill = document.createElement('button');
        pill.className = `event-pill ${badgeClass} w-100`;
        pill.title = `Clique para editar | ${evt.horaInicio} às ${evt.horaFim} - ${evt.cliente}`;
        pill.innerText = label;

        pill.onclick = (e) => {
          e.stopPropagation();
          abrirModalEdicao(idx);
        };

        diaDiv.appendChild(pill);
      }
    });

    gridDias.appendChild(diaDiv);
  }
}

/* ===============================
   INTEGRAÇÕES EXTERNAS
================================== */
function enviarResumoWhatsApp(indice) {
  const eventos = obterEventos();
  const evt = eventos[indice];
  if (!evt) return;

  let fone = (evt.telefone || '').replace(/\D/g, '');
  if (!fone) {
    Swal.fire({
      icon: 'warning',
      title: 'Atenção',
      text: 'Número de WhatsApp não informado para este agendamento.'
    });
    return;
  }
  if (fone.length === 10 || fone.length === 11) fone = '55' + fone;

  let dataFmt = evt.data;
  if (evt.data && evt.data.includes('-')) {
    const [ano, mes, dia] = evt.data.split('-');
    dataFmt = `${dia}/${mes}/${ano}`;
  }

  let msg = `Olá, *${evt.cliente}*! Tudo bem?\n\n`;
  msg += `Confirmando os detalhes da nossa cobertura fotográfica:\n\n`;
  msg += `📸 *Tipo:* ${(evt.tipo || '').replace('_', ' ').toUpperCase()}\n`;
  msg += `📅 *Data:* ${dataFmt}\n`;
  msg += `⏰ *Horário:* ${evt.horaInicio} às ${evt.horaFim}\n`;
  msg += `📍 *Local:* ${evt.local || 'A definir'}\n`;

  if (evt.tipo && evt.tipo.startsWith('aniversario')) {
    msg += `🎉 *Homenageado(a):* ${evt.aniversariante || '-'} (${evt.idade || '-'} anos)\n`;
    if (evt.tema) msg += `🎨 *Tema:* ${evt.tema}\n`;
  }

  if (evt.convidados) msg += `👥 *Convidados:* ~${evt.convidados}\n`;
  if (evt.obs) msg += `📝 *Obs:* ${evt.obs}\n`;

  msg += `\nQualquer dúvida, fico à disposição!\n_Agenda Fotográfica_`;
  window.open(`https://wa.me/${fone}?text=${encodeURIComponent(msg)}`, '_blank');
}

function adicionarAoGoogleCalendar(indice) {
  const eventos = obterEventos();
  const evt = eventos[indice];
  if (!evt) return;

  const dataLimpa = (evt.data || '').replace(/-/g, '');
  const hIni = (evt.horaInicio || '').replace(':', '') + '00';
  const hFim = (evt.horaFim || '').replace(':', '') + '00';

  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: `[FOTO] ${(evt.tipo || '').toUpperCase()} - ${evt.cliente}`,
    dates: `${dataLimpa}T${hIni}/${dataLimpa}T${hFim}`,
    details: `Cliente: ${evt.cliente}\nTel: ${evt.telefone}\nLocal: ${evt.local}\nObs: ${evt.obs || ''}`,
    location: evt.local || ''
  });

  window.open(`https://calendar.google.com/calendar/render?${params.toString()}`, '_blank');
}

function gerarPdfContrato(indice) {
  const eventos = obterEventos();
  const evt = eventos[indice];
  if (!evt || typeof html2pdf === 'undefined') return;

  let dataFmt = evt.data;
  if (evt.data && evt.data.includes('-')) {
    const [ano, mes, dia] = evt.data.split('-');
    dataFmt = `${dia}/${mes}/${ano}`;
  }

  document.getElementById('pdfDataEmissao').innerText = `Emitido em: ${new Date().toLocaleDateString('pt-BR')}`;
  document.getElementById('pdfCodigoEvento').innerText = `ID: #${indice + 1}`;
  document.getElementById('pdfNomeCliente').innerText = evt.cliente || 'Não informado';
  document.getElementById('pdfTelCliente').innerText = evt.telefone || 'Não informado';
  document.getElementById('pdfTipoEvento').innerText = (evt.tipo || '').replace('_', ' ').toUpperCase();
  document.getElementById('pdfDataEvento').innerText = dataFmt;
  document.getElementById('pdfHorarioEvento').innerText = `${evt.horaInicio} às ${evt.horaFim}`;
  document.getElementById('pdfLocalEvento').innerText = evt.local || 'A definir';
  document.getElementById('pdfQtdConvidados').innerText = evt.convidados || 'Não informado';
  document.getElementById('pdfAssinaturaCliente').innerText = evt.cliente || 'Contratante';

  const isAniv = evt.tipo && evt.tipo.startsWith('aniversario');
  const blocoAniv = document.getElementById('pdfBlocoAniversario');
  if (isAniv && blocoAniv) {
    blocoAniv.style.display = 'block';
    document.getElementById('pdfNomeAniversariante').innerText = evt.aniversariante || '-';
    document.getElementById('pdfIdadeAniversariante').innerText = evt.idade || '-';
    document.getElementById('pdfTemaFesta').innerText = evt.tema || 'Sem tema';
  } else if (blocoAniv) {
    blocoAniv.style.display = 'none';
  }

  const container = document.getElementById('containerPdf');
  const doc = document.getElementById('documentoContrato');
  container.style.display = 'block';

  html2pdf().set({
    margin: [10, 10, 10, 10],
    filename: `Contrato_${(evt.cliente || 'cliente').replace(/\s+/g, '_')}.pdf`,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2 },
    jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
  }).from(doc).save().then(() => {
    container.style.display = 'none';
    Swal.fire({
      icon: 'success',
      title: 'PDF Gerado!',
      text: 'O download do contrato foi concluído.',
      timer: 2000,
      showConfirmButton: false
    });
  });
}

window.removerEvento = function(indice) {
  Swal.fire({
    title: 'Excluir Agendamento?',
    text: 'Esta ação não poderá ser revertida!',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#dc3545',
    cancelButtonColor: '#6c757d',
    confirmButtonText: 'Sim, excluir!',
    cancelButtonText: 'Cancelar'
  }).then((resultado) => {
    if (resultado.isConfirmed) {
      const eventos = obterEventos();
      eventos.splice(indice, 1);
      salvarEventos(eventos);
      atualizarTelas();

      Swal.fire({
        icon: 'success',
        title: 'Excluído!',
        text: 'O agendamento foi removido com sucesso.',
        timer: 1800,
        showConfirmButton: false
      });
    }
  });
};

/* ===============================
   BACKUP E RESTAURO VIA JSON
================================== */
function exportarBackupJson() {
  const eventos = obterEventos();
  if (eventos.length === 0) {
    Swal.fire({
      icon: 'info',
      title: 'Agenda Vazia',
      text: 'Não existem eventos cadastrados na agenda para exportar.'
    });
    return;
  }

  const jsonString = JSON.stringify(eventos, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const hoje = new Date().toISOString().split('T')[0];
  const linkDownload = document.createElement('a');
  linkDownload.href = url;
  linkDownload.download = `backup_agenda_fotografo_${hoje}.json`;

  document.body.appendChild(linkDownload);
  linkDownload.click();
  document.body.removeChild(linkDownload);
  URL.revokeObjectURL(url);

  Swal.fire({
    icon: 'success',
    title: 'Backup Exportado!',
    text: 'Arquivo JSON baixado com sucesso.',
    timer: 2000,
    showConfirmButton: false
  });
}

function importarBackupJson(eventoInput) {
  const ficheiro = eventoInput.target.files[0];
  if (!ficheiro) return;

  const leitor = new FileReader();
  leitor.onload = function(e) {
    try {
      const dadosImportados = JSON.parse(e.target.result);

      if (!Array.isArray(dadosImportados)) {
        throw new Error('O arquivo selecionado não contém uma lista válida de eventos.');
      }

      Swal.fire({
        title: 'Restaurar Backup?',
        text: `Foram encontrados ${dadosImportados.length} evento(s). Deseja substituir a agenda atual por estes dados?`,
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#0d6efd',
        cancelButtonColor: '#6c757d',
        confirmButtonText: 'Sim, restaurar!',
        cancelButtonText: 'Cancelar'
      }).then((resultado) => {
        if (resultado.isConfirmed) {
          salvarEventos(dadosImportados);
          paginaAtual = 1;
          atualizarTelas();

          Swal.fire({
            icon: 'success',
            title: 'Agenda Restaurada!',
            text: 'Todos os registros foram carregados com sucesso.',
            timer: 2000,
            showConfirmButton: false
          });
        }
      });

    } catch (erro) {
      Swal.fire({
        icon: 'error',
        title: 'Falha na Importação',
        text: erro.message
      });
    } finally {
      eventoInput.target.value = '';
    }
  };

  leitor.readAsText(ficheiro);
}

/* ===============================
   CONTROLES GERAIS E INICIALIZAÇÃO
================================== */
function alternarVisualizacao(modo) {
  visualizacaoAtual = modo;
  const btnCards = document.getElementById('btnModoCards');
  const btnCal = document.getElementById('btnModoCalendario');
  const visaoTabela = document.getElementById('visaoTabela');
  const visaoCal = document.getElementById('visaoCalendario');

  if (modo === 'cards') {
    btnCards?.classList.add('active');
    btnCal?.classList.remove('active');
    visaoTabela?.classList.remove('d-none');
    visaoCal?.classList.add('d-none');
    renderizarEventos();
  } else {
    btnCal?.classList.add('active');
    btnCards?.classList.remove('active');
    visaoTabela?.classList.add('d-none');
    visaoCal?.classList.remove('d-none');
    renderizarCalendario();
  }
}

function atualizarTelas() {
  if (visualizacaoAtual === 'cards') {
    renderizarEventos();
  } else {
    renderizarCalendario();
  }
}

document.addEventListener('DOMContentLoaded', () => {
  // Alternância de Modos
  document.getElementById('btnModoCards')?.addEventListener('click', () => alternarVisualizacao('cards'));
  document.getElementById('btnModoCalendario')?.addEventListener('click', () => alternarVisualizacao('calendario'));

  // Navegação Mensal
  document.getElementById('btnMesAnterior')?.addEventListener('click', () => {
    dataCalendario.setMonth(dataCalendario.getMonth() - 1);
    renderizarCalendario();
  });
  document.getElementById('btnProximoMes')?.addEventListener('click', () => {
    dataCalendario.setMonth(dataCalendario.getMonth() + 1);
    renderizarCalendario();
  });

  // Alternar campo de aniversário
  const tipoEventoSelect = document.getElementById('tipoEvento');
  tipoEventoSelect?.addEventListener('change', () => {
    const secao = document.getElementById('secaoAniversario');
    if (secao) secao.classList.toggle('d-none', !tipoEventoSelect.value.startsWith('aniversario'));
  });

  // Salvar / Atualizar Evento
  const formEvento = document.getElementById('formEvento');
  formEvento?.addEventListener('submit', (e) => {
    e.preventDefault();

    try {
      const dataEvt = document.getElementById('dataEvento')?.value || '';
      const horaIni = document.getElementById('horaInicio')?.value || '';
      const horaFim = document.getElementById('horaFim')?.value || '';
      const tipoEvt = document.getElementById('tipoEvento')?.value || '';
      const nomeCli = document.getElementById('nomeCliente')?.value || '';
      const telCli = document.getElementById('telCliente')?.value || '';

      if (!dataEvt || !horaIni || !horaFim || !tipoEvt || !nomeCli || !telCli) {
        Swal.fire({
          icon: 'warning',
          title: 'Campos Obrigatórios',
          text: 'Por favor, preencha todos os campos obrigatórios assinalados.'
        });
        return;
      }

      const novoEvento = {
        data: dataEvt,
        horaInicio: horaIni,
        horaFim: horaFim,
        tipo: tipoEvt,
        convidados: document.getElementById('qtdConvidados')?.value || '',
        aniversariante: document.getElementById('nomeAniversariante')?.value || '',
        idade: document.getElementById('idadeAniversariante')?.value || '',
        genero: document.getElementById('generoAniversariante')?.value || 'menino',
        tema: document.getElementById('temaFesta')?.value || '',
        cliente: nomeCli,
        telefone: telCli,
        local: document.getElementById('localEvento')?.value || '',
        obs: document.getElementById('obsEvento')?.value || ''
      };

      const eventos = obterEventos();
      const indiceEl = document.getElementById('indiceEventoEdicao');
      const idx = parseInt(indiceEl ? indiceEl.value : '-1', 10);

      const isEdicao = (idx >= 0 && idx < eventos.length);

      if (isEdicao) {
        eventos[idx] = novoEvento;
      } else {
        eventos.push(novoEvento);
      }

      eventos.sort((a, b) => new Date(`${a.data}T${a.horaInicio}`) - new Date(`${b.data}T${b.horaInicio}`));
      salvarEventos(eventos);

      fecharModalComLimpeza();

      // Limpa os campos de filtro
      ['filtroData', 'filtroHoraInicio', 'filtroHoraFim', 'filtroTexto'].forEach(id => {
        const elemento = document.getElementById(id);
        if (elemento) elemento.value = '';
      });
      const selTipo = document.getElementById('filtroTipo');
      if (selTipo) selTipo.value = 'todos';

      paginaAtual = 1;
      atualizarTelas();

      Swal.fire({
        icon: 'success',
        title: isEdicao ? 'Agendamento Atualizado!' : 'Agendamento Salvo!',
        text: 'O registro foi adicionado com sucesso na agenda.',
        timer: 1800,
        showConfirmButton: false
      });

    } catch (err) {
      console.error('Erro ao salvar evento:', err);
      Swal.fire({
        icon: 'error',
        title: 'Erro ao Salvar',
        text: err.message
      });
    }
  });

  // Disparo dos Filtros
  const aplicarFiltrosComResetPagina = () => {
    paginaAtual = 1;
    renderizarEventos();
  };

  document.getElementById('btnAplicarFiltro')?.addEventListener('click', aplicarFiltrosComResetPagina);
  document.getElementById('filtroData')?.addEventListener('input', aplicarFiltrosComResetPagina);
  document.getElementById('filtroHoraInicio')?.addEventListener('input', aplicarFiltrosComResetPagina);
  document.getElementById('filtroHoraFim')?.addEventListener('input', aplicarFiltrosComResetPagina);
  document.getElementById('filtroTipo')?.addEventListener('change', aplicarFiltrosComResetPagina);

  document.getElementById('filtroTexto')?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      aplicarFiltrosComResetPagina();
    }
  });

  // Botão Limpar Filtros
  document.getElementById('btnLimparFiltros')?.addEventListener('click', () => {
    ['filtroData', 'filtroHoraInicio', 'filtroHoraFim', 'filtroTexto'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.value = '';
    });
    const elTipo = document.getElementById('filtroTipo');
    if (elTipo) elTipo.value = 'todos';
    aplicarFiltrosComResetPagina();
  });

  // Renderização inicial
  renderizarEventos();
});