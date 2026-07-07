import Categoria from '../models/Categoria.js';

export const crearCategoria = async (req, res) => {
    try {
        const { nombre, icono, color, tipo, usuarioId } = req.body;
        const uId = usuarioId || (req.usuario ? req.usuario._id : null);

        const existeCategoria = await Categoria.findOne({
            nombre: nombre.trim(),
            tipo,
            usuarioId: uId || null
        });

        if (existeCategoria) {
            return res.status(400).json({ msg: 'Esta categoría ya existe para este tipo de movimiento' });
        }

        const nuevaCategoria = new Categoria({
            nombre: nombre.trim(),
            icono,
            color,
            tipo,
            usuarioId: uId || null
        });

        await nuevaCategoria.save();

        res.status(201).json({
            success: true,
            msg: 'Categoría creada exitosamente',
            categoria: nuevaCategoria
        });
    } catch (error) {
        console.error('Error al crear categoría:', error);
        res.status(500).json({ msg: 'Error interno al registrar la categoría' });
    }
};

export const obtenerCategorias = async (req, res) => {
    try {
        const usuarioId = req.query.usuarioId || (req.usuario ? req.usuario._id : null);
        const { tipo } = req.query;

        if (!tipo) {
            return res.status(400).json({ msg: 'El parámetro tipo (ingreso/gasto/deudas) es requerido' });
        }

        const categorias = await Categoria.find({
            tipo,
            $or: [
                { usuarioId: null },
                { usuarioId: usuarioId || null }
            ]
        }).sort({ nombre: 1 }); // Ordenadas alfabéticamente

        res.json({
            success: true,
            categorias
        });
    } catch (error) {
        console.error('Error al obtener categorías:', error);
        res.status(500).json({ msg: 'Error al cargar las categorías' });
    }
};

export const eliminarCategoria = async (req, res) => {
    try {
        const { categoriaId } = req.params;

        const categoria = await Categoria.findById(categoriaId);
        if (!categoria) {
            return res.status(404).json({ msg: 'Categoría no encontrada' });
        }

        if (!categoria.usuarioId) {
            return res.status(403).json({ msg: 'No se pueden eliminar las categorías base del sistema' });
        }

        await Categoria.findByIdAndDelete(categoriaId);

        res.json({
            success: true,
            msg: 'Categoría personalizada eliminada correctamente'
        });
    } catch (error) {
        console.error('Error al eliminar categoría:', error);
        res.status(500).json({ msg: 'Error interno al eliminar la categoría' });
    }
};