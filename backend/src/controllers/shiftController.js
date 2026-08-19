const { db } = require('../config/db');
const PDFDocument = require('pdfkit');

exports.closeShiftAndGeneratePDF = (req, res) => {
    try {
        const userId = req.user.id;

        // 1. Captura o estado exato de todo o estoque no momento
        const stmt = db.prepare(`
            SELECT p.name, b.name as bar_name, i.quantity
            FROM inventory i
            JOIN products p ON i.product_id = p.id
            JOIN bars b ON i.bar_id = b.id
            ORDER BY b.name, p.category, p.name
        `);
        const currentStock = stmt.all();
        
        // Converte o array em uma string para armazenar como histórico imutável
        const snapshotJson = JSON.stringify(currentStock);

        // 2. Salva o registro do fechamento no banco de dados
        const insertStmt = db.prepare('INSERT INTO shift_closures (closed_by, snapshot_json) VALUES (?, ?)');
        insertStmt.run(userId, snapshotJson);

        // 3. Inicia a criação do PDF
        const doc = new PDFDocument({ margin: 50 });

        // Avisa ao navegador do cliente que ele está recebendo um arquivo binário (PDF) para download
        res.setHeader('Content-disposition', 'attachment; filename=Relatorio_Fechamento.pdf');
        res.setHeader('Content-type', 'application/pdf');

        doc.pipe(res);

        // 4. Desenha o conteúdo do PDF
        doc.fontSize(22).text('Viero Stock', { align: 'center' });
        doc.fontSize(16).text('Relatório de Fechamento de Turno', { align: 'center' });
        doc.moveDown();
        
        doc.fontSize(12).text(`Data do Fechamento: ${new Date().toLocaleString('pt-BR')}`);
        doc.text(`Responsável pelo encerramento: ${req.user.username}`);
        doc.moveDown(2);

        let currentBar = '';
        currentStock.forEach(item => {
            if (item.bar_name !== currentBar) {
                currentBar = item.bar_name;
                doc.moveDown();
                doc.fontSize(14).font('Helvetica-Bold').text(`--- ${currentBar} ---`);
                doc.font('Helvetica').moveDown(0.5);
            }
            
            const dotLeader = '.'.repeat(60 - item.name.length);
            doc.fontSize(11).text(`${item.name} ${dotLeader} ${item.quantity} un.`);
        });

        doc.moveDown(3);
        doc.fontSize(10).fillColor('gray').text('Documento gerado automaticamente pelo sistema Viero Stock.', { align: 'center' });
        doc.end();

    } catch (error) {
        console.error('Erro no fechamento de turno:', error);
        if (!res.headersSent) {
            res.status(500).json({ error: 'Erro interno ao gerar o fechamento.' });
        }
    }
};