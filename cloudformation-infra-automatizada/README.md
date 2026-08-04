# Laboratório AWS CloudFormation — Infraestrutura Automatizada

Esta pasta é o entregável do desafio DIO "Implementando Infraestrutura Automatizada com AWS
CloudFormation". Diferente do primeiro desafio de CloudFormation deste repo (pasta
[`cloudformation/`](../cloudformation/), um stack único de S3+IAM+Lambda), este laboratório foca
no conceito de **automação de infraestrutura**: um template parametrizado, com Outputs exportados
para composição entre stacks, e um fluxo real de atualização via change set.

O padrão vem do [imm-api](https://github.com/pedrolucazx/imm-api), um SaaS de hábitos e diário —
a própria infra de rede do IMM (VPC, subnets, security groups) é gerenciada da mesma forma: um
template que aceita parâmetros diferentes por ambiente, em vez de templates hardcoded duplicados.
Este laboratório reproduz esse *padrão*, isolado, sem tocar nenhum recurso real do IMM.

## O Que Foi Construído

3 recursos de rede, parametrizados:

| Recurso | Logical ID | Tipo | Propósito |
|---|---|---|---|
| VPC | `LabVPC` | `AWS::EC2::VPC` | Rede isolada do laboratório |
| Subnet | `LabSubnet` | `AWS::EC2::Subnet` | Subnet dentro da `LabVPC` |
| Security Group | `LabSecurityGroup` | `AWS::EC2::SecurityGroup` | Regra de ingress inicial: porta 443, origem interna |

3 Parameters (`VpcCidr`, `SubnetCidr`, `SgIngressCidr` — todos com default, nenhum obrigatório) e
3 Outputs exportados (`VpcId`, `SubnetId`, `SecurityGroupId`), pra permitir que outra stack
referencie esses recursos via `Fn::ImportValue` sem acoplamento direto.

## Por que só 3 recursos (design ponytail)

Foi considerado e descartado adicionar um quarto recurso de compute (ex: uma instância EC2
placeholder) só pra bater mais de perto com a ideia de "VPC + subnet + SG + compute". Cortado: uma
instância EC2 exige AMI/key pair e não adiciona nenhum conceito novo de automação — só mais um
recurso do mesmo tipo de complexidade (uma referência cruzada simples). O que prova "automação de
infraestrutura" como conceito não é o número de recursos, é: parametrização real (o mesmo
template gera stacks diferentes por CIDR), outputs exportados pra composição, e o fluxo de change
set (plan → review → apply). Os 3 recursos + esses três elementos já demonstram isso com o menor
design possível.

## Arquivos do Repositório

| Arquivo | Propósito |
|---|---|
| [`template.yaml`](./template.yaml) | Template CloudFormation da stack |
| [`runbook.md`](./runbook.md) | Comandos de mutação (deploy/change-set/teardown) — só o Pedro roda |
| [`images/architecture.drawio`](./images/architecture.drawio) | Diagrama de arquitetura editável |
| [`images/architecture.png`](./images/architecture.png) | Diagrama exportado para revisão |

## Design

![Diagrama de arquitetura](./images/architecture.png)

O fluxo: `LabVPC` é criada a partir de `VpcCidr`; `LabSubnet` referencia `LabVPC` via `!Ref` e
recebe seu próprio CIDR (`SubnetCidr`); `LabSecurityGroup` também referencia `LabVPC`, com uma
regra de ingress inicial restrita a `SgIngressCidr` (interno por padrão, nunca `0.0.0.0/0`). Os
3 Outputs exportam os IDs pra composição futura entre stacks.

```text
VpcCidr -> LabVPC -> LabSubnet (SubnetCidr)
                  -> LabSecurityGroup (SgIngressCidr, porta 443)
```

## Sobre rodar em LocalStack (escolha deliberada, não um downgrade)

Este laboratório roda contra o [LocalStack](https://www.localstack.cloud/) (tier Hobby, gratuito)
em vez da AWS real — mesma decisão consciente do outro laboratório novo deste repo
(`lambda-s3-object-lambda/`), trocado do [Floci](https://floci.io/) especificamente por causa das
necessidades do desafio Lambda+S3 (ver aquele README). CloudFormation em si funciona igualmente
bem nas duas ferramentas — confirmado via `validate-template` rodado direto contra ambas durante o
desenvolvimento. Nenhum comando de mutação (`create-stack`, `update-stack`, `delete-stack`,
`execute-change-set`) foi executado por um agente de IA em nenhum momento — todos estão
documentados em [`runbook.md`](./runbook.md) e foram rodados manualmente pelo autor, no próprio
terminal.

## Deploy

<!-- Preenchido após T007/T008: StackStatus, Outputs (VpcId/SubnetId/SecurityGroupId) -->

## Change Set

<!-- Preenchido após T011/T012: diff do change set, resultado do execute -->

## Teardown

<!-- Preenchido após T014: data exata e confirmação de que o stack não existe mais -->
