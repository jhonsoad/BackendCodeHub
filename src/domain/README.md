# 🎯 Camada de Domínio (`src/domain`)

> **Responsabilidade Principal**: Representar o núcleo puro do sistema, contendo as entidades de negócio e as interfaces/contratos essenciais, totalmente isolados de frameworks e detalhes de infraestrutura.

---

## 📌 Visão Geral

A camada de **Domínio (Domain)** é o coração da **Clean Architecture**. Ela encapsula todas as regras e estruturas fundamentais do seu negócio.

Esta camada **não possui nenhuma dependência externa**. Ela não sabe se os dados vêm da API do Google, de um banco PostgreSQL, de um arquivo local ou da memória. O Domínio apenas define como os dados devem ser estruturados e quais contratos devem ser respeitados por quem for fornecer ou consumir esses dados.

---

## ⚙️ Princípios e Diretrizes

- **Independência Absoluta**: Não importa bibliotecas externas, drivers de banco de dados ou frameworks web.
- **Inversão de Dependência (DIP)**: O Domínio define a interface (contrato) que ele precisa; cabe às camadas externas implementá-la.
- **Estabilidade**: Sendo o núcleo da aplicação, é a camada que sofre menos alterações causadas por mudanças tecnológicas externas.

---

## 📂 Conteúdo da Camada

| Arquivo / Pasta | Tipo | Descrição |
| :--- | :--- | :--- |
| [`entities/Task.ts`](file:///c:/Users/jhona/Desktop/programacao/Projetos/BackendCodeHub/src/domain/entities/Task.ts) | Entidade | Representação pura e limpa da estrutura de uma Tarefa no sistema. |
| [`interfaces/ITasksProvider.ts`](file:///c:/Users/jhona/Desktop/programacao/Projetos/BackendCodeHub/src/domain/interfaces/ITasksProvider.ts) | Interface / Contrato | Contrato (Port) que define o método necessário para buscar tarefas (`fetchTasks`). |

---

## 🔍 Detalhamento dos Componentes

### 1. Entidade (`Task.ts`)
A **Entidade** representa a estrutura de dados pura que trafega no sistema:
```typescript
export interface Task {
  id: string;
  title: string;
  notes?: string;
  status: string;
}
```

### 2. Contrato (`ITasksProvider.ts`)
A **Interface** declara o contrato que os provedores de tarefas de infraestrutura devem cumprir:
```typescript
export interface ITasksProvider {
  fetchTasks(accessToken: string): Promise<Task[]>;
}
```
> 💡 *O Domínio diz: "Não me importa de onde as tarefas vêm (Google Tasks, Outlook, DB), desde que qualquer classe provedora implemente `fetchTasks` e me retorne uma lista de `Task`."*
