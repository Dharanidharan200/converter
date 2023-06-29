const express = require('express');
const sizeOf = require('image-size');
const fs = require('fs');
const cors = require('cors');
const app = express();
app.use(cors());
const multer = require('multer');
const sharp = require('sharp');

const PDFDocument = require('pdfkit');
const bodyParser = require('body-parser');

app.use(bodyParser.json({ limit: '10mb' })); 
// Set storage for uploaded files in memory
const storage = multer.memoryStorage();


// Enable CORS


app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});


const upload = multer().array('images', 100);

app.post('/convert-to-pdf', upload, (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).send('No files were uploaded.');
  }

  const allowedFormats = ['jpg', 'jpeg', 'png'];
  const images = [];

  req.files.forEach(file => {
    const fileExtension = file.originalname.split('.').pop().toLowerCase();
    if (allowedFormats.includes(fileExtension)) {
      images.push({
        buffer: file.buffer,
        format: fileExtension
      });
    }
  });

  if (images.length === 0) {
    return res.status(400).send('No valid image files were uploaded.');
  }

  const doc = new PDFDocument();

  images.forEach((image, index) => {
    if (index > 0) {
      doc.addPage();
    }

    const imageSize = sizeOf(image.buffer);
    const { width, height } = doc.page;
    const scaleFactor = Math.min(width / imageSize.width, height / imageSize.height);

    const xPos = (width - imageSize.width * scaleFactor) / 2;
    const yPos = (height - imageSize.height * scaleFactor) / 2;

    doc.image(image.buffer, xPos, yPos, {
      width: imageSize.width * scaleFactor,
      height: imageSize.height * scaleFactor,
      format: image.format
    });
  });

  res.setHeader('Content-Type', 'application/pdf');
  doc.pipe(res);
  doc.end();
});



app.post('/convert-to-base64', (req, res) => {
const upload = multer({ storage: storage }).array('images', 3);

  upload(req, res, function (err) {
    if (err) {
      console.error('Error occurred while uploading file:', err);
      return res.sendStatus(500);
    }

    const [file] = req.files;
    if (!file) {
      console.error('No file was uploaded.');
      return res.sendStatus(400);
    }

    const imageBase64 = file.buffer.toString('base64');

    res.json({ base64: imageBase64 });
  });
});
//pdf to images
// const upload = multer({ storage: storage }).array('images', 3);
const pdf2pic = require('pdf2pic');

app.post('/pdf-to-Images', (req, res) => {
  upload(req, res, function (err) {
    if (err) {
      console.error('Error occurred while uploading files:', err);
      return res.sendStatus(500);
    }

    if (!req.files || req.files.length === 0) {
      console.error('No files were uploaded.');
      return res.sendStatus(400);
    }

    const pdfFile = req.files[0];
    const pdfPath = `./uploads/${pdfFile.originalname}`;

    pdfFile.mv(pdfPath, function (err) {
      if (err) {
        console.error('Error occurred while saving the PDF:', err);
        return res.sendStatus(500);
      }

      const options = {
        density: 100,
        savePath: './output',
        format: 'png',
        width: 800,
        height: 600
      };

      const converter = pdf2pic.fromPath(pdfPath, options);

      converter.convert(1, -1)
        .then((resolve) => {
          console.log('PDF converted to images successfully:', resolve);
          return res.sendStatus(200);
        })
        .catch((error) => {
          console.error('Error converting PDF to images:', error);
          return res.sendStatus(500);
        });
    });
  });
});




//text to pdf ...
app.post('/text-to-pdf', (req, res) => {
  console.log("hii");
  if (!req.body || !req.body.content) {
    return res.status(400).json({ error: 'Missing content in request body' });
   
  }

  const htmlContent = req.body.content;
console.log(htmlContent);
  // PDF options
  const options = {
    format: 'Letter',
    border: {
      top: '0.5in',
      right: '0.5in',
      bottom: '0.5in',
      left: '0.5in'
    }
  };

  // Generate PDF from HTML content
  pdf.create(htmlContent, options).toBuffer((err, buffer) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Failed to generate PDF' });
    }

    // Set response headers for file download
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=document.pdf');

    // Send the PDF buffer as the response
    res.send(buffer);
  });
});
//Image-converter
app.post('/convert', (req, res) => {
  const format = req.body.format;
  const file = req.body.file;

  if (!format || !file) {
    return res.status(400).send('Missing format or file parameter');
  }
  sharp(Buffer.from(file, 'base64'))
    .toFormat(format)
    .toBuffer()
    .then(outputBuffer => {
      res.set('Content-Type', `image/${format}`);
      res.send(outputBuffer);
      console.log(outputBuffer);
    })
    .catch(error => {
      console.error(error);
      res.sendStatus(500,"error");
    });
// res.send('Conversion completed');
console.log("conversion completed");

});
const { PDFDocument: PDFLibDocument } = require('pdf-lib');

// ... your code ...

app.post('/merge', multer().array('pdfFiles'), async (req, res) => {
  try {
    const mergedPdfBytes = await mergePDFs(req.files);
    res.contentType('application/pdf');
    res.send(Buffer.from(mergedPdfBytes));
  } catch (error) {
    console.error(error);
    res.status(500).send('An error occurred while merging PDFs.');
  }
});

async function mergePDFs(files) {
  const mergedPdf = await PDFLibDocument.create();

  for (const file of files) {
    const pdfBytes = file.buffer;
    const pdfDoc = await PDFLibDocument.load(pdfBytes);
    const copiedPages = await mergedPdf.copyPages(pdfDoc, pdfDoc.getPageIndices());
    copiedPages.forEach((page) => mergedPdf.addPage(page));
  }

  const mergedPdfBytes = await mergedPdf.save();
console.log(mergedPdfBytes);
  return mergedPdfBytes;
}




app.use(express.static('public'));

app.listen(3000, () => {
  console.log('Server is running on port 3000');
});
