
const { model, Schema } = require('mongoose')

const servicoSchema = new Schema({
    veiculoServico: {
        type: String
    },
    nomeServico: {
        type: String
    },
    precoServico: {
        type: String
    },
    dataServico: {
        type: Date,
        default: Date.now
    }


}, { versionKey: false })

// exportar para o arquivo main.js
// Para modificar o nome da coleção ("tabela"), basta modificar na linha abaixo o rótulo 'Produtos', sempre iniciando com letra maiúscula
module.exports = model('Servico', servicoSchema)