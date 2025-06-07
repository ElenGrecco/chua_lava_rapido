
const { model, Schema } = require('mongoose')

const reciboSchema = new Schema({
    veiculoRecibo: {
        type: String
    },
    nomeRecibo: {
        type: String
    },
    precoRecibo: {
        type: String
    },
    dataRecibo: {
        type: Date,
        default: Date.now
    }


}, { versionKey: false })

// exportar para o arquivo main.js
// Para modificar o nome da coleção ("tabela"), basta modificar na linha abaixo o rótulo 'Produtos', sempre iniciando com letra maiúscula
module.exports = model('Recibo', reciboSchema)