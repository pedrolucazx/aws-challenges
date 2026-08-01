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
