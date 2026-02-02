// src/utils/pdfGenerator.js - VERSIÓN OPTIMIZADA

import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ==========================================
// CONSTANTES DE LAYOUT
// ==========================================
const PAGE_WIDTH = 612;  // Letter width in points
const PAGE_HEIGHT = 792; // Letter height in points
const MARGIN = 40;
const CONTENT_WIDTH = PAGE_WIDTH - (MARGIN * 2);
const FOOTER_HEIGHT = 30;
const USABLE_HEIGHT = PAGE_HEIGHT - (MARGIN * 2) - FOOTER_HEIGHT;

// Colors (minimalista-industrial)
const COLORS = {
  primary: '#111827',      // gray-900
  secondary: '#374151',    // gray-700
  tertiary: '#6B7280',     // gray-500
  border: '#E5E7EB',       // gray-200
  bgLight: '#F9FAFB',      // gray-50
  bgMedium: '#F3F4F6',     // gray-100
  success: '#16a34a',      // green-600
  successBg: '#dcfce7',    // green-100
  error: '#dc2626',        // red-600
  errorBg: '#fee2e2',      // red-100
  warning: '#f59e0b',      // amber-500
  warningBg: '#fef3c7'     // amber-100
};

/**
 * Helper para verificar si necesitamos nueva página
 */
function checkPageBreak(doc, currentY, requiredSpace) {
  if (currentY + requiredSpace > MARGIN + USABLE_HEIGHT) {
    doc.addPage();
    return MARGIN;
  }
  return currentY;
}

/**
 * Helper para calcular altura de texto
 */
function calculateTextHeight(text, width, fontSize) {
  // Aproximación: ~12 points por línea
  const charsPerLine = Math.floor(width / (fontSize * 0.5));
  const lines = Math.ceil(text.length / charsPerLine);
  return lines * (fontSize + 2);
}

/**
 * Dibuja el header en cada página
 */
function drawHeader(doc, pageNumber = 1) {
  const yPos = MARGIN;
  
  // Logo/Título
  doc.fontSize(20)
     .fillColor(COLORS.primary)
     .font('Helvetica-Bold')
     .text('PETREOS', MARGIN, yPos);
  
  doc.fontSize(8)
     .fillColor(COLORS.tertiary)
     .font('Helvetica')
     .text('Sistema de Gestión de Flota', MARGIN, yPos + 24);

  // Número de página (solo si no es la primera)
  if (pageNumber > 1) {
    doc.fontSize(8)
       .fillColor(COLORS.tertiary)
       .text(`Página ${pageNumber}`, PAGE_WIDTH - MARGIN - 50, yPos, { width: 50, align: 'right' });
  }

  // Línea separadora
  doc.moveTo(MARGIN, yPos + 40)
     .lineTo(PAGE_WIDTH - MARGIN, yPos + 40)
     .strokeColor(COLORS.border)
     .lineWidth(1)
     .stroke();
  
  return yPos + 50;
}

/**
 * Dibuja el footer en cada página
 */
function drawFooter(doc, pageNumber, totalPages) {
  const yPos = PAGE_HEIGHT - MARGIN - 20;
  
  doc.fontSize(7)
     .fillColor(COLORS.tertiary)
     .font('Helvetica')
     .text(
       `Documento generado: ${new Date().toLocaleString('es-MX')}`,
       MARGIN,
       yPos,
       { width: CONTENT_WIDTH / 2, align: 'left' }
     );
  
  doc.text(
    `Página ${pageNumber} de ${totalPages}`,
    PAGE_WIDTH / 2,
    yPos,
    { width: CONTENT_WIDTH / 2, align: 'right' }
  );
}

/**
 * Genera un PDF de una revisión aprobada
 */
