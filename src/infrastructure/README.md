# 🛠️ Camada de Infraestrutura (`src/infrastructure`)

> **Responsabilidade Principal**: Lidar com os detalhes de baixo nível e integrações externas (comunicação com APIs de terceiros, bancos de dados, rede e inicialização do servidor).

---

## 📌 Visão Geral

A camada de **Infraestrutura (Infrastructure)** situa-se na borda da **Clean Architecture**. É nesta camada que o sistema "suja as mãos" interagindo com o mundo externo.

É aqui que implementamos os contratos definidos na camada de Domínio. Se o Domínio exige um `ITasksProvider`, a Infraestrutura fornece o `GoogleTasksProvider`, que faz requisições HTTP reais para a API do Google.

---

## ⚙️ Princípios e Diretrizes

- **Implementação Concreta de Contratos**: Converte os requisitos declarados no Domínio em chamadas técnicas reais (Fetch, Axios, ORMs, etc.).
- **Adaptação de Dados**: Transforma dados brutos retornados por serviços externos (como JSONs da API do Google) em Entidades puras do Domínio (`Task`).
- **Isolamento de Mudanças**: Caso a API do Google mude ou o sistema passe a usar o Microsoft To-Do ou banco de dados local, apenas esta camada precisa ser alterada ou expandida.

---

## 📂 Conteúdo da Camada

| Arquivo / Pasta | Tipo | Descrição |
| :--- | :--- | :--- |
| [`providers/GoogleTasksProvider.ts`](file:///c:/Users/jhona/Desktop/programacao/Projetos/BackendCodeHub/src/infrastructure/providers/GoogleTasksProvider.ts) | Provedor (Adapter) | Implementa `ITasksProvider` fazendo chamadas HTTP para a API do Google Tasks e mapeando a resposta. |

---

## 🔍 Detalhamento dos Componentes

### 1. Provedor Google Tasks (`GoogleTasksProvider.ts`)
Implementa a interface `ITasksProvider` do Domínio:
- Faz a chamada HTTP com `fetch()` para o endpoint `https://tasks.googleapis.com/tasks/v1/lists/@default/tasks`.
- Passa o `Authorization: Bearer <accessToken>` no cabeçalho.
- Trata erros de requisição HTTP (ex: token inválido ou erro da API).
- Mapeia o array `items` retornado pelo Google para o formato limpo da entidade `Task` do Domínio.
