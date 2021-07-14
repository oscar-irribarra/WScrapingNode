const fetch = require('node-fetch');
const jsdom = require('jsdom');
const { JSDOM } = jsdom;
const { jsPDF } = require('jspdf');
const { CONST_URL, PROLOGO } = require('./constantes');

const fetchHTML = async (url) => {
  const datafetch = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/html',
      'Charset': 'utf-8'
    }
  });

  return await datafetch.text();
};

const fetchBase64Image = async (url) => {
  const data = await fetch(url);
  const buffer = await data.buffer();

  return buffer.toString('base64');
};

const getDataElementHtml = (data) => {
  const parser = new JSDOM(data, {});
  let contenido = '';

  parser.window.document
    .querySelector('.entry-content')
    .querySelectorAll('p')
    .forEach((p = HTMLParagraphElement) => {
      if (p && p.firstElementChild && p.firstElementChild.src) {
        contenido += '\n\n' + p.firstElementChild.src;
      } else if (p && p.textContent && p.textContent.trim().length > 0) {
        contenido += '\n\n' + p.textContent.replace('◇ ◇ ◇', '* * *');
      }
    });
  return contenido;
};

const generatePDF = async (textData, pdfname) => {
  const pageWidthInMM = 210;
  const marginLeftInMM = 10;
  const marginRightInMM = 15;

  const doc = new jsPDF('p', 'mm', 'a4');
  doc.setTextColor('#FFFFFF');
  doc.setFillColor('#15202B');

  const body = doc.splitTextToSize(textData, pageWidthInMM - marginRightInMM);
  const customPageHeight = doc.internal.pageSize.getHeight();

  doc.rect(0, 0, pageWidthInMM, customPageHeight, 'F');

  let marginFromTopOfPage = 15; //margen de cada linea de texto con respecto al tope de pagina, al superar el tamaño de la pagina, se resetea y agrega una pagina nueva.
  for (var i = 0; i < body.length; i++) {
    if (marginFromTopOfPage + 10 > customPageHeight) {
      marginFromTopOfPage = 15;
      doc.addPage();

      doc.setFillColor('#15202B');
      doc.rect(0, 0, pageWidthInMM, customPageHeight, 'F');
    }

    if (body[i].includes('https')) {
      doc.addPage();
      const image = await fetchBase64Image(body[i]);
      doc.addImage(image, 'PNG', 0, 0, pageWidthInMM, customPageHeight);
    } else {
      if (body[i].includes('* * *')) {
        doc.text(body[i], pageWidthInMM / 2, 20, 'center');
      } else {
        doc.text(body[i], marginLeftInMM, marginFromTopOfPage, 'left');
      }
    }
    marginFromTopOfPage = marginFromTopOfPage + 7;
  }
  doc.save(`pdf/${pdfname}.pdf`);
};

const main = async () => {
  // const url = PROLOGO;
  const url = CONST_URL;

  const arrayName = url.split('/');
  const pdfName = arrayName[arrayName.length - 2];

  const html = await fetchHTML(url);
  const data = getDataElementHtml(html);

  await generatePDF(data, pdfName);
};

main();
