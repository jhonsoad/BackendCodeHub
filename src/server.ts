import Fastify from 'fastify';
import { GoogleTasksProvider } from './infrastructure/providers/GoogleTasksProvider.js';
import { GetTasksUseCase } from './application/GetTasksUseCase.js';
import { TaskController } from './presentation/controllers/TaskController.js';


const app = Fastify({ logger: true });

// 1. Instanciamos a Infraestrutura (o mundo externo)
const googleTasksProvider = new GoogleTasksProvider();

// 2. Injetamos o Provider na Aplicação (Use Case)
const getTasksUseCase = new GetTasksUseCase(googleTasksProvider);

// 3. Injetamos o Use Case na Apresentação (Controller)
const taskController = new TaskController(getTasksUseCase);

// 4. Conectamos a rota do Fastify ao nosso Controller.
// O ".bind(taskController)" é necessário para o JavaScript não perder o contexto da classe.
app.get('/tasks', taskController.handle.bind(taskController));

const start = async () => {
  try {
    await app.listen({ port: 3000 });
    console.log('🚀 Servidor rodando em http://localhost:3000');
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

start();