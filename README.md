# 📸 Agenda de Ensaios & Eventos Fotográficos

Aplicação web do tipo Single Page Application (SPA) concebida para fotógrafos gerirem a rotina de agendamentos de ensaios externos, coberturas de festas de aniversário, formaturas e eventos corporativos de forma prática, rápida e portátil.

---

## 🚀 Funcionalidades Principais

* **Visualização Dupla:**
  * **Modo Lista (Tabela Administrativa):** Apresentação tabular com paginação dinâmica (10 itens por página), contador de registos e botões de ação rápida.
  * **Grade Mensal (Calendário):** Calendário visual interativo com etiquetas coloridas por categoria e atalho para criar eventos clicando diretamente no dia pretendido.
* **Sistema de Filtros Abrangente:**
  * Filtro por data exata (dia/mês/ano).
  * Intervalo de horário (início e término).
  * Categoria / Tipo de cobertura fotográfica.
  * Busca textual em tempo real por nome do contratante, aniversariante, tema da festa ou local.
* **Integrações e Ferramentas Práticas:**
  * **WhatsApp Direct:** Geração automática de resumo do agendamento pronto a ser enviado com um clique para confirmação de detalhes com o cliente.
  * **Google Calendar:** Atalho que preenche os dados do trabalho diretamente no calendário pessoal.
  * **Geração de Contrato em PDF:** Criação instantânea de ordem de serviço e contrato de prestação de serviços pronta para impressão ou partilha digital.
* **Persistência e Segurança de Dados:**
  * Armazenamento local no navegador via `localStorage` (funciona 100% offline).
  * **Exportação e Importação de Backup:** Descarregamento e restauro integral da base de dados através de ficheiros estruturados em formato `.json`.
* **Interface Moderna:** Diálogos visuais e confirmações de ações integrados com a biblioteca `SweetAlert2`.

---

## 🛠️ Tecnologias Utilizadas

* **HTML5:** Estruturação semântica da aplicação.
* **CSS3 & Bootstrap 5 (v5.3.3):** Estilização, layout responsivo e janelas modais.
* **Bootstrap Icons (v1.11.3):** Biblioteca de ícones utilitários.
* **JavaScript (Vanilla / ES6+):** Lógica de negócios, ordenação, paginação e manipulação do DOM sem necessidade de frameworks pesados.
* **SweetAlert2 (v11):** Notificações e janelas de confirmação elegantes.
* **html2pdf.js (v0.10.1):** Conversão de templates HTML em documentos PDF para contratos.

---

## 📂 Estrutura de Ficheiros

```text
agenda-eventos-augustophottos/
│
├── css/
│   └── style.css            # Estilos personalizados e grelha do calendário
│
├── js/
│   └── app.js               # Lógica de CRUD, filtros, paginação e exportação
│
├── backup_agenda_fotografo_*.json # Ficheiro de exemplo/backup estruturado
├── index.html               # Estrutura principal da página (Single Page)
└── README.md                # Documentação técnica do projeto

## 🎨 Código de Cores da Grade Mensal

Na visualização de calendário, as categorias são distinguidas automaticamente por cores:

* 🔵 **Azul** (`bg-primary`): Aniversários (Infantil, Teen e Adulto).
* 🟡 **Amarelo** (`bg-warning`): Ensaios Fotográficos (Externos, Estúdio, Gestante, Casal).
* 🟢 **Verde** (`bg-success`): Formaturas.
* ⚪ **Cinzento** (`bg-secondary`): Outros Eventos e Corporativo.
