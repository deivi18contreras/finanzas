import Tesseract from 'tesseract.js';
import fs from 'fs';
import Transaccion from '../models/Transaccion.js';

export const escanearFactura = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ msg: 'No se ha subido ninguna imagen de factura' })
        }

        const rutaImagen = req.file.path;

        const { data: { text } } = await Tesseract.recognize(rutaImagen, 'spa');
        fs.unlinkSync(rutaImagen);

        const lineas = text.split('\n');
        let montoDetectado = 0;
        let comercioDetectado = "Comercio Desconocido";

        if (lineas.length > 0) { comercioDetectado = lineas.find(l => l.trim().length > 4) || "Comercio Desconocido" }

        const patromTotal = /(total|neto|valor|pago|total:\s*)\s*[:$]?\s*([\d.,]+)/i;

        for (const linea of lineas) {
            const coincidencia = linea.match(patromTotal);
            if (coincidencia) {
                let numeroLimpio = coincidencia[2].replace(/[.,]/g, '');
                montoDetectado = parseInt(numeroLimpio) || 0;
                break;
            }
        }

        res.json({
            success: true,
            msg: 'Factura procesada con éxito',
            datosSugeridos: {
                comercio: comercioDetectado.trim(),
                monto: montoDetectado,
                categoria: 'Gastos Varios',
                descripcion: `Escaneo automático de factura en: ${comercioDetectado.trim()}`
            },
            textoCompletoIdentificado: text
        });
    } catch (error) {
        console.error('Error en el procesamiento OCR:', error);
        res.status(500).json({ msg: 'Error interno al procesar la factura' });

    }
}