# API-Banco-Digital
Esta API foi criada com intuito de simular operações em um banco digital. Padrões **RESTful** foram seguidos para construção da mesma.

## Tecnologias Utilizadas
- Javascript
- Node.js
- Express
- date-fns
> nodemon está como dependencia de desenvolvimento neste projeto

## Preparação e Instalação
```
git clone http://link-clone.github

cd API-Banco-Digital

npm install
```
### Para rodar script
```
npm run dev
```

## Rotas disponiveis
### Get
- Listar Contas : `/contas?senha_banco=Cubos123Bank`
- Mostrar Saldo : `/contas/saldo?numero_conta=123&senha=123`
- Mostrar Extrato : `/contas/extrato?numero_conta=123&senha=123`

### Post
- Criar Conta : `/contas`
- Depositar : `/transacoes/depositar`
- Sacar : `/transacoes/sacar`
- Transferir : `/transacoes/transferir`

### Put
- Atualizar Usuario : `/contas/:numeroConta/usuario`

### Delete
- Excluir Usuario : `/contas/:numeroConta`

## Observações de requisições
Aqui estão as estruturas dos das requisições de Post e Put caso haja alguma dúvida.

**Criar Conta**
```
{
    "nome": "Miguel",
    "cpf": "00011122234",
    "data_nascimento": "2021-03-15",
    "telefone": "71999998888",
    "email": "foo@bar2.com",
    "senha": "12345"
}
```

**Atualizar Usuario**
```
{
    "nome": "Rodrigo",
    "cpf": "99911122234",
    "data_nascimento": "2021-03-15",
    "telefone": "71999998888",
    "email": "foo@bar3.com",
    "senha": "12345"
}
```
**Depositar**
```
{
	"numero_conta": "1",
	"valor": 1900
}
```

**Sacar**
```
{
	"numero_conta": "1",
	"valor": 1900,
    "senha": "123456"
}
```
**Transferir**
```
{
	"numero_conta_origem": "1",
	"numero_conta_destino": "2",
	"valor": 200,
	"senha": "123456"
}
```
