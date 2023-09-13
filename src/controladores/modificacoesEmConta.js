const cubosBanco = require('../bancodedados');
const { format } = require('date-fns');

let numeroId = cubosBanco.contas.length


const verificarPropriedades = (propriedades) => {
    const { nome, cpf, data_nascimento, telefone, email, senha } = propriedades
    if (!nome || !cpf || !data_nascimento || !telefone || !email || !senha) {
        return false
    }
    return true
}

const verificarUnicaPropriedade = (propriedade) => {
    const verificacaoEmail = cubosBanco.contas.find((conta) => conta.usuario.email === propriedade);
    const verificacaoCpf = cubosBanco.contas.find((conta) => conta.usuario.cpf === propriedade);

    if (verificacaoEmail || verificacaoCpf) {
        return true
    }

    return false
}

const buscarPorNumeroDeConta = (numeroConta) => {
    const verificar = cubosBanco.contas.find((conta) => conta.numero === Number(numeroConta));

    return verificar
}

const operacoes = {
    listarContas: function (req, res) {
        const { senha_banco } = req.query
        if (!senha_banco) {
            return res.status(400).json({ mensagem: "A senha é obrigatória!" })
        }
        if (senha_banco !== cubosBanco.banco.senha) {
            return res.status(401).json({ mensagem: "A senha do banco informada é inválida!!" })
        }

        return res.status(200).json(cubosBanco.contas)
    },

    criarConta: function (req, res) {
        const propriedades = req.body;
        const verificar = verificarPropriedades(propriedades);

        if (!verificar) {
            return res.status(400).json({ mensagem: "Todas as propriedades são obrigatórias" })
        }

        if (verificarUnicaPropriedade(propriedades.email) || verificarUnicaPropriedade(propriedades.cpf)) {
            return res.status(400).json({ mensagem: "Já existe uma conta com o cpf ou e-mail informado!" })
        }

        const { data_nascimento, nome, telefone, senha, email, cpf } = propriedades;
        const dataFormatada = new Date(data_nascimento);

        const novaConta = {
            numero: ++numeroId,
            saldo: 0,
            usuario: { nome, cpf, data_nascimento: format(dataFormatada, 'yyyy-MM-dd'), telefone, email, senha }
        }

        cubosBanco.contas.push(novaConta);

        return res.status(201).send()
    },

    atualizarConta: function (req, res) {
        const { numeroConta } = req.params;
        const propriedades = req.body;

        const conta = buscarPorNumeroDeConta(numeroConta);
        if (!conta) {
            return res.status(404).json({ mensagem: "Conta bancária não encontrada" })
        }

        if (!verificarPropriedades(propriedades)) {
            return res.status(400).json({ mensagem: "Todas as propriedades são obrigatórias" })
        }

        const { nome, cpf, email, data_nascimento, senha, telefone } = propriedades;

        if (conta.usuario.email !== email || conta.usuario.cpf !== cpf) {
            if (verificarUnicaPropriedade(propriedades.email)) {
                return res.status(400).json({ mensagem: "O email informado já existe cadastrado!" })
            }

            if (verificarUnicaPropriedade(propriedades.cpf)) {
                return res.status(400).json({ mensagem: "O CPF informado já existe cadastrado!" })
            }
        }

        const dataFormatada = new Date(data_nascimento);

        const contaAtualizada = {
            numero: conta.numero,
            saldo: conta.saldo,
            usuario: { nome, cpf, data_nascimento: format(dataFormatada, 'yyyy-MM-dd'), telefone, email, senha }
        }

        cubosBanco.contas.splice(cubosBanco.contas.indexOf(conta), 1, contaAtualizada);

        return res.status(204).send()
    },

    excluirConta: function (req, res) {
        const { numeroConta } = req.params
        const verificar = buscarPorNumeroDeConta(numeroConta);
        if (!verificar) {
            return res.status(404).json({ mensagem: "Conta bancária não encontrada!" })
        }

        if (verificar.saldo !== 0) {
            return res.status(401).json({ mensagem: "A conta só pode ser removida se o saldo for zero!" })
        }

        cubosBanco.contas.splice(cubosBanco.contas.indexOf(verificar), 1);
        return res.status(204).send()
    },

    depositar: function (req, res) {
        const { numero_conta, valor } = req.body;
        if (!numero_conta || !valor) {
            return res.status(400).json({ mensagem: "O número da conta e o valor são obrigatórios!" })
        }

        const conta = buscarPorNumeroDeConta(numero_conta);
        if (!conta) {
            return res.status(404).json({ mensagem: "Conta bancária não encontrada!" })
        }

        if (valor <= 0) {
            return res.status(400).json({ mensagem: "O valor não pode ser menor ou igual a zero" })
        }

        conta.saldo += Number(valor);
        const data = Date.now();
        const objDeposito = {
            data: format(data, 'yyyy-MM-dd HH:mm:ss'),
            numero_conta,
            valor
        }
        cubosBanco.depositos.push(objDeposito);
        return res.status(204).send()
    },

    sacar: function (req, res) {
        try {
            const { numero_conta, valor, senha } = req.body;
            if (!numero_conta || !Number(valor) || !senha) {
                throw 'valores nao informados'
            }
            const conta = buscarPorNumeroDeConta(numero_conta);
            if (!conta) {
                throw 'conta inexistente'
            }
            if (senha !== conta.usuario.senha) {
                throw 'senha incorreta'
            }

            if (Number(valor) <= 0) {
                throw 'valor menor que zero'
            }
            if (Number(valor) > conta.saldo) {
                throw 'saldo insuficiente'
            }

            conta.saldo = conta.saldo - valor;
            const data = Date.now();
            const objSacar = {
                data: format(data, "yyyy-MM-dd HH:mm:ss"),
                numero_conta,
                valor
            }

            cubosBanco.saques.push(objSacar);
            return res.status(204).send()

        } catch (e) {
            if (e === "valores nao informados") {
                return res.status(400).json({ mensagem: "Valor, numero de conta e senha devem ser informados!" })
            }
            if (e === "conta inexistente") {
                return res.status(404).json({ mensagem: "Conta bancária informada não encontrada!" })
            }
            if (e === "senha incorreta") {
                return res.status(401).json({ mensagem: "A senha informada é incorreta" })
            }
            if (e === "valor menor que zero") {
                return res.status(400).json({ mensagem: "O valor não pode ser menor que zero" })
            }
            if (e === "saldo insuficiente") {
                return res.status(400).json({ mensagem: "Saldo insuficiente para operação" })
            }
            console.log(e)
            return res.status(500).json({ mensagem: "Ocorreu um erro inesperado" })
        }
    },

    transferir: function (req, res) {
        const { numero_conta_origem, numero_conta_destino, valor, senha } = req.body;
        if (!numero_conta_destino || !numero_conta_origem || !valor || !senha) {
            return res.status(400).json({ mensagem: "Numero das contas, valor e senha são obrigatórios!" })
        }

        const contaOrigem = buscarPorNumeroDeConta(numero_conta_origem);
        const contaDestino = buscarPorNumeroDeConta(numero_conta_destino);

        if (!contaOrigem || !contaDestino) {
            return res.status(404).json({ mensagem: "Conta de origem ou Conta de Destino não encontrada!" })
        }
        if (contaOrigem === contaDestino) {
            return res.status(400).json({ mensagem: "As contas precisam ser diferentes" })
        }

        if (senha !== contaOrigem.usuario.senha) {
            return res.status(400).json({ mensagem: "Senha Incorreta!" })
        }
        if (Number(valor) <= 0) {
            return res.status(400).json({ mensagem: "O valor nao pode ser menor ou igual a 0" })
        }
        if (Number(valor) > contaOrigem.saldo) {
            return res.status(400).json({ mensagem: "Saldo Insuficiente" })
        }

        contaOrigem.saldo -= Number(valor);
        contaDestino.saldo += Number(valor);
        const data = Date.now();

        const objTransferencia = {
            data: format(data, "yyyy-MM-dd HH:mm:ss"),
            numero_conta_origem,
            numero_conta_destino,
            valor
        }
        cubosBanco.transferencias.push(objTransferencia);
        return res.status(204).send()
    },

    mostrarSaldo: function (req, res) {
        const { numero_conta, senha } = req.query;
        if (!numero_conta || !senha) {
            return res.status(400).json({ mensagem: "Numero de conta e Senha são obrigatórios!" })
        }

        const conta = buscarPorNumeroDeConta(numero_conta);
        if (!conta) {
            return res.status(404).json({ mensagem: "Conta bancária não encontrada!" })
        }
        if (senha !== conta.usuario.senha) {
            return res.status(401).json({ mensagem: "Senha incorreta!" })
        }

        return res.status(200).json({ saldo: conta.saldo })
    },

    extrato: function (req, res) {
        const { numero_conta, senha } = req.query;
        if (!numero_conta || !senha) {
            return res.status(400).json({ mensagem: "Numero e conta e senha são obrigatórios!" })
        }
        const conta = buscarPorNumeroDeConta(numero_conta);
        if (!conta) {
            return res.status(404).json({ mensagem: "Conta bancaria não encontrada!" })
        }
        if (senha !== conta.usuario.senha) {
            return res.status(401).json({ mensagem: "Senha incorreta!" })
        }

        const objExtrato = {
            depositos: cubosBanco.depositos.filter((objDeposito) => objDeposito.numero_conta == numero_conta),
            saques: cubosBanco.saques.filter((objDeposito) => objDeposito.numero_conta == numero_conta),
            transferenciasEnviadas: cubosBanco.transferencias.filter((objDeposito) => objDeposito.numero_conta_origem == numero_conta),
            transferenciasRecebidas: cubosBanco.transferencias.filter((objDeposito) => objDeposito.numero_conta_destino == numero_conta)
        }

        return res.status(200).json(objExtrato)
    }
}

module.exports = operacoes;