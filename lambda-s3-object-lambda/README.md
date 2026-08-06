# Laboratório AWS Lambda + S3: Tarefas Automatizadas

Esta pasta é o entregável do desafio DIO "Executando Tarefas Automatizadas com Lambda Function e
S3". O padrão ensinado no curso é simples: upload num bucket S3 dispara uma Lambda, que processa o
arquivo e registra o resultado no DynamoDB.

**Espelha o fluxo real de upload de avatar do IMM** ([imm-api](https://github.com/pedrolucazx/imm-api),
ver `docs/aws-modulo-6-7-storage-lambda.md` do repo `inside-my-mind`):

- Em produção, o IMM já tem uma Lambda (`imm-api/lambda/presigned-url`) que gera uma URL assinada
  pra o cliente fazer upload direto no S3, na key `avatars/<userId>.<ext>` (jpg/png/webp, até 5MB)
- Esse laboratório assume esse mesmo upload como ponto de partida (cliente e presigned URL ficam
  fora de escopo aqui) e adiciona a etapa seguinte: uma Lambda que dispara quando o objeto chega no
  bucket, valida o content-type, calcula um hash SHA-256 do conteúdo, e grava um registro de
  auditoria no DynamoDB

Essa etapa de auditoria pós-upload não existe na produção real do IMM hoje. É uma extensão honesta
do pipeline existente, no espírito do que o desafio pede.

A aula também ensina a expor uma consulta via API Gateway na frente da Lambda (o material oficial
usa um exemplo genérico de notas fiscais). Esse laboratório aplica o mesmo passo sobre o
`AvatarAuditTable`: uma segunda função, só leitura, devolve o registro de auditoria de um avatar
por HTTP.

## O Que Foi Construído

10 recursos:

| Recurso | Logical ID | Tipo | Propósito |
|---|---|---|---|
| Bucket de avatares | `AvatarsBucket` | `AWS::S3::Bucket` | Recebe uploads em `avatars/<userId>.<ext>` |
| Tabela de auditoria | `AvatarAuditTable` | `AWS::DynamoDB::Table` | Um item por avatar processado |
| Role da função de processamento | `ProcessAvatarFunctionRole` | `AWS::IAM::Role` | Least privilege: `s3:GetObject` no prefixo, `dynamodb:PutItem` na tabela, logs |
| Função de processamento | `ProcessAvatarFunction` | `AWS::Lambda::Function` | Dispara em `s3:ObjectCreated`, valida, calcula hash, grava no DynamoDB |
| Permissão de invocação (S3) | `ProcessAvatarInvokePermission` | `AWS::Lambda::Permission` | Autoriza o S3 a invocar a função de processamento |
| Role da função de consulta | `GetAvatarAuditFunctionRole` | `AWS::IAM::Role` | Least privilege: só `dynamodb:GetItem` na tabela, logs |
| Função de consulta | `GetAvatarAuditFunction` | `AWS::Lambda::Function` | Lê um item do `AvatarAuditTable` por `avatarKey` |
| API REST | `AuditApi` + `AuditResource` + `AuditKeyResource` | `AWS::ApiGateway::*` | Expõe `GET /audit/{avatarKey+}` |
| Método GET | `AuditGetMethod` + `AuditApiDeployment` | `AWS::ApiGateway::*` | Integração `AWS_PROXY` com a função de consulta |
| Permissão de invocação (API) | `AuditApiInvokePermission` | `AWS::Lambda::Permission` | Autoriza o API Gateway a invocar a função de consulta |

**Nota de design**: `AvatarsBucket` tem `BucketName` fixo (não gerado) e a `ProcessAvatarInvokePermission`
referencia esse nome via string, não via `!GetAtt AvatarsBucket`. Isso evita uma dependência
circular entre o bucket (que precisa da permissão pronta antes de aceitar a notification config) e
a permissão (que precisaria do bucket pronto para pegar o ARN). É a mesma classe de bug que travou
o `create-stack` no laboratório de CloudFormation (`cloudformation-infra-automatizada/`), corrigida
aqui de propósito antes de acontecer.

4 Outputs exportados (`AvatarsBucketName`, `ProcessAvatarFunctionArn`, `AvatarAuditTableName`,
`AuditApiId`).

## Arquivos do Repositório

| Arquivo | Propósito |
|---|---|
| [`template.yaml`](./template.yaml) | Template CloudFormation da stack |
| [`lambdas/process-avatar/`](./lambdas/process-avatar/) | Handler testável (ESM) + teste do processamento (S3 → DynamoDB) |
| [`lambdas/get-avatar-audit/`](./lambdas/get-avatar-audit/) | Handler testável (ESM) + teste da consulta (API Gateway → DynamoDB) |
| [`images/architecture.drawio`](./images/architecture.drawio) | Diagrama de arquitetura editável |
| [`images/architecture.png`](./images/architecture.png) | Diagrama exportado |

## Design

![Diagrama de arquitetura](./images/architecture.png)

Um objeto chega em `avatars/<userId>.<ext>` no `AvatarsBucket`. O evento `s3:ObjectCreated`
(filtrado no prefixo `avatars/`) dispara `ProcessAvatarFunction`, que lê o objeto de volta
(`GetObject`), confere se o content-type é um dos aceitos (mesmos tipos do Lambda real de
presigned URL: jpeg, png, webp), calcula o SHA-256 do conteúdo, e grava um item no
`AvatarAuditTable` com key, usuário, content-type, tamanho, hash e timestamp.

Pra consultar esse registro, `AuditApi` expõe `GET /audit/{avatarKey+}`, integrado via `AWS_PROXY`
com `GetAvatarAuditFunction`, que só tem permissão de leitura (`dynamodb:GetItem`) na tabela.

## Sobre rodar em LocalStack

Este laboratório roda contra o [LocalStack](https://www.localstack.cloud/) (tier Hobby, gratuito)
em vez da AWS real, mesma decisão consciente do outro laboratório novo deste repo
(`cloudformation-infra-automatizada/`). A vantagem é clara: iteração rápida, sem custo e sem risco
de cobrança real da AWS.

## Como Rodar

```bash
cp .env.example .env   # preenche o LOCALSTACK_AUTH_TOKEN (raiz do repo, veja .env.example)

export AWS_ENDPOINT_URL=http://localhost:4566
export AWS_ACCESS_KEY_ID=test
export AWS_SECRET_ACCESS_KEY=test
export AWS_DEFAULT_REGION=us-east-1

docker compose up -d localstack   # sobe o LocalStack (docker-compose.yml na raiz do repo)

aws cloudformation create-stack \
  --stack-name aws-challenges-lambda-s3 \
  --template-body file://lambda-s3-object-lambda/template.yaml \
  --capabilities CAPABILITY_IAM

aws cloudformation wait stack-create-complete \
  --stack-name aws-challenges-lambda-s3
```

Depois de um upload em `avatars/<userId>.<ext>`, consulta o registro de auditoria (troca `<api-id>`
pelo valor do output `AuditApiId`):

```bash
curl "http://localhost:4566/restapis/<api-id>/dev/_user_request_/audit/avatars/<userId>.<ext>"
```

Teardown, quando quiser encerrar:

```bash
aws cloudformation delete-stack --stack-name aws-challenges-lambda-s3
aws cloudformation wait stack-delete-complete --stack-name aws-challenges-lambda-s3
```
