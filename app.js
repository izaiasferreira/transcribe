const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
const ffmpeg = require('fluent-ffmpeg');
const vosk = require('vosk');
const downloadFile = require('./utils/downloadFile');

ffmpeg.setFfmpegPath(ffmpegPath);

const app = express();
const port = process.env.PORT || 3004;

const MODEL_PATH = "vosk-model-small-pt-0.3";
const SAMPLE_RATE = 16000;

if (!fs.existsSync(MODEL_PATH)) {
  console.log("Por favor, baixe o modelo de https://alphacephei.com/vosk/models e descompacte como " + MODEL_PATH + " na pasta atual.");
  process.exit();
}

const model = new vosk.Model(MODEL_PATH);
const rec = new vosk.Recognizer({ model: model, sampleRate: SAMPLE_RATE });

app.use(bodyParser.json());

app.post('/transcribe', async (req, res) => {
  const { url } = req.body
  const audioBuffer = await downloadFile({ url: url });

  const tempPath = './temp_audio.ogg'; 
  fs.writeFileSync(tempPath, audioBuffer);

  ffmpeg(tempPath)
    .outputOptions([
      '-f s16le',
      '-acodec pcm_s16le',
      `-ar ${SAMPLE_RATE}`,
      '-ac 1'
    ])
    .on('end', () => {
      fs.unlink(tempPath, () => {});
      res.status(200).json(rec.finalResult()).end();
      rec.free();
      model.free();
    })
    .on('error', (err) => {
      console.error('Erro:', err);
      rec.free();
      model.free();
    })
    .pipe()
    .on('data', (chunk) => {
      rec.acceptWaveform(chunk);
    }); 
});

app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
});
