# AWS Challenges

Dois desafios de código do curso "AWS - DIO", entregues aqui como projetos reais: código-fonte,
diagrama de arquitetura e evidência de execução real na AWS.

**Contexto**: esses desafios existem ao lado do projeto real que motivou o curso —
[**imm-api**](https://github.com/pedrolucazx/imm-api), um SaaS de hábitos/diário ("Inside My
Mind") que migrou sua infraestrutura de produção para a AWS. Os dois laboratórios abaixo se
inspiram em padrões reais desse projeto (lembretes de hábito, o Lambda real de upload de avatar),
mas **nunca tocam em nenhum recurso AWS de produção do IMM** — cada desafio usa recursos isolados,
com nomes próprios, criados e destruídos só para o laboratório.

## Desafios

| Pasta | Desafio DIO | Status |
|---|---|---|
| [`step-functions/`](./step-functions/) | Explorando Workflows Automatizados com AWS Step Functions | Construído, executado com sucesso na AWS — teardown pendente |
| [`cloudformation/`](./cloudformation/) | Implementando sua Primeira Stack com AWS CloudFormation | Ainda não iniciado |

Cada pasta é autocontida: README explicando o desafio, código/template, diagrama de arquitetura e
prints de evidência de execução real.

**A regra que mais importa**: todo comando `aws` (deploy, verificação ou teardown) é documentado
para ser rodado manualmente, pelo dono do repositório, no próprio terminal — nenhum agente de IA
roda comandos AWS, mutáveis ou somente leitura, em nenhuma etapa.