export const generarPDFRevision = async (revision) => {
  return new Promise((resolve, reject) => {
    try {
      // Crear directorio si no existe
      const year = new Date(revision.fecha).getFullYear();
      const month = String(new Date(revision.fecha).getMonth() + 1).padStart(2, '0');
      const dirPath = path.join(
        process.cwd(), 
        'uploads', 
        'revisiones', 
        revision.vehiculo._id.toString(), 
        year.toString(), 
        month
      );
      
      if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
      }

      // Nombre del archivo
      const fileName = `revision_${revision._id}.pdf`;
      const filePath = path.join(dirPath, fileName);
      const relativePath = `/uploads/revisiones/${revision.vehiculo._id}/${year}/${month}/${fileName}`;

      // Crear documento PDF
      const doc = new PDFDocument({ 
        margin: MARGIN, 
        size: 'LETTER',
        bufferPages: true  // Para poder agregar footers después
      });
      
      const stream = fs.createWriteStream(filePath);
      doc.pipe(stream);

      let yPos = drawHeader(doc, 1);
      let pageNumber = 1;

      // ==========================================
      // TÍTULO DE LA REVISIÓN
      // ==========================================
      yPos = checkPageBreak(doc, yPos, 50);
      
      doc.fontSize(16)
         .fillColor(COLORS.primary)
         .font('Helvetica-Bold')
         .text('BITÁCORA DE REVISIÓN', MARGIN, yPos, { align: 'center', width: CONTENT_WIDTH });

      yPos += 22;

      doc.fontSize(10)
         .fillColor(COLORS.secondary)
         .font('Helvetica')
         .text(
           revision.tipo_revision?.nombre || 'Revisión de Vehículo', 
           MARGIN, 
           yPos, 
           { align: 'center', width: CONTENT_WIDTH }
         );

      yPos += 30;

      // ==========================================
      // INFORMACIÓN GENERAL (Compacta)
      // ==========================================
      yPos = checkPageBreak(doc, yPos, 95);

      // Box de fondo
      doc.rect(MARGIN, yPos, CONTENT_WIDTH, 90)
         .fillColor(COLORS.bgLight)
         .fill()
         .strokeColor(COLORS.border)
         .lineWidth(1)
         .stroke();

      let boxY = yPos + 12;

      // Header del box
      doc.fillColor(COLORS.primary)
         .fontSize(9)
         .font('Helvetica-Bold')
         .text('INFORMACIÓN GENERAL', MARGIN + 12, boxY);

      boxY += 18;

      // Grid de 3 columnas
      const colWidth = (CONTENT_WIDTH - 36) / 3;

      // Columna 1
      doc.fontSize(7).fillColor(COLORS.tertiary).font('Helvetica').text('Fecha', MARGIN + 12, boxY);
      doc.fontSize(8).fillColor(COLORS.primary).font('Helvetica-Bold').text(
        new Date(revision.fecha).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' }), 
        MARGIN + 12, 
        boxY + 10
      );

      doc.fontSize(7).fillColor(COLORS.tertiary).font('Helvetica').text('Placa', MARGIN + 12, boxY + 30);
      doc.fontSize(8).fillColor(COLORS.primary).font('Helvetica-Bold').text(
        revision.placa, 
        MARGIN + 12, 
        boxY + 40
      );

      // Columna 2
      doc.fontSize(7).fillColor(COLORS.tertiary).font('Helvetica').text('Operador', MARGIN + 12 + colWidth, boxY);
      doc.fontSize(8).fillColor(COLORS.primary).font('Helvetica-Bold').text(
        revision.operador?.nombre || 'N/A', 
        MARGIN + 12 + colWidth, 
        boxY + 10,
        { width: colWidth - 24, ellipsis: true }
      );

      doc.fontSize(7).fillColor(COLORS.tertiary).font('Helvetica').text('No. Económico', MARGIN + 12 + colWidth, boxY + 30);
      doc.fontSize(8).fillColor(COLORS.primary).font('Helvetica-Bold').text(
        revision.numero_economico, 
        MARGIN + 12 + colWidth, 
        boxY + 40
      );

      // Columna 3
      doc.fontSize(7).fillColor(COLORS.tertiary).font('Helvetica').text('Frecuencia', MARGIN + 12 + colWidth * 2, boxY);
      doc.fontSize(8).fillColor(COLORS.primary).font('Helvetica-Bold').text(
        revision.frecuencia.toUpperCase(), 
        MARGIN + 12 + colWidth * 2, 
        boxY + 10
      );

      doc.fontSize(7).fillColor(COLORS.tertiary).font('Helvetica').text('Estado', MARGIN + 12 + colWidth * 2, boxY + 30);
      doc.fontSize(8).fillColor(COLORS.success).font('Helvetica-Bold').text(
        '✓ APROBADA', 
        MARGIN + 12 + colWidth * 2, 
        boxY + 40
      );

      yPos += 100;

      // ==========================================
      // DATOS OPERACIONALES (Compactos)
      // ==========================================
      yPos = checkPageBreak(doc, yPos, 75);

      doc.fontSize(9)
         .fillColor(COLORS.primary)
         .font('Helvetica-Bold')
         .text('DATOS OPERACIONALES', MARGIN, yPos);

      yPos += 16;

      // Tres boxes en una fila
      const boxWidth = (CONTENT_WIDTH - 24) / 3;
      const boxHeight = 50;

      // Box 1: Kilometraje
      doc.rect(MARGIN, yPos, boxWidth, boxHeight)
         .strokeColor(COLORS.border)
         .lineWidth(1)
         .stroke();
      
      doc.fontSize(7).fillColor(COLORS.tertiary).font('Helvetica').text(
        'Kilometraje', 
        MARGIN + 8, 
        yPos + 8
      );
      doc.fontSize(12).fillColor(COLORS.primary).font('Helvetica-Bold').text(
        `${revision.kilometraje_al_momento?.toLocaleString() || 'N/A'} km`,
        MARGIN + 8, 
        yPos + 22,
        { width: boxWidth - 16 }
      );

      // Box 2: Horas Motor
      doc.rect(MARGIN + boxWidth + 12, yPos, boxWidth, boxHeight)
         .strokeColor(COLORS.border)
         .lineWidth(1)
         .stroke();
      
      doc.fontSize(7).fillColor(COLORS.tertiary).font('Helvetica').text(
        'Horas Motor', 
        MARGIN + boxWidth + 20, 
        yPos + 8
      );
      doc.fontSize(12).fillColor(COLORS.primary).font('Helvetica-Bold').text(
        `${revision.horas_motor_al_momento?.toLocaleString() || 'N/A'} hrs`,
        MARGIN + boxWidth + 20, 
        yPos + 22,
        { width: boxWidth - 16 }
      );

      // Box 3: Combustible
      doc.rect(MARGIN + (boxWidth + 12) * 2, yPos, boxWidth, boxHeight)
         .strokeColor(COLORS.border)
         .lineWidth(1)
         .stroke();
      
      doc.fontSize(7).fillColor(COLORS.tertiary).font('Helvetica').text(
        'Combustible', 
        MARGIN + (boxWidth + 12) * 2 + 8, 
        yPos + 8
      );
      doc.fontSize(12).fillColor(COLORS.primary).font('Helvetica-Bold').text(
        revision.nivel_combustible?.toUpperCase() || 'N/A',
        MARGIN + (boxWidth + 12) * 2 + 8, 
        yPos + 22,
        { width: boxWidth - 16 }
      );

      yPos += boxHeight + 20;

      // ==========================================
      // CHECKLIST (OPTIMIZADO)
      // ==========================================
      yPos = checkPageBreak(doc, yPos, 30);

      doc.fontSize(9)
         .fillColor(COLORS.primary)
         .font('Helvetica-Bold')
         .text('CHECKLIST DE INSPECCIÓN', MARGIN, yPos);

      yPos += 16;

      if (revision.respuestas && revision.respuestas.length > 0) {
        // Agrupar por sección
        const respuestasPorSeccion = {};
        
        revision.respuestas.forEach(item => {
          const nombreSeccion = item.seccion_nombre || 'General';
          const ordenSeccion = item.seccion_orden ?? 999;
          
          if (!respuestasPorSeccion[nombreSeccion]) {
            respuestasPorSeccion[nombreSeccion] = {
              nombre: nombreSeccion,
              orden: ordenSeccion,
              respuestas: []
            };
          }
          
          respuestasPorSeccion[nombreSeccion].respuestas.push(item);
        });

        // Ordenar secciones
        const seccionesOrdenadas = Object.values(respuestasPorSeccion)
          .sort((a, b) => a.orden - b.orden);

        // Renderizar cada sección
        seccionesOrdenadas.forEach((seccion) => {
          // Header de sección (más compacto)
          yPos = checkPageBreak(doc, yPos, 22);

          doc.rect(MARGIN, yPos, CONTENT_WIDTH, 20)
             .fillColor(COLORS.bgMedium)
             .fill()
             .strokeColor(COLORS.border)
             .lineWidth(1)
             .stroke();

          doc.fontSize(8)
             .fillColor(COLORS.secondary)
             .font('Helvetica-Bold')
             .text(seccion.nombre.toUpperCase(), MARGIN + 8, yPos + 6);

          yPos += 24;

          // Items de la sección
          seccion.respuestas.forEach((item) => {
            const isMal = item.respuesta === 'Mal';
            
            // Calcular altura del item
            let itemHeight = 26; // Base
            if (item.observaciones && item.observaciones.trim()) {
              const obsHeight = calculateTextHeight(item.observaciones, CONTENT_WIDTH - 100, 7);
              itemHeight = Math.max(26, obsHeight + 20);
            }

            yPos = checkPageBreak(doc, yPos, itemHeight + 4);

            // Box del item
            doc.rect(MARGIN, yPos, CONTENT_WIDTH, itemHeight)
               .fillColor(isMal ? COLORS.errorBg : COLORS.successBg)
               .fill()
               .strokeColor(isMal ? '#fca5a5' : '#86efac')
               .lineWidth(0.5)
               .stroke();

            // Número y pregunta
            doc.fontSize(8)
               .fillColor(COLORS.primary)
               .font('Helvetica')
               .text(
                 `${item.numero}. ${item.texto_pregunta}`, 
                 MARGIN + 8, 
                 yPos + 8, 
                 { width: CONTENT_WIDTH - 100 }
               );

            // Badge de estado
            const badgeText = isMal ? 'MAL' : 'BIEN';
            const badgeColor = isMal ? COLORS.error : COLORS.success;
            const badgeX = PAGE_WIDTH - MARGIN - 60;

            doc.rect(badgeX, yPos + 6, 52, 14)
               .fillColor(isMal ? '#fef2f2' : '#f0fdf4')
               .fill()
               .strokeColor(badgeColor)
               .lineWidth(1)
               .stroke();

            doc.fontSize(7)
               .fillColor(badgeColor)
               .font('Helvetica-Bold')
               .text(badgeText, badgeX, yPos + 9, { width: 52, align: 'center' });

            // Observaciones (si existen)
            if (item.observaciones && item.observaciones.trim()) {
              doc.fontSize(7)
                 .fillColor('#991b1b')
                 .font('Helvetica-Bold')
                 .text('Obs: ', MARGIN + 8, yPos + 20);
              
              doc.fontSize(7)
                 .fillColor(COLORS.secondary)
                 .font('Helvetica')
                 .text(
                   item.observaciones, 
                   MARGIN + 30, 
                   yPos + 20, 
                   { width: CONTENT_WIDTH - 108 }
                 );
            }

            yPos += itemHeight + 2;
          });

          // Comentarios de sección (si existen)
          const comentarioSeccion = revision.comentarios_secciones?.find(
            cs => cs.seccion_nombre === seccion.nombre && cs.comentario?.trim()
          );

          if (comentarioSeccion) {
            const commentHeight = Math.max(30, calculateTextHeight(comentarioSeccion.comentario, CONTENT_WIDTH - 24, 7));
            yPos = checkPageBreak(doc, yPos, commentHeight + 8);

            doc.rect(MARGIN, yPos, CONTENT_WIDTH, commentHeight)
               .fillColor(COLORS.warningBg)
               .fill()
               .strokeColor(COLORS.warning)
               .lineWidth(0.5)
               .stroke();

            doc.fontSize(7)
               .fillColor('#92400e')
               .font('Helvetica-Bold')
               .text('💬 Comentario:', MARGIN + 8, yPos + 6);

            doc.fontSize(7)
               .fillColor(COLORS.primary)
               .font('Helvetica')
               .text(
                 comentarioSeccion.comentario, 
                 MARGIN + 8, 
                 yPos + 16, 
                 { width: CONTENT_WIDTH - 16 }
               );

            yPos += commentHeight + 4;
          }

          yPos += 8; // Espacio entre secciones
        });
      }

      // ==========================================
      // NEUMÁTICOS (GRID OPTIMIZADO)
      // ==========================================
      if (revision.llantas && revision.llantas.length > 0) {
        yPos = checkPageBreak(doc, yPos, 30);

        doc.fontSize(9)
           .fillColor(COLORS.primary)
           .font('Helvetica-Bold')
           .text('INSPECCIÓN DE NEUMÁTICOS', MARGIN, yPos);

        yPos += 16;

        // Grid de 4 columnas
        const cols = 4;
        const itemWidth = (CONTENT_WIDTH - (3 * 8)) / 4; // 4 items con 3 gaps de 8pt
        const itemHeight = 70; // Compacto

        let row = 0;
        let col = 0;

        revision.llantas.forEach((llanta, index) => {
          // Check si necesitamos nueva fila
          if (col === 0) {
            yPos = checkPageBreak(doc, yPos, itemHeight + 8);
          }

          const xPos = MARGIN + col * (itemWidth + 8);
          const yPosItem = yPos;

          // Detectar problemas
          const tieneProblema = 
            llanta.presion_estado === 'Mal' || 
            llanta.callo_estado === 'Mal' ||
            llanta.presion === 'Mal' || 
            llanta.estado === 'Mal';

          // Box
          doc.rect(xPos, yPosItem, itemWidth, itemHeight)
             .fillColor(tieneProblema ? COLORS.errorBg : COLORS.successBg)
             .fill()
             .strokeColor(tieneProblema ? '#fca5a5' : '#86efac')
             .lineWidth(0.5)
             .stroke();

          // Número de posición
          doc.fontSize(14)
             .fillColor(COLORS.primary)
             .font('Helvetica-Bold')
             .text(`#${llanta.posicion}`, xPos + 6, yPosItem + 6);

          // Info
          doc.fontSize(6)
             .fillColor(COLORS.tertiary)
             .font('Helvetica')
             .text(
               `Eje ${llanta.eje_numero} - ${llanta.lado}`, 
               xPos + 6, 
               yPosItem + 24,
               { width: itemWidth - 12 }
             );

          let yOffset = yPosItem + 36;

          // Presión
          if (llanta.presion_medida !== undefined) {
            doc.fontSize(6)
               .fillColor(COLORS.tertiary)
               .font('Helvetica')
               .text(`Presión: ${llanta.presion_medida} PSI`, xPos + 6, yOffset);
            
            doc.fontSize(6)
               .fillColor(llanta.presion_estado === 'Mal' ? COLORS.error : COLORS.success)
               .font('Helvetica-Bold')
               .text(llanta.presion_estado, xPos + itemWidth - 28, yOffset);
            
            yOffset += 10;
          } else if (llanta.presion) {
            doc.fontSize(6)
               .fillColor(llanta.presion === 'Mal' ? COLORS.error : COLORS.success)
               .text(`P: ${llanta.presion}`, xPos + 6, yOffset);
            yOffset += 10;
          }

          // Callo
          if (llanta.callo_medida !== undefined) {
            doc.fontSize(6)
               .fillColor(COLORS.tertiary)
               .font('Helvetica')
               .text(`Callo: ${llanta.callo_medida} mm`, xPos + 6, yOffset);
            
            doc.fontSize(6)
               .fillColor(llanta.callo_estado === 'Mal' ? COLORS.error : COLORS.success)
               .font('Helvetica-Bold')
               .text(llanta.callo_estado, xPos + itemWidth - 28, yOffset);
          } else if (llanta.estado) {
            doc.fontSize(6)
               .fillColor(llanta.estado === 'Mal' ? COLORS.error : COLORS.success)
               .text(`E: ${llanta.estado}`, xPos + 6, yOffset);
          }

          // Actualizar columna/fila
          col++;
          if (col >= cols) {
            col = 0;
            row++;
            yPos += itemHeight + 8;
          }
        });

        // Ajustar yPos si quedó incompleta la última fila
        if (col > 0) {
          yPos += itemHeight + 8;
        }

        // Comentarios de neumáticos
        if (revision.comentarios_neumaticos?.trim()) {
          const commentHeight = Math.max(30, calculateTextHeight(revision.comentarios_neumaticos, CONTENT_WIDTH - 24, 7));
          yPos = checkPageBreak(doc, yPos, commentHeight + 8);

          doc.rect(MARGIN, yPos, CONTENT_WIDTH, commentHeight)
             .fillColor(COLORS.warningBg)
             .fill()
             .strokeColor(COLORS.warning)
             .lineWidth(0.5)
             .stroke();

          doc.fontSize(7)
             .fillColor('#92400e')
             .font('Helvetica-Bold')
             .text('💬 Comentarios de neumáticos:', MARGIN + 8, yPos + 6);

          doc.fontSize(7)
             .fillColor(COLORS.primary)
             .font('Helvetica')
             .text(
               revision.comentarios_neumaticos, 
               MARGIN + 8, 
               yPos + 16, 
               { width: CONTENT_WIDTH - 16 }
             );

          yPos += commentHeight + 8;
        }
      }

      // ==========================================
      // COMENTARIOS GENERALES
      // ==========================================
      if (revision.comentarios?.trim()) {
        yPos = checkPageBreak(doc, yPos, 30);

        doc.fontSize(9)
           .fillColor(COLORS.primary)
           .font('Helvetica-Bold')
           .text('COMENTARIOS GENERALES', MARGIN, yPos);

        yPos += 16;

        const commentHeight = Math.max(35, calculateTextHeight(revision.comentarios, CONTENT_WIDTH - 24, 8));
        yPos = checkPageBreak(doc, yPos, commentHeight);

        doc.rect(MARGIN, yPos, CONTENT_WIDTH, commentHeight)
           .fillColor(COLORS.bgLight)
           .fill()
           .strokeColor(COLORS.border)
           .lineWidth(1)
           .stroke();

        doc.fontSize(8)
           .fillColor(COLORS.primary)
           .font('Helvetica')
           .text(
             revision.comentarios, 
             MARGIN + 12, 
             yPos + 10, 
             { width: CONTENT_WIDTH - 24 }
           );
      }

      // ==========================================
      // FINALIZAR - Agregar footers a todas las páginas
      // ==========================================
      const range = doc.bufferedPageRange();
      for (let i = 0; i < range.count; i++) {
        doc.switchToPage(i);
        drawFooter(doc, i + 1, range.count);
      }

      doc.end();

      stream.on('finish', () => {
        resolve(relativePath);
      });

      stream.on('error', (err) => {
        reject(err);
      });

    } catch (error) {
      reject(error);
    }
  });
};