const express = require('express');
const operacoes = require('./controladores/modificacoesEmConta');
const rota = express();

rota.get('/contas', operacoes.listarContas);
rota.post('/contas', operacoes.criarConta);
rota.put('/contas/:numeroConta/usuario', operacoes.atualizarConta);
rota.delete('/contas/:numeroConta', operacoes.excluirConta);

rota.post('/transacoes/depositar', operacoes.depositar);
rota.post('/transacoes/sacar', operacoes.sacar);
rota.post('/transacoes/transferir', operacoes.transferir);

rota.get('/contas/saldo', operacoes.mostrarSaldo);
rota.get('/contas/extrato', operacoes.extrato);

module.exports = rota
