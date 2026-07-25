# 🚀 BackendCodeHub

> API Node.js desenvolvida em **TypeScript** e **Fastify**, aplicando os princípios da **Clean Architecture** (Arquitetura Limpa) para consumir tarefas através da integração com o **Google Tasks API**.

---

## 📌 Sobre o Projeto

O **BackendCodeHub** é um projeto de demonstração e estudo focado em boas práticas de engenharia de software, separação de responsabilidades, testabilidade e desacoplamento de código.

O objetivo principal da aplicação é permitir o resgate e gerenciamento de tarefas do usuário via HTTP, abstraindo os detalhes técnicos do provedor externo (Google Tasks) de modo que a regra de negócio permaneça intacta e independente.

---

## 🏛️ Arquitetura do Sistema (Clean Architecture)

A estrutura do projeto é dividida em **4 camadas bem definidas**, onde o fluxo de dependência aponta sempre de fora para dentro (em direção ao Domínio):

```
                       ┌────────────────────────────────┐
                       │   Presentation (Controllers)   │
                       └───────────────┬────────────────┘
                                       │
                                       ▼
                       ┌────────────────────────────────┐
                       │   Application (Use Cases)      │
                       └───────────────┬────────────────┘
                                       │
                                       ▼
                       ┌────────────────────────────────┐
                       │        Domain (Entidades)      │
                       └───────────────▲────────────────┘
                                       │ (Implementa Contrato)
                       ┌───────────────┴────────────────┐
                       │  Infrastructure (Providers)    │
                       └────────────────────────────────┘
```

### 📂 Guia das Camadas e Documentação

Clique nos links abaixo para acessar a documentação detalhada de cada camada do projeto:

| Camada | Ícone | Descrição | Documentação |
| :--- | :---: | :--- | :--- |
| **Domain** | 🎯 | **Núcleo do Sistema**: Entidades puras e contratos (interfaces). Não possui dependências externas. | [📂 `src/domain`](file:///c:/Users/jhona/Desktop/programacao/Projetos/BackendCodeHub/src/domain/README.md) |
| **Application** | 🧩 | **Casos de Uso**: Maestro que orquestra o fluxo de dados e regras de negócio da aplicação. | [📂 `src/application`](file:///c:/Users/jhona/Desktop/programacao/Projetos/BackendCodeHub/src/application/README.md) |
| **Infrastructure** | 🛠️ | **Mundo Externo**: Implementação concreta das interfaces (ex: API do Google Tasks via Fetch). | [📂 `src/infrastructure`](file:///c:/Users/jhona/Desktop/programacao/Projetos/BackendCodeHub/src/infrastructure/README.md) |
| **Presentation** | 🌐 | **Borda HTTP**: Controllers Fastify que tratam requisições, headers, status HTTP e respostas JSON. | [📂 `src/presentation`](file:///c:/Users/jhona/Desktop/programacao/Projetos/BackendCodeHub/src/presentation/README.md) |

---

## 🔄 Fluxo de Injeção de Dependência (Composition Root)

O arquivo [`src/server.ts`](file:///c:/Users/jhona/Desktop/programacao/Projetos/BackendCodeHub/src/server.ts) atua como o **Composition Root**, conectando as peças do sistema do nível mais externo ao mais interno:

```typescript
// 1. Instancia a Infraestrutura (Google Tasks Provider)
const googleTasksProvider = new GoogleTasksProvider();

// 2. Injeta a Infraestrutura no Caso de Uso da Aplicação
const getTasksUseCase = new GetTasksUseCase(googleTasksProvider);

// 3. Injeta o Caso de Uso no Controlador de Apresentação
const taskController = new TaskController(getTasksUseCase);

// 4. Registra a rota HTTP no Fastify
app.get('/tasks', taskController.handle.bind(taskController));
```

---

## 🔌 API Endpoints

### `GET /tasks`
Busca a lista de tarefas do usuário no Google Tasks.

- **Headers Necessários**:
  ```http
  Authorization: Bearer <SEU_ACCESS_TOKEN_DO_GOOGLE>
  ```
- **Resposta de Sucesso (`200 OK`)**:
  ```json
  [
    {
      "id": "task_123",
      "title": "Minha Tarefa Exemplo",
      "notes": "Descrição da tarefa",
      "status": "needsAction"
    }
  ]
  ```
- **Respostas de Erro**:
  - `401 Unauthorized`: Token ausente ou malformado.
  - `400 Bad Request`: Token expirado ou rejeitado pela API do Google.

---

## 🚀 Como Executar o Projeto

### Pré-requisitos
- **Node.js** (versão 18 ou superior)
- Gerenciador de pacotes **npm**

### Passo a Passo

1. **Instalar dependências**:
   ```bash
   npm install
   ```

2. **Executar o ambiente de desenvolvimento**:
   ```bash
   npm run dev
   ```

3. O servidor estará rodando em: `http://localhost:3000`

---

## 🛠️ Tecnologias Utilizadas

- **TypeScript**: Superset JavaScript com tipagem estática.
- **Fastify**: Framework web de alta performance para Node.js.
- **tsx**: Executa scripts TypeScript diretamente em modo watch durante o desenvolvimento.
- **Clean Architecture / Hexagonal Architecture**: Padrão arquitetural focado no desacoplamento.
