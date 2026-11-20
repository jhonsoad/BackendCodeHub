import Fastify from "fastify";
import cors from "@fastify/cors";
import { GoogleTasksProvider } from "./infrastructure/providers/GoogleTasksProvider.js";
import { GetTasksUseCase } from "./application/use-cases/get-tasks-use-case/GetTasksUseCase.js";
import { TaskController } from "./presentation/controllers/TaskController.js";
import { CreateTaskUseCase } from "./application/use-cases/create-tasks-use-case/CreateTasksUseCase.js";

const app = Fastify({ logger: true });

// Registrar e configurar o CORS
app.register(cors, {
  origin: [
    "http://localhost:4200",
    "https://d2ad3u3d9d20vp.cloudfront.net",
  ],
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"], // Libera envio do token de autorização
});

// 1. Instanciamos a Infraestrutura (o mundo externo)
const googleTasksProvider = new GoogleTasksProvider();

// 2. Injetamos o Provider na Aplicação (Use Case)
const getTasksUseCase = new GetTasksUseCase(googleTasksProvider);

// (Caso use a mesma classe de Controller, injete lá também)
const createTaskUseCase = new CreateTaskUseCase(googleTasksProvider);

// 3. Injetamos o Use Case na Apresentação (Controller)
const taskController = new TaskController(getTasksUseCase, createTaskUseCase);

// 4. Conectamos a rota do Fastify ao nosso Controller.
// O ".bind(taskController)" é necessário para o JavaScript não perder o contexto da classe.
app.get("/tasks", taskController.handle.bind(taskController));

app.post("/tasks", taskController.create.bind(taskController));

const start = async () => {
  try {
    const port = Number(process.env.PORT) || 3000;
    await app.listen({ port, host: "0.0.0.0" });
    console.log(`🚀 Servidor rodando na porta ${port}`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

start();
