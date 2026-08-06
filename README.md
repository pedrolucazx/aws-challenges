# AWS Challenges

Quatro desafios de código do curso "AWS - DIO", entregues aqui como projetos reais: código-fonte,
diagrama de arquitetura e evidência de execução (na AWS real e/ou no [LocalStack](https://www.localstack.cloud/),
um emulador AWS local, ver abaixo).

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
| [`cloudformation/`](./cloudformation/) | Implementando sua Primeira Stack com AWS CloudFormation | Construído, executado com sucesso na AWS real e no LocalStack |
| [`cloudformation-infra-automatizada/`](./cloudformation-infra-automatizada/) | Implementando Infraestrutura Automatizada com AWS CloudFormation | Construído, executado com sucesso no LocalStack |
| [`lambda-s3-object-lambda/`](./lambda-s3-object-lambda/) | Executando Tarefas Automatizadas com Lambda Function e S3 | Construído, executado com sucesso no LocalStack |

Cada pasta é autocontida: README explicando o desafio, código/template, diagrama de arquitetura e
prints/evidência de execução.

`step-functions/` roda só na conta AWS real: todo comando `aws` ali é rodado manualmente, pelo dono
do repositório, no próprio terminal — nenhum agente de IA roda `aws` contra essa conta, nunca.
`cloudformation/` rodou primeiro na AWS real e depois também no LocalStack. Os dois desafios mais
recentes (`cloudformation-infra-automatizada/`, `lambda-s3-object-lambda/`) rodam só contra o
**LocalStack**, um emulador AWS local — escolha deliberada (custo zero, risco zero pra conta real,
mesmo valor de prática), não um downgrade. Ver `AGENTS.md` para a regra completa de quem pode rodar
o quê, em qual ambiente.
