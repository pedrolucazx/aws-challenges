# AWS Challenges

Quatro desafios de código do curso "AWS - DIO", entregues aqui como projetos reais: código-fonte,
diagrama de arquitetura e evidência de execução (na AWS real ou no [Floci](https://floci.io), um
emulador AWS local, ver abaixo).

**Contexto**: esses desafios existem ao lado do projeto real que motivou o curso —
[**imm-api**](https://github.com/pedrolucazx/imm-api), um SaaS de hábitos/diário ("Inside My
Mind") que migrou sua infraestrutura de produção para a AWS. Os laboratórios abaixo se inspiram em
padrões reais desse projeto (lembretes de hábito, o Lambda real de upload de avatar), mas **nunca
tocam em nenhum recurso AWS de produção do IMM** — cada desafio usa recursos isolados, com nomes
próprios, criados e destruídos só para o laboratório.

## Desafios

| Pasta | Desafio DIO | Status |
|---|---|---|
| [`step-functions/`](./step-functions/) | Explorando Workflows Automatizados com AWS Step Functions | Construído, executado com sucesso na AWS — teardown pendente |
| [`cloudformation/`](./cloudformation/) | Implementando sua Primeira Stack com AWS CloudFormation | Ainda não iniciado |
| [`cloudformation-infra-automatizada/`](./cloudformation-infra-automatizada/) | Implementando Infraestrutura Automatizada com AWS CloudFormation | Ainda não iniciado |
| [`lambda-s3-object-lambda/`](./lambda-s3-object-lambda/) | Executando Tarefas Automatizadas com Lambda Function e S3 | Ainda não iniciado |

Cada pasta é autocontida: README explicando o desafio, código/template, diagrama de arquitetura e
prints/evidência de execução.

Os dois primeiros desafios (`step-functions/`, `cloudformation/`) rodam na conta AWS real: todo
comando `aws` ali é rodado manualmente, pelo dono do repositório, no próprio terminal — nenhum
agente de IA roda `aws` contra essa conta, nunca. Os dois desafios mais recentes
(`cloudformation-infra-automatizada/`, `lambda-s3-object-lambda/`) rodam contra o **Floci**, um
emulador AWS local e gratuito — escolha deliberada (custo zero, risco zero pra conta real, mesmo
valor de prática), não um downgrade. Ver `AGENTS.md` para a regra completa de quem pode rodar o
quê, em qual ambiente.
