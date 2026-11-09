import express from 'express';
import cors from 'cors';
import pg from 'pg';
import fs from 'fs';
import path from 'path';
import multer from 'multer';

const { Pool } = pg;

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Ensure public/uploads directory exists on disk
const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Serve uploaded photos directly via Express
app.use('/uploads', express.static(uploadsDir));

// Serve compiled Vite frontend static files (production container mode)
const distDir = path.join(process.cwd(), 'dist');
if (fs.existsSync(distDir)) {
  app.use(express.static(distDir));
}

// Configure Multer storage for high-speed direct binary photo streaming
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname) || '.jpg';
    const cleanExt = ext.toLowerCase();
    const lote = req.params.lote || 'general';
    const filename = `foto_lote_${lote}_${Date.now()}_${Math.floor(Math.random() * 1000)}${cleanExt}`;
    cb(null, filename);
  }
});

const upload = multer({ storage, limits: { fileSize: 30 * 1024 * 1024 } });

// Connect to PostgreSQL database (Supports Docker/Podman env variables with local defaults)
const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'cementerios_db',
  password: process.env.DB_PASSWORD || 'admin123',
  port: parseInt(process.env.DB_PORT || '5432', 10),
});

pool.connect((err, client, release) => {
  if (err) {
    console.error('Error connecting to PostgreSQL database:', err.stack);
  } else {
    console.log('Successfully connected to PostgreSQL database: cementerios_db (localhost:5432)!');
    release();
  }
});

