# Laboratório AWS Step Functions — Lembretes de Hábito

Esta pasta é o entregável do desafio DIO "Explorando Workflows Automatizados com AWS Step
Functions". Ela documenta um workflow real do Step Functions que orquestra duas funções Lambda em
torno de uma tabela DynamoDB, usando como exemplo um pipeline fictício de lembrete de hábitos.

O tema vem do [imm-api](https://github.com/pedrolucazx/imm-api), um SaaS de hábitos e diário. O
IMM torna o laboratório mais concreto: produtos reais precisam de workflows em segundo plano que
encontrem hábitos ou lembretes de diário pendentes e disparem notificações. Este desafio copia só
esse conceito — não chama, lê, faz deploy em, ou depende de nenhum recurso AWS real do IMM.

## O Que Foi Construído

O workflow do laboratório usa estes recursos isolados, com prefixo `aws-challenges-*`:

| Recurso | Nome no laboratório | Propósito |
|---|---|---|
| Tabela DynamoDB | `aws-challenges-habit-reminders` | Guarda um item fake de lembrete pendente |
| Lambda | `aws-challenges-check-due-habits` | Busca lembretes onde `dueToday = true` |
| Lambda | `aws-challenges-notify-mock` | Loga a notificação que seria enviada |
| State machine (Step Functions) | `aws-challenges-habit-reminder` | Orquestra os dois Lambdas |

Todos os dados de exemplo são fictícios, incluindo `demo-reminder-1` e `demo-user-1`. Nenhuma
tabela, Lambda, role IAM, identidade SES, usuário, hábito, entrada de diário, ARN ou estado de
conta do IMM é tocado.

## Arquivos do Repositório

| Arquivo | Propósito |
|---|---|
| [`state-machine.asl.json`](./state-machine.asl.json) | Definição em Amazon States Language |
| [`lambdas/check-due-habits/index.mjs`](./lambdas/check-due-habits/index.mjs) | Primeiro estado (Lambda) |
| [`lambdas/notify-mock/index.mjs`](./lambdas/notify-mock/index.mjs) | Segundo estado (Lambda) |
| [`images/architecture.drawio`](./images/architecture.drawio) | Diagrama de arquitetura editável |
| [`images/architecture.png`](./images/architecture.png) | Diagrama exportado para revisão |

## Design

![Diagrama de arquitetura](./images/architecture.png)

A state machine começa em `CheckDueHabits`. Esse Lambda lê a tabela DynamoDB (isolada do
laboratório) e retorna um array `dueReminders` com os lembretes pendentes no dia.

O workflow então passa esse array para `NotifyMock`. Esse Lambda deliberadamente não envia
e-mail, push, nem qualquer notificação real do IMM — ele loga mensagens como "would notify
demo-user-1 about Drink water" e retorna a contagem de notificações simuladas.

Se `CheckDueHabits` não conseguir consultar o DynamoDB, ele lança uma exceção. A state machine
captura essa falha e roteia para `HandleFailure`, deixando o caminho de falha visível no Step
Functions em vez de escondido num log de Lambda.

Caminho de sucesso:

```text
DynamoDB -> CheckDueHabits -> Step Functions -> NotifyMock -> Success
```

Caminho de falha:

```text
CheckDueHabits -> HandleFailure
```

## Evidência de Execução

Todo comando `aws` de deploy/execução/teardown foi rodado manualmente pelo dono do repositório, no
próprio terminal.

| Campo | Valor |
|---|---|
| ARN da state machine | `arn:aws:states:us-east-1:431715654897:stateMachine:aws-challenges-habit-reminder` |
| ARN da execução | `arn:aws:states:us-east-1:431715654897:execution:aws-challenges-habit-reminder:11f5ae3a-a657-4a6f-aa8f-b1efaf087ef9` |
| Data da execução | 2026-08-01 |
| Screenshot (sucesso) | [`images/execution-success.png`](./images/execution-success.png) |
| Screenshot (falha, edge case) | [`images/execution-failure.png`](./images/execution-failure.png) |
| Custo observado | Desprezível — uma execução Standard, duas invocações Lambda, DynamoDB on-demand, sem capacidade ociosa |

Uma tentativa de execução anterior (antes do fix de IAM abaixo) falhou com `AccessDeniedException`
e roteou corretamente pelo bloco `Catch` até `HandleFailure` — evidência real do edge case, não só
narrada.

**Bug capturado durante a execução real**: a policy IAM original de
`aws-challenges-lambda-role` concedia `dynamodb:Query`, mas `check-due-habits` filtra por
`dueToday`, um atributo que não é chave (só `reminderId` é, sem GSI) — isso exige `Scan`, não
`Query`. Corrigido; a role já criada precisou de um `put-role-policy` de acompanhamento para
alinhar.

## Teardown

Pendente — a ser feito no mesmo dia da evidência acima, apagando a state machine, os dois Lambdas,
a tabela DynamoDB e as duas roles IAM (`aws-challenges-lambda-role`,
`aws-challenges-states-role`). O estado final exigido é zero recursos `aws-challenges-*`
remanescentes deste laboratório.
