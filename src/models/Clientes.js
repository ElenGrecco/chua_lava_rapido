
const { model, Schema } = require('mongoose')


const clienteSchema = new Schema({
    nomeCliente: {
        type: String
    },
    cpfCliente: {
        type: String,
        unique: true,
        index: true
    },
    veiculoCliente: {
        type: String
    },
    modeloCliente: {
        type: String
    },
    anoCliente: {
        type: String
    },
    servicoCliente: {
        type: String
    },
    telefoneCliente: {
        type: String
    }
}, { versionKey: false })

// exportar para o arquivo main.js
// Para modificar o nome da coleção ("tabela"), basta modificar na linha abaixo o rótulo 'Clientes', sempre iniciando com letra maiúscula
module.exports = model('Clientes', clienteSchema)