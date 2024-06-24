const axios = require('axios');
const downloadFile = async ({ url, method, completeResponse }) => {
    try {
        // Fazendo a requisição para baixar o arquivo
        const response = await axios({
            url: url,
            method: method || 'GET',
            responseType: 'arraybuffer', // Define o tipo de resposta como arraybuffer para obter os dados do arquivo em formato de buffer
        });

        // Retorna os dados do arquivo em formato de buffer
        return completeResponse ? response : response.data;
    } catch (error) {
        console.error('Erro ao baixar o arquivo');
        return null
    }
}
module.exports = downloadFile;