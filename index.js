const fetch = require('node-fetch');
const jsdom = require('jsdom');
const { JSDOM } = jsdom;

const { jsPDF } = require('jspdf');
const { CONST_URL } = require('./constantes');

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

const getDataElementHtml = (data) => {
  const parser = new JSDOM(data, {});
  let contenido = '';

  parser.window.document
    .querySelector('.entry-content')
    .querySelectorAll('p')
    .forEach((p = HTMLParagraphElement) => {
      if (p && p.firstElementChild && p.firstElementChild.src) {
        contenido += '\n\n' + p.firstElementChild.src;
      } else {
        contenido += '\n\n' + p.textContent;
      }
    });

  return contenido;
};

const generatePDF = async (textData) => {
  const pageWidthInMM = 210;
  const doc = new jsPDF('p', 'mm', 'a4');

  let marginRightInMM = 15;

  const marginLeftInMM = 10;

  const bodyContent = doc.splitTextToSize(
    textData,
    pageWidthInMM - marginRightInMM
  );
  const pageHeightInMM = doc.internal.pageSize.getHeight();

  //estilos
  doc.setFillColor('#15202B');
  doc.rect(0, 0, pageWidthInMM, pageHeightInMM, 'F');
  doc.setTextColor('#FFFFFF');

  for (var i = 0; i < bodyContent.length; i++) {
    if (marginRightInMM + 10 > pageHeightInMM) {
      marginRightInMM = 15;
      doc.addPage();

      doc.setFillColor('#15202B');
      doc.rect(0, 0, pageWidthInMM, pageHeightInMM, 'F');
    }
    if (bodyContent[i].includes('https://i.imgur.com/')) {
      // doc.addImage(res, 'PNG', 10, 0, 100, 100);
    } else {
      doc.text(bodyContent[i], marginLeftInMM, marginRightInMM, 'left'); //see this line
    }
    marginRightInMM = marginRightInMM + 7;
  }
  doc.save('file.pdf');
};

const generatePdfFormHtml = async () => {
  const html = await fetchHTML(CONST_URL);
  const data = getDataElementHtml(html);
  await generatePDF(data);
};

generatePdfFormHtml();
