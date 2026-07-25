# 🧩 Camada de Aplicação (`src/application`)

> **Responsabilidade Principal**: Orquestrar o fluxo de dados e executar os Casos de Uso (Use Cases) do sistema, conectando as regras de negócio do Domínio aos contratos de serviços sem se acoplar a tecnologias externas.

---

## 📌 Visão Geral

A camada de **Aplicação (Application)** é a "maestra" do sistema. É aqui que definimos as intenções e ações que a aplicação pode realizar (ex: *"Buscar tarefas do usuário"*).

Os **Casos de Uso (Use Cases)** contêm a lógica de orquestração do fluxo. Eles recebem as dependências (como os provedores de dados) via **Injeção de Dependência**, garantindo que a aplicação permaneça 100% isolada e altamente testável através de mocks.

---

## ⚙️ Princípios e Diretrizes

- **Orquestração de Fluxo**: Executa os passos necessários para realizar uma operação de negócio.
- **Injeção de Dependência**: Recebe contratos (interfaces do Domínio) via construtor, sem instanciar classes de infraestrutura diretamente.
- **Isolamento de Frameworks**: Não contém lógica de HTTP, requisições Fastify, SQL ou SDKs de terceiros.
- **Testabilidade Simplificada**: Pode ser testada facilmente em testes unitários simulando as interfaces com dados falsos (mocks).

---

## 📂 Conteúdo da Camada

| Arquivo / Pasta | Tipo | Descrição |
| :--- | :--- | :--- |
| [`GetTasksUseCase.ts`](file:///c:/Users/jhona/Desktop/programacao/Projetos/BackendCodeHub/src/application/GetTasksUseCase.ts) | Caso de Uso (Use Case) | Orquestra o recebimento do token, validação da presença do token e busca de tarefas via `ITasksProvider`. |

---

## 🔍 Detalhamento dos Componentes

### 1. Caso de Uso (`GetTasksUseCase.ts`)
O `GetTasksUseCase` exige uma implementação do contrato `ITasksProvider` ao ser instanciado:

- **Construtor**: Recebe `private tasksProvider: ITasksProvider`.
- **Método `execute(accessToken: string)`**:
  1. Valida se o token de acesso foi informado.
  2. Chama `this.tasksProvider.fetchTasks(accessToken)` confiando no contrato.
  3. Retorna a lista de tarefas formatada (onde é possível aplicar regras adicionais de ordenação ou filtragem).

---

## 🔄 Fluxo de Funcionamento

```
[Controller HTTP] 
      │
      ▼ (chama .execute(token))
[GetTasksUseCase] ──(exige contrato)──► [ITasksProvider (Interface)]
                                               ▲
                                               │ (implementado por)
                                       [GoogleTasksProvider (Infra)]
```