// Endpoint: SEARCH TUMBAS DIRECTLY AGAINST REAL POSTGRESQL 18 DATABASE (TOKEN-BASED & DEDUPLICATED)
app.get('/api/tumbas-search', async (req, res) => {
  const { q = '', gender = 'ALL', status = 'ALL', startDate = '', endDate = '' } = req.query;

  try {
    let whereClauses = [];
    let params = [];
    let paramIndex = 1;

    // 1. Text Search Filter (supports single words, full names, surnames, lot numbers, etc.)
    if (q.trim()) {
      const cleanQ = q.trim().toLowerCase();
      const cleanNum = q.replace(/^(lote|folio|recibo|sec|seccion|#|\s)+/gi, '').trim();
      const tokens = cleanQ.split(/\s+/).filter(Boolean);

      let tokenConditions = [];

      // If user typed a number, match exact lote
      if (cleanNum && !isNaN(cleanNum)) {
        tokenConditions.push(`l.identificador = $${paramIndex}`);
        params.push(cleanNum);
        paramIndex += 1;
      }

      // For every token entered (e.g. "JUAN", "PEREZ", "MAR"), it must match across the concatenated
      // deceased name or lot number (titular excluded from general text search)
      const multiWordClauses = tokens.map((token) => {
        const term = `%${token}%`;
        const clause = `(
          LOWER(l.identificador) LIKE $${paramIndex} OR
          LOWER(CONCAT_WS(' ', d.nombre, d.apellido_paterno, d.apellido_materno)) LIKE $${paramIndex}
        )`;
        params.push(term);
        paramIndex += 1;
        return clause;
      });

      if (multiWordClauses.length > 0) {
        tokenConditions.push(`(${multiWordClauses.join(' AND ')})`);
      }

      whereClauses.push(`(${tokenConditions.join(' OR ')})`);
    }

    // 2. Gender Filter (HOMBRE, MUJER, S/I)
    if (gender === 'HOMBRE') {
      whereClauses.push(`d.sexo = 1`);
    } else if (gender === 'MUJER') {
      whereClauses.push(`d.sexo = 2`);
    } else if (gender === 'SI' || gender === 'S/I') {
      whereClauses.push(`(d.sexo = 3 OR d.sexo IS NULL OR d.sexo NOT IN (1, 2))`);
    }

    // 3. Status Filter (REGULAR vs IRREGULAR)
    if (status === 'REGULAR') {
      whereClauses.push(`(d.vigencia_perpetuidad IS NOT NULL AND t.titular_id IS NOT NULL)`);
    } else if (status === 'IRREGULAR') {
      whereClauses.push(`(d.vigencia_perpetuidad IS NULL OR t.titular_id IS NULL)`);
    }

    // 4. Date Range Filters
    if (startDate) {
      whereClauses.push(`d.fecha_defuncion >= $${paramIndex}`);
      params.push(startDate);
      paramIndex += 1;
    }

    if (endDate) {
      whereClauses.push(`d.fecha_defuncion <= $${paramIndex}`);
      params.push(endDate);
      paramIndex += 1;
    }

    const whereSQL = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

    // Distinct per matched deceased, strictly excluding empty lots with no deceased
    const queryStr = `
      SELECT DISTINCT ON (d.difunto_id)
        l.lote_id,
        l.identificador AS lote,
        s.nombre AS seccion,
        CONCAT_WS(' ', t.nombre, t.apellido_paterno, t.apellido_materno) AS propietario,
        t.telefono,
        d.difunto_id,
        CONCAT_WS(' ', d.nombre, d.apellido_paterno, d.apellido_materno) AS difunto,
        TO_CHAR(d.fecha_defuncion, 'YYYY-MM-DD') AS fecha_defuncion,
        TO_CHAR(d.vigencia_perpetuidad, 'YYYY-MM-DD') AS vigencia_perpetuidad,
        CASE WHEN d.sexo = 1 THEN 'HOMBRE' WHEN d.sexo = 2 THEN 'MUJER' WHEN d.sexo = 3 THEN 'S/I' ELSE 'S/I' END AS sexo,
        COALESCE(n.numero_nivel, 1) AS numero_nivel,
        CASE WHEN d.vigencia_perpetuidad IS NULL OR t.titular_id IS NULL THEN true ELSE false END AS is_irregular
      FROM lote l
      LEFT JOIN seccion s ON l.seccion_id = s.seccion_id
      LEFT JOIN titular t ON l.titular_id = t.titular_id
      INNER JOIN nivel n ON l.lote_id = n.lote_id
      INNER JOIN difunto d ON n.difunto_id = d.difunto_id
      ${whereSQL}
      ORDER BY d.difunto_id, l.identificador ASC
      LIMIT 25;
    `;

    const result = await pool.query(queryStr, params);
    res.json(result.rows);
  } catch (err) {
    console.error('Error searching tumbas in PostgreSQL:', err);
    res.status(500).json({ error: 'Error al buscar tumbas en PostgreSQL' });
  }
});

// Endpoint: Fetch multi-level deceased records and photos for a tomb based on User Role
app.get('/api/tumbas/:lote', async (req, res) => {
  const { lote } = req.params;
  const role = req.query.role || 'admin';

  try {
    const query = `
      SELECT 
        l.lote_id,
        l.identificador AS lote,
        s.nombre AS seccion,
        l.observacion AS observacion_lote,
        CONCAT(t.nombre, ' ', t.apellido_paterno, ' ', COALESCE(t.apellido_materno, '')) AS propietario,
        t.nombre AS titular_nombre,
        t.apellido_paterno AS titular_app_paterno,
        t.apellido_materno AS titular_app_materno,
        t.telefono,
        t.direccion AS direccion_titular,
        json_agg(
          DISTINCT jsonb_build_object(
            'difunto_id', d.difunto_id,
            'numero_nivel', COALESCE(n.numero_nivel, 1),
            'nombre', CONCAT(d.nombre, ' ', d.apellido_paterno, ' ', COALESCE(d.apellido_materno, '')),
            'difunto_nombre', d.nombre,
            'difunto_app_paterno', d.apellido_paterno,
            'difunto_app_materno', d.apellido_materno,
            'fecha_defuncion', TO_CHAR(d.fecha_defuncion, 'YYYY-MM-DD'),
            'vigencia_perpetuidad', TO_CHAR(d.vigencia_perpetuidad, 'YYYY-MM-DD'),
            'sexo', CASE WHEN d.sexo = 1 THEN 'HOMBRE' WHEN d.sexo = 2 THEN 'MUJER' ELSE 'NO ESPECIFICADO' END,
            'sexo_raw', d.sexo,
            'causa_deceso', d.causa_deceso
          )
        ) FILTER (WHERE d.difunto_id IS NOT NULL) AS difuntos,
        json_agg(
          DISTINCT jsonb_build_object(
            'foto_id', f.foto_id,
            'foto_url', f.foto_url
          )
        ) FILTER (WHERE f.foto_id IS NOT NULL) AS fotos
      FROM lote l
      LEFT JOIN seccion s ON l.seccion_id = s.seccion_id
      LEFT JOIN titular t ON l.titular_id = t.titular_id
      LEFT JOIN nivel n ON l.lote_id = n.lote_id
      LEFT JOIN difunto d ON n.difunto_id = d.difunto_id
      LEFT JOIN foto f ON l.lote_id = f.lote_id
      WHERE l.identificador = $1
      GROUP BY l.lote_id, s.nombre, t.titular_id;
    `;
    const result = await pool.query(query, [lote]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Lote no encontrado en la Base de Datos' });
    }

    const row = result.rows[0];
    let difuntosList = row.difuntos || [];
    const fotosList = row.fotos || [];

    difuntosList.sort((a, b) => Number(a.numero_nivel || 1) - Number(b.numero_nivel || 1));

    if (role === 'public') {
      return res.json({
        role: 'public',
        lote: row.lote,
        seccion: row.seccion,
        difuntos: difuntosList.map((d) => ({
          difunto_id: d.difunto_id,
          numero_nivel: d.numero_nivel,
          nombre: d.nombre,
          fecha_defuncion: d.fecha_defuncion,
          sexo: d.sexo,
          causa_deceso: d.causa_deceso
        })),
        observacion: row.observacion_lote,
        fotos: fotosList,
        propietario: null,
        telefono: null,
        direccionTitular: null
      });
    }

    res.json({
      role: 'admin',
      lote: row.lote,
      seccion: row.seccion,
      difuntos: difuntosList,
      propietario: row.propietario ? row.propietario.trim() : null,
      titularNombre: row.titular_nombre,
      titularAppPaterno: row.titular_app_paterno,
      titularAppMaterno: row.titular_app_materno,
      telefono: row.telefono,
      direccionTitular: row.direccion_titular,
      observacion: row.observacion_lote,
      fotos: fotosList
    });
  } catch (err) {
    console.error('Database query error:', err);
    res.status(500).json({ error: 'Error al consultar la Base de Datos PostgreSQL' });
  }
});

// Endpoint: ADD PHOTO VIA DIRECT BINARY MULTIPART FORM-DATA (MULTER) OR URL (INSTANT & BULLETPROOF)
app.post('/api/tumbas/:lote/fotos', upload.single('foto'), async (req, res) => {
  const { lote } = req.params;
  let finalFotoUrl = null;

  if (req.file) {
    finalFotoUrl = `/uploads/${req.file.filename}`;
  } else if (req.body && req.body.fotoUrl) {
    const fotoUrl = req.body.fotoUrl;
    if (typeof fotoUrl === 'string' && fotoUrl.startsWith('data:image/')) {
      const commaIdx = fotoUrl.indexOf(',');
      if (commaIdx !== -1) {
        const meta = fotoUrl.slice(0, commaIdx);
        const base64Data = fotoUrl.slice(commaIdx + 1);
        let ext = 'jpg';
        if (meta.includes('png')) ext = 'png';
        else if (meta.includes('webp')) ext = 'webp';

        const filename = `foto_lote_${lote}_${Date.now()}_${Math.floor(Math.random() * 1000)}.${ext}`;
        const filePath = path.join(uploadsDir, filename);

        fs.writeFileSync(filePath, Buffer.from(base64Data, 'base64'));
        finalFotoUrl = `/uploads/${filename}`;
      }
    } else {
      finalFotoUrl = fotoUrl;
    }
  }

  if (!finalFotoUrl) {
    return res.status(400).json({ error: 'No se recibió ninguna imagen o URL válida' });
  }

  try {
    let loteRes = await pool.query('SELECT lote_id FROM lote WHERE identificador = $1', [lote]);
    let loteId;

    if (loteRes.rows.length === 0) {
      const newLote = await pool.query(
        'INSERT INTO lote (identificador, seccion_id, catalogo_id) VALUES ($1, 1, 1) RETURNING lote_id',
        [lote]
      );
      loteId = newLote.rows[0].lote_id;
    } else {
      loteId = loteRes.rows[0].lote_id;
    }

    const newFoto = await pool.query(
      'INSERT INTO foto (lote_id, foto_url) VALUES ($1, $2) RETURNING foto_id, foto_url',
      [loteId, finalFotoUrl]
    );

    console.log(`[PHOTOS] Successfully saved photo for lote ${lote}: ${finalFotoUrl}`);
    res.json({ success: true, foto: newFoto.rows[0], message: 'Foto guardada con éxito en disco y PostgreSQL 18' });
  } catch (err) {
    console.error('Error adding photo to PostgreSQL:', err);
    res.status(500).json({ error: err.message || 'Error al guardar foto en PostgreSQL' });
  }
});

// Endpoint: DELETE PHOTO FROM DISK & POSTGRESQL
app.delete('/api/fotos/:fotoId', async (req, res) => {
  const { fotoId } = req.params;

  try {
    const fotoRes = await pool.query('SELECT foto_url FROM foto WHERE foto_id = $1', [fotoId]);
    if (fotoRes.rows.length > 0) {
      const fotoUrl = fotoRes.rows[0].foto_url;
      if (fotoUrl.startsWith('/uploads/')) {
        const filePath = path.join(process.cwd(), 'public', fotoUrl);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      }
    }

    await pool.query('DELETE FROM foto WHERE foto_id = $1', [fotoId]);
    res.json({ success: true, message: 'Foto eliminada con éxito' });
  } catch (err) {
    console.error('Error deleting photo:', err);
    res.status(500).json({ error: 'Error al eliminar foto' });
  }
});

// Endpoint 1: REGISTER A NEW DECEASED (AUTOMATICALLY PLACED ON TOP: NIVEL #1, PREVIOUS SHIFT DOWN)
app.post('/api/tumbas/:lote/difuntos', async (req, res) => {
  const { lote } = req.params;
  const {
    nombre,
    apellidoPaterno,
    apellidoMaterno,
    sexo = 1,
    fechaDefuncion,
    vigenciaPerpetuidad,
    causaDeceso
  } = req.body;

  if (!nombre || !nombre.trim()) {
    return res.status(400).json({ error: 'El nombre del difunto es obligatorio' });
  }

  try {
    let loteRes = await pool.query('SELECT lote_id FROM lote WHERE identificador = $1', [lote]);
    let loteId;

    if (loteRes.rows.length === 0) {
      const newLote = await pool.query(
        'INSERT INTO lote (identificador, seccion_id, catalogo_id) VALUES ($1, 1, 1) RETURNING lote_id',
        [lote]
      );
      loteId = newLote.rows[0].lote_id;
    } else {
      loteId = loteRes.rows[0].lote_id;
    }

    const sexoStr = String(sexo).toUpperCase();
    let sexoCode = 1;
    if (sexoStr.includes('MUJER') || sexoStr === '2') {
      sexoCode = 2;
    } else if (sexoStr.includes('S/I') || sexoStr.includes('SI') || sexoStr.includes('SIN') || sexoStr === '3') {
      sexoCode = 3;
    } else if (sexoStr.includes('HOMBRE') || sexoStr === '1') {
      sexoCode = 1;
    } else {
      sexoCode = 3;
    }

    // 1. Shift all existing deceased in this lote down (+1 to their level)
    await pool.query(`
      UPDATE nivel 
      SET numero_nivel = numero_nivel + 1 
      WHERE lote_id = $1
    `, [loteId]);

    // 2. Insert new deceased
    const newDifunto = await pool.query(`
      INSERT INTO difunto (nombre, apellido_paterno, apellido_materno, fecha_defuncion, vigencia_perpetuidad, sexo, causa_deceso)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING difunto_id
    `, [
      nombre.trim(),
      apellidoPaterno ? apellidoPaterno.trim() : null,
      apellidoMaterno ? apellidoMaterno.trim() : null,
      fechaDefuncion || null,
      vigenciaPerpetuidad || null,
      sexoCode,
      causaDeceso ? causaDeceso.trim() : null
    ]);

    const difuntoId = newDifunto.rows[0].difunto_id;

    // 3. Place new deceased at the top (Nivel #1)
    await pool.query(`
      INSERT INTO nivel (numero_nivel, lote_id, difunto_id)
      VALUES (1, $1, $2)
    `, [loteId, difuntoId]);

    res.json({ success: true, message: 'Nuevo difunto colocado en la parte superior (Nivel #1) con éxito' });
  } catch (err) {
    console.error('Error adding deceased to PostgreSQL:', err);
    res.status(500).json({ error: 'Error al registrar difunto en PostgreSQL' });
  }
});

// Endpoint 2: UPDATE TITULAR AND LOTE OBSERVATIONS (DEDICATED TITULAR FORM)
app.put('/api/tumbas/:lote/titular', async (req, res) => {
  const { lote } = req.params;
  const {
    nombre,
    apellidoPaterno,
    apellidoMaterno,
    telefono,
    direccion,
    observacion
  } = req.body;

  try {
    let loteRes = await pool.query('SELECT lote_id, titular_id FROM lote WHERE identificador = $1', [lote]);
    let loteId;
    let titularId;

    if (loteRes.rows.length === 0) {
      const newLote = await pool.query(
        'INSERT INTO lote (identificador, seccion_id, catalogo_id, observacion) VALUES ($1, 1, 1, $2) RETURNING lote_id',
        [lote, observacion || null]
      );
      loteId = newLote.rows[0].lote_id;
    } else {
      loteId = loteRes.rows[0].lote_id;
      titularId = loteRes.rows[0].titular_id;

      if (observacion !== undefined) {
        await pool.query('UPDATE lote SET observacion = $1 WHERE lote_id = $2', [observacion, loteId]);
      }
    }

    if (nombre && nombre.trim()) {
      if (titularId) {
        await pool.query(`
          UPDATE titular 
          SET nombre = $1, apellido_paterno = $2, apellido_materno = $3, telefono = $4, direccion = $5 
          WHERE titular_id = $6
        `, [
          nombre.trim(),
          apellidoPaterno ? apellidoPaterno.trim() : null,
          apellidoMaterno ? apellidoMaterno.trim() : null,
          telefono || null,
          direccion || null,
          titularId
        ]);
      } else {
        const newTitular = await pool.query(`
          INSERT INTO titular (nombre, apellido_paterno, apellido_materno, telefono, direccion) 
          VALUES ($1, $2, $3, $4, $5) 
          RETURNING titular_id
        `, [
          nombre.trim(),
          apellidoPaterno ? apellidoPaterno.trim() : null,
          apellidoMaterno ? apellidoMaterno.trim() : null,
          telefono || null,
          direccion || null
        ]);
        titularId = newTitular.rows[0].titular_id;
        await pool.query('UPDATE lote SET titular_id = $1 WHERE lote_id = $2', [titularId, loteId]);
      }
    }

    res.json({ success: true, message: `Datos del Titular actualizados con éxito en Lote #${lote}` });
  } catch (err) {
    console.error('Error updating titular in PostgreSQL:', err);
    res.status(500).json({ error: 'Error al actualizar datos del titular' });
  }
});

// Endpoint 3: UPDATE AN EXISTING DECEASED PERSON (CRUD UPDATE)
app.put('/api/difuntos/:difuntoId', async (req, res) => {
  const { difuntoId } = req.params;
  const {
    nombre,
    apellidoPaterno,
    apellidoMaterno,
    fechaDefuncion,
    vigenciaPerpetuidad,
    sexo, // 1 for Hombre, 2 for Mujer
    causaDeceso
  } = req.body;

  try {
    const sexoStr = String(sexo).toUpperCase();
    let sexoCode = 1;
    if (sexoStr.includes('MUJER') || sexoStr === '2') {
      sexoCode = 2;
    } else if (sexoStr.includes('S/I') || sexoStr.includes('SI') || sexoStr.includes('SIN') || sexoStr === '3') {
      sexoCode = 3;
    } else if (sexoStr.includes('HOMBRE') || sexoStr === '1') {
      sexoCode = 1;
    } else {
      sexoCode = 3;
    }

    await pool.query(`
      UPDATE difunto
      SET nombre = $1,
          apellido_paterno = $2,
          apellido_materno = $3,
          fecha_defuncion = $4,
          vigencia_perpetuidad = $5,
          sexo = $6,
          causa_deceso = $7
      WHERE difunto_id = $8
    `, [
      nombre,
      apellidoPaterno || null,
      apellidoMaterno || null,
      fechaDefuncion || null,
      vigenciaPerpetuidad || null,
      sexoCode,
      causaDeceso || null,
      difuntoId
    ]);

    res.json({ success: true, message: 'Datos del difunto actualizados con éxito en PostgreSQL 18' });
  } catch (err) {
    console.error('Error updating deceased in PostgreSQL:', err);
    res.status(500).json({ error: 'Error al actualizar datos del difunto' });
  }
});

// Endpoint 4: DELETE A DECEASED PERSON FROM A LOTE (CRUD DELETE)
app.delete('/api/tumbas/:lote/difuntos/:difuntoId', async (req, res) => {
  const { lote, difuntoId } = req.params;

  try {
    const loteRes = await pool.query('SELECT lote_id FROM lote WHERE identificador = $1', [lote]);
    if (loteRes.rows.length === 0) {
      return res.status(404).json({ error: 'Lote no encontrado' });
    }
    const loteId = loteRes.rows[0].lote_id;

    // 1. Remove from table nivel
    await pool.query('DELETE FROM nivel WHERE lote_id = $1 AND difunto_id = $2', [loteId, difuntoId]);

    // 2. Remove from table difunto
    await pool.query('DELETE FROM difunto WHERE difunto_id = $1', [difuntoId]);

    // 3. Renumber remaining levels sequentially (1, 2, 3...)
    const remainingNiveles = await pool.query(
      'SELECT nivel_id FROM nivel WHERE lote_id = $1 ORDER BY numero_nivel ASC',
      [loteId]
    );

    for (let i = 0; i < remainingNiveles.rows.length; i++) {
      await pool.query('UPDATE nivel SET numero_nivel = $1 WHERE nivel_id = $2', [
        i + 1,
        remainingNiveles.rows[i].nivel_id
      ]);
    }

    res.json({ success: true, message: 'Difunto eliminado y niveles actualizados con éxito' });
  } catch (err) {
    console.error('Error deleting deceased from PostgreSQL:', err);
    res.status(500).json({ error: 'Error al eliminar difunto de la base de datos' });
  }
});

// Endpoint 5: REORDER DECEASED LEVELS VIA DRAG & DROP
app.post('/api/tumbas/:lote/reorder-niveles', async (req, res) => {
  const { lote } = req.params;
  const { niveles } = req.body;

  try {
    const loteRes = await pool.query('SELECT lote_id FROM lote WHERE identificador = $1', [lote]);
    if (loteRes.rows.length === 0) {
      return res.status(404).json({ error: 'Lote no encontrado' });
    }
    const loteId = loteRes.rows[0].lote_id;

    if (Array.isArray(niveles)) {
      for (const item of niveles) {
        if (item.difunto_id && item.numero_nivel) {
          await pool.query(
            'UPDATE nivel SET numero_nivel = $1 WHERE lote_id = $2 AND difunto_id = $3',
            [item.numero_nivel, loteId, item.difunto_id]
          );
        }
      }
    }

    res.json({ success: true, message: 'Niveles reordenados con éxito en PostgreSQL 18' });
  } catch (err) {
    console.error('Error reordering levels in PostgreSQL:', err);
    res.status(500).json({ error: 'Error al reordenar niveles en PostgreSQL' });
  }
});

// Endpoint: Status check
app.get('/api/status', async (req, res) => {
  try {
    const result = await pool.query('SELECT current_database(), current_user, version();');
    res.json({
      connected: true,
      database: result.rows[0].current_database,
      user: result.rows[0].current_user,
      version: result.rows[0].version
    });
  } catch (err) {
    res.status(500).json({ connected: false, error: err.message });
  }
});

// SPA Fallback: Serve index.html for any route not matched by API endpoints (Express 5 compatible)
app.use((req, res, next) => {
  if (req.method !== 'GET' || req.path.startsWith('/api') || req.path.startsWith('/uploads')) {
    return next();
  }
  const indexPath = path.join(distDir, 'index.html');
  if (fs.existsSync(indexPath)) {
    return res.sendFile(indexPath);
  }
  next();
});

app.listen(PORT, () => {
  console.log(`Backend API PostgreSQL Multi-Level Deceased running on http://localhost:${PORT}`);
});
