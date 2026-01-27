// src/utils/pdfGenerator.js

import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Genera un PDF de una revisión aprobada
 * @param {Object} revision - Documento de revisión completo (con populates)
 * @returns {Promise<string>} - Ruta relativa del PDF generado
 */
export const generarPDFRevision = async (revision) => {
  return new Promise((resolve, reject) => {
    try {
      // Crear directorio si no existe
      const year = new Date(revision.fecha).getFullYear();
      const month = String(new Date(revision.fecha).getMonth() + 1).padStart(2, '0');
      const dirPath = path.join(process.cwd(), 'uploads', 'revisiones', revision.vehiculo._id.toString(), year.toString(), month);
      
      if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
      }

      // Nombre del archivo
      const fileName = `revision_${revision._id}.pdf`;
      const filePath = path.join(dirPath, fileName);
      const relativePath = `/uploads/revisiones/${revision.vehiculo._id}/${year}/${month}/${fileName}`;

      // Crear documento PDF
      const doc = new PDFDocument({ margin: 50, size: 'LETTER' });
      const stream = fs.createWriteStream(filePath);

      doc.pipe(stream);

      // ==========================================
      // HEADER / LOGO
      // ==========================================
      doc.fontSize(24)
         .fillColor('#1a1a1a')
         .text('PETREOS', 50, 50, { bold: true });
      
      doc.fontSize(10)
         .fillColor('#666666')
         .text('Sistema de Gestión de Flota', 50, 78);

      // Línea separadora
      doc.moveTo(50, 100)
         .lineTo(562, 100)
         .strokeColor('#cccccc')
         .stroke();

      // ==========================================
      // TÍTULO
      // ==========================================
      doc.fontSize(18)
         .fillColor('#1a1a1a')
         .text('BITÁCORA DE REVISIÓN', 50, 120, { align: 'center' });

      doc.fontSize(12)
         .fillColor('#666666')
         .text(revision.tipo_revision?.nombre || 'Revisión de Vehículo', 50, 145, { align: 'center' });

      // ==========================================
      // INFORMACIÓN GENERAL
      // ==========================================
      let yPos = 180;

      // Box de info general
      doc.rect(50, yPos, 512, 120)
         .fillColor('#f5f5f5')
         .fill()
         .strokeColor('#cccccc')
         .stroke();

      yPos += 15;
      doc.fillColor('#1a1a1a')
         .fontSize(10)
         .font('Helvetica-Bold')
         .text('INFORMACIÓN GENERAL', 60, yPos);

      yPos += 20;
      doc.font('Helvetica');

      // Columna 1
      doc.fontSize(8).fillColor('#666666').text('Fecha:', 60, yPos);
      doc.fontSize(9).fillColor('#1a1a1a').text(
        new Date(revision.fecha).toLocaleDateString('es-MX', {
          day: '2-digit',
          month: 'long',
          year: 'numeric'
        }), 
        60, yPos + 12
      );

      doc.fontSize(8).fillColor('#666666').text('Placa:', 60, yPos + 35);
      doc.fontSize(9).fillColor('#1a1a1a').text(revision.placa, 60, yPos + 47);

      // Columna 2
      doc.fontSize(8).fillColor('#666666').text('Operador:', 200, yPos);
      doc.fontSize(9).fillColor('#1a1a1a').text(revision.operador?.nombre || 'N/A', 200, yPos + 12);

      doc.fontSize(8).fillColor('#666666').text('No. Económico:', 200, yPos + 35);
      doc.fontSize(9).fillColor('#1a1a1a').text(revision.numero_economico, 200, yPos + 47);

      // Columna 3
      doc.fontSize(8).fillColor('#666666').text('Frecuencia:', 380, yPos);
      doc.fontSize(9).fillColor('#1a1a1a').text(revision.frecuencia.toUpperCase(), 380, yPos + 12);

      doc.fontSize(8).fillColor('#666666').text('Estado:', 380, yPos + 35);
      doc.fontSize(9).fillColor('#22c55e').text('✓ APROBADA', 380, yPos + 47);

      // ==========================================
      // DATOS OPERACIONALES
      // ==========================================
      yPos = 330;

      doc.fontSize(11)
         .fillColor('#1a1a1a')
         .font('Helvetica-Bold')
         .text('DATOS OPERACIONALES', 50, yPos);

      yPos += 20;

      // Boxes de métricas
      const boxWidth = 160;
      const boxHeight = 60;
      const gap = 16;

      // Box 1: Kilometraje
      doc.rect(50, yPos, boxWidth, boxHeight)
         .strokeColor('#e5e7eb')
         .stroke();
      
      doc.fontSize(8).fillColor('#666666').font('Helvetica').text('Kilometraje', 60, yPos + 10);
      doc.fontSize(16).fillColor('#1a1a1a').font('Helvetica-Bold').text(
        `${revision.kilometraje_al_momento?.toLocaleString()} km`,
        60, yPos + 28
      );

      // Box 2: Horas Motor
      doc.rect(50 + boxWidth + gap, yPos, boxWidth, boxHeight)
         .strokeColor('#e5e7eb')
         .stroke();
      
      doc.fontSize(8).fillColor('#666666').font('Helvetica').text('Horas Motor', 60 + boxWidth + gap, yPos + 10);
      doc.fontSize(16).fillColor('#1a1a1a').font('Helvetica-Bold').text(
        `${revision.horas_motor_al_momento?.toLocaleString()} hrs`,
        60 + boxWidth + gap, yPos + 28
      );

      // Box 3: Combustible
      doc.rect(50 + (boxWidth + gap) * 2, yPos, boxWidth, boxHeight)
         .strokeColor('#e5e7eb')
         .stroke();
      
      doc.fontSize(8).fillColor('#666666').font('Helvetica').text('Combustible', 60 + (boxWidth + gap) * 2, yPos + 10);
      doc.fontSize(16).fillColor('#1a1a1a').font('Helvetica-Bold').text(
        revision.nivel_combustible.toUpperCase(),
        60 + (boxWidth + gap) * 2, yPos + 28
      );

      // ==========================================
      // CHECKLIST (AGRUPADO POR SECCIÓN CON COMENTARIOS)
      // ==========================================
      yPos = 430;

      doc.fontSize(11)
         .fillColor('#1a1a1a')
         .font('Helvetica-Bold')
         .text('CHECKLIST DE INSPECCIÓN', 50, yPos);

      yPos += 20;

      if (revision.respuestas && revision.respuestas.length > 0) {
        // Agrupar respuestas por sección
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
        seccionesOrdenadas.forEach((seccion, seccionIndex) => {
          // Verificar si necesitamos nueva página para header de sección
          if (yPos > 700) {
            doc.addPage();
            yPos = 50;
          }

          // HEADER DE SECCIÓN
          doc.rect(50, yPos, 512, 25)
             .fillColor('#f3f4f6')
             .fill()
             .strokeColor('#d1d5db')
             .stroke();

          doc.fontSize(10)
             .fillColor('#374151')
             .font('Helvetica-Bold')
             .text(seccion.nombre.toUpperCase(), 60, yPos + 8);

          yPos += 30;

          // Renderizar preguntas de la sección
          seccion.respuestas.forEach((item, index) => {
            if (yPos > 700) {
              doc.addPage();
              yPos = 50;
            }

            const isMal = item.respuesta === 'Mal';
            const boxHeight = item.observaciones ? 50 : 30;

            doc.rect(50, yPos, 512, boxHeight)
               .fillColor(isMal ? '#fef2f2' : '#f0fdf4')
               .fillOpacity(1)
               .fill()
               .strokeColor(isMal ? '#fca5a5' : '#86efac')
               .stroke();

            doc.fillOpacity(1)
               .fontSize(9)
               .fillColor('#1a1a1a')
               .font('Helvetica')
               .text(`${item.numero}. ${item.texto_pregunta}`, 60, yPos + 10, { width: 390 });

            // Badge
            const badgeText = isMal ? 'MAL' : 'BIEN';
            const badgeColor = isMal ? '#dc2626' : '#16a34a';
            const badgeBg = isMal ? '#fee2e2' : '#dcfce7';

            doc.rect(470, yPos + 8, 80, 14)
               .fillColor(badgeBg)
               .fillOpacity(1)
               .fill()
               .strokeColor(badgeColor)
               .lineWidth(1)
               .stroke();

            doc.fontSize(9)
               .fillColor(badgeColor)
               .font('Helvetica-Bold')
               .text(badgeText, 470, yPos + 10, { width: 80, align: 'center' });

            if (item.observaciones) {
              doc.fontSize(8)
                 .fillColor('#991b1b')
                 .font('Helvetica-Bold')
                 .text('Observación: ', 60, yPos + 28);
              
              doc.fontSize(8)
                 .fillColor('#666666')
                 .font('Helvetica')
                 .text(item.observaciones, 122, yPos + 28, { width: 430 });
              
              yPos += 55;
            } else {
              yPos += 35;
            }
          });

          // 🆕 COMENTARIOS DE LA SECCIÓN
          const comentarioSeccion = revision.comentarios_secciones?.find(
            cs => cs.seccion_nombre === seccion.nombre && cs.comentario && cs.comentario.trim() !== ''
          );

          if (comentarioSeccion) {
            yPos += 5;

            // Verificar si necesitamos nueva página
            if (yPos > 680) {
              doc.addPage();
              yPos = 50;
            }

            const textHeight = Math.max(35, Math.ceil(comentarioSeccion.comentario.length / 80) * 12);

            doc.rect(50, yPos, 512, textHeight)
               .fillColor('#fffbeb')
               .fill()
               .strokeColor('#fbbf24')
               .lineWidth(1)
               .stroke();

            doc.fontSize(8)
               .fillColor('#92400e')
               .font('Helvetica-Bold')
               .text('💬 Comentarios de sección:', 60, yPos + 8);

            doc.fontSize(8)
               .fillColor('#1a1a1a')
               .font('Helvetica')
               .text(comentarioSeccion.comentario, 60, yPos + 20, { width: 490 });

            yPos += textHeight + 5;
          }

          // Espacio entre secciones
          yPos += 15;
        });
      }

      // ==========================================
      // NEUMÁTICOS (ACTUALIZADO CON MEDIDAS)
      // ==========================================
      if (revision.llantas && revision.llantas.length > 0) {
        yPos += 20;

        // Verificar si necesitamos nueva página
        if (yPos > 650) {
          doc.addPage();
          yPos = 50;
        }

        doc.fontSize(11)
           .fillColor('#1a1a1a')
           .font('Helvetica-Bold')
           .text('INSPECCIÓN DE NEUMÁTICOS', 50, yPos);

        yPos += 20;

        // Tabla de neumáticos (4 columnas)
        const cols = 4;
        const itemWidth = 120;
        const itemHeight = 90;  // 🆕 Aumentado para incluir medidas
        const itemGap = 10;

        revision.llantas.forEach((llanta, index) => {
          const col = index % cols;
          const row = Math.floor(index / cols);
          
          const xPos = 50 + col * (itemWidth + itemGap);
          const yPosItem = yPos + row * (itemHeight + itemGap);

          // Verificar si necesitamos nueva página
          if (yPosItem > 680) {
            doc.addPage();
            yPos = 50;
          }

          // 🆕 Detectar problemas con nuevos campos
          const tieneProblema = 
            llanta.presion_estado === 'Mal' || 
            llanta.callo_estado === 'Mal' ||
            llanta.presion === 'Mal' || 
            llanta.estado === 'Mal';

          // Box
          doc.rect(xPos, yPosItem, itemWidth, itemHeight)
             .fillColor(tieneProblema ? '#fef2f2' : '#f0fdf4')
             .fill()
             .strokeColor(tieneProblema ? '#fca5a5' : '#86efac')
             .stroke();

          // Número de posición
          doc.fontSize(16)
             .fillColor('#1a1a1a')
             .font('Helvetica-Bold')
             .text(`#${llanta.posicion}`, xPos + 10, yPosItem + 10);

          // Info
          doc.fontSize(7)
             .fillColor('#666666')
             .font('Helvetica')
             .text(`Eje ${llanta.eje_numero} - ${llanta.lado}`, xPos + 10, yPosItem + 32);

          let yOffset = yPosItem + 45;

          // 🆕 PRESIÓN - Con medida y estado
          if (llanta.presion_medida !== undefined) {
            doc.fontSize(7)
               .fillColor('#666666')
               .font('Helvetica')
               .text(`Presión: ${llanta.presion_medida} PSI`, xPos + 10, yOffset);
            
            doc.fontSize(7)
               .fillColor(llanta.presion_estado === 'Mal' ? '#dc2626' : '#16a34a')
               .font('Helvetica-Bold')
               .text(llanta.presion_estado, xPos + 85, yOffset);
            
            yOffset += 12;
          } else if (llanta.presion) {
            // ⚠️ Retrocompatibilidad
            doc.fontSize(7)
               .fillColor(llanta.presion === 'Mal' ? '#dc2626' : '#16a34a')
               .text(`Presión: ${llanta.presion}`, xPos + 10, yOffset);
            
            yOffset += 12;
          }

          // 🆕 CALLO - Con medida y estado
          if (llanta.callo_medida !== undefined) {
            doc.fontSize(7)
               .fillColor('#666666')
               .font('Helvetica')
               .text(`Callo: ${llanta.callo_medida} mm`, xPos + 10, yOffset);
            
            doc.fontSize(7)
               .fillColor(llanta.callo_estado === 'Mal' ? '#dc2626' : '#16a34a')
               .font('Helvetica-Bold')
               .text(llanta.callo_estado, xPos + 85, yOffset);
          } else if (llanta.estado) {
            // ⚠️ Retrocompatibilidad
            doc.fontSize(7)
               .fillColor(llanta.estado === 'Mal' ? '#dc2626' : '#16a34a')
               .text(`Estado: ${llanta.estado}`, xPos + 10, yOffset);
          }
        });

        // Calcular yPos después de neumáticos
        const totalRows = Math.ceil(revision.llantas.length / cols);
        yPos += totalRows * (itemHeight + itemGap) + 10;
      }

      // 🆕 COMENTARIOS DE NEUMÁTICOS
      if (revision.comentarios_neumaticos && revision.comentarios_neumaticos.trim() !== '') {
        yPos += 10;

        // Verificar si necesitamos nueva página
        if (yPos > 680) {
          doc.addPage();
          yPos = 50;
        }

        const textHeight = Math.max(35, Math.ceil(revision.comentarios_neumaticos.length / 80) * 12);

        doc.rect(50, yPos, 512, textHeight)
           .fillColor('#fffbeb')
           .fill()
           .strokeColor('#fbbf24')
           .lineWidth(1)
           .stroke();

        doc.fontSize(8)
           .fillColor('#92400e')
           .font('Helvetica-Bold')
           .text('💬 Comentarios de neumáticos:', 60, yPos + 8);

        doc.fontSize(8)
           .fillColor('#1a1a1a')
           .font('Helvetica')
           .text(revision.comentarios_neumaticos, 60, yPos + 20, { width: 490 });

        yPos += textHeight + 10;
      }

      // ==========================================
      // COMENTARIOS GENERALES
      // ==========================================
      if (revision.comentarios && revision.comentarios.trim() !== '') {
        yPos += 20;

        // Verificar si necesitamos nueva página
        if (yPos > 650) {
          doc.addPage();
          yPos = 50;
        }

        doc.fontSize(11)
           .fillColor('#1a1a1a')
           .font('Helvetica-Bold')
           .text('COMENTARIOS GENERALES', 50, yPos);

        yPos += 20;

        const textHeight = Math.max(40, Math.ceil(revision.comentarios.length / 80) * 15);

        doc.rect(50, yPos, 512, textHeight)
           .fillColor('#f9fafb')
           .fill()
           .strokeColor('#e5e7eb')
           .stroke();

        doc.fontSize(9)
           .fillColor('#1a1a1a')
           .font('Helvetica')
           .text(revision.comentarios, 60, yPos + 10, { width: 490 });
      }

      // ==========================================
      // FOOTER (solo en última página)
      // ==========================================
      doc.fontSize(8)
         .fillColor('#999999')
         .text(
           `Generado: ${new Date().toLocaleString('es-MX')}`,
           50,
           doc.page.height - 50,
           { align: 'center', width: 512 }
         );

      // Finalizar
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