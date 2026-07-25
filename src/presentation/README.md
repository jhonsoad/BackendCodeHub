# 🌐 Camada de Apresentação (`src/presentation`)

> **Responsabilidade Principal**: Atuar como tradutora entre o protocolo web HTTP (Fastify/Express) e a lógica da aplicação, recebendo requisições, extraindo parâmetros e retornando respostas formatadas.

---

## 📌 Visão Geral

A camada de **Apresentação (Presentation)** é responsável pelo ponto de entrada da aplicação para os clientes externos (como um frontend Angular, React ou aplicativo móvel).

Ela entende conceitos de Web como métodos HTTP (GET, POST), status codes (200, 401, 400), cabeçalhos `Authorization` e payloads JSON. Ela traduz essas informações da web para chamar os **Casos de Uso** e envia o resultado de volta no formato apropriado.

---

## ⚙️ Princípios e Diretrizes

- **Responsabilidade Única do Controller**:
  1. Extrair os dados da requisição HTTP (headers, query, params, body).
  2. Repassar a chamada para a camada de Aplicação (`GetTasksUseCase`).
  3. Devolver a resposta HTTP com os dados ou mensagens de erro tratadas.
- **Sem Lógica de Negócio**: Não realiza processamento pesado de dados ou regras de negócio; apenas coordena o fluxo de comunicação HTTP.

---

## 📂 Conteúdo da Camada

| Arquivo / Pasta | Tipo | Descrição |
| :--- | :--- | :--- |
| [`controllers/TaskController.ts`](file:///c:/Users/jhona/Desktop/programacao/Projetos/BackendCodeHub/src/presentation/controllers/TaskController.ts) | Controlador HTTP | Recebe a requisição Fastify, extrai o Bearer token, executa o Use Case e responde em JSON. |

---

## 🔍 Detalhamento dos Componentes

### 1. Controlador de Tarefas (`TaskController.ts`)
O `TaskController` é instanciado recebendo o `GetTasksUseCase` via injeção de dependência:

1. **Validação do Token**: Verifica se o cabeçalho `Authorization` no formato `Bearer <token>` foi enviado.
2. **Execução**: Invoca `getTasksUseCase.execute(accessToken)`.
3. **Respostas HTTP**:
   - `200 OK`: Retorna a lista de tarefas em formato JSON.
   - `401 Unauthorized`: Retorna erro caso o token esteja ausente ou inválido.
   - `400 Bad Request`: Captura eventuais exceções ocorridas durante o processo.
