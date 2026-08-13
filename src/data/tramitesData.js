export const TRAMITES_PANTEONES = [
  {
    id: 'sepelio-primera-vez',
    title: 'Sepelio por Primera Vez',
    category: 'Inhumación',
    shortDesc: 'Asignación de lote por primera vez para inhumación en panteones municipales.',
    description: 'Trámite necesario para realizar la sepultura e inhumación por primera vez en un panteón municipal que cuente con lotes disponibles.',
    dependencia: 'Jefatura de Panteones',
    dirigidoA: 'Público en General',
    vigencia: '7 Años (Sujeto a refrendo posterior)',
    tiempoRespuesta: 'Atención prioritaria inmediata',
    ubicacion: 'Ignacio Zaragoza 404, Col. Centro, Coatzacoalcos, Ver. (Anexo del Palacio Municipal)',
    telefono: '(921) 211-2100 Ext: 2479',
    horario: 'Lunes a Viernes 09:00 a 16:30 hrs. | Sábados y Domingos 10:00 a 14:00 hrs.',
    pasos: [
      'Presentarse en la oficina del Panteón Municipal que tenga lotes disponibles con la documentación completa.',
      'El administrador del panteón asignará un lote y anexará boletas a sus documentos.',
      'Acudir con las boletas a la oficina de Jefatura de Panteones en el Anexo del Palacio Municipal.',
      'Realizar los pagos correspondientes de derechos y permisos de construcción.',
      'Acudir al Registro Civil para tramitar el Permiso de Inhumación y Acta de Defunción.'
    ],
    requisitosPanteon: [
      '2 copias de Credencial de Elector (INE) de la persona que quedará como titular (debe ser familiar directo: esposo/a, hijo/a o padres).',
      '2 copias de documentos comprobatorios del parentesco (Acta de Nacimiento o Acta de Matrimonio).',
      '2 copias del Certificado de Defunción.',
      'En caso de fallecimiento fuera de Coatzacoalcos: Anexar 2 copias de Hoja de Traslado.',
      'En caso de intervención de Fiscalía: Anexar 2 copias de Hoja de Liberación y demás documentos otorgados por Fiscalía.'
    ],
    requisitosRegistroCivil: [
      '2 copias de INE del tramitante.',
      '2 copias del Certificado de Defunción original.',
      '2 copias del CURP del fallecido.',
      '2 copias de la Credencial de Elector del fallecido.',
      '2 copias de Acta de Matrimonio del fallecido (si aplica).',
      '2 copias de Acta de Nacimiento del fallecido.'
    ],
    costos: [
      { concepto: 'Perpetuidad (7 años por adelantado)', monto: '$ 1,349.00' },
      { concepto: 'Permiso de Construcción', monto: '$ 1,067.00' },
      { concepto: 'Trámites en Registro Civil', monto: 'Según arancel municipal vigente' }
    ],
    fundamentoLegal: 'Artículo 228 y Artículo 229 Capítulo VII del Código Hacendario Municipal.',
    notasImportantes: 'El trámite se inicia directamente en el panteón que disponga de lotes libres en ese momento.'
  },
  {
    id: 'sepelio',
    title: 'Sepelio (Reinhumación / Lote Existente)',
    category: 'Inhumación',
    shortDesc: 'Uso de lote existente para sepultura o reinhumación de un familiar.',
    description: 'Trámite para hacer uso de un lote familiar previamente asignado. Requiere que la perpetuidad esté al corriente (vigente). Si el titular era la persona fallecida, deberá tramitarse simultáneamente el Cambio de Propietario.',
    dependencia: 'Jefatura de Panteones',
    dirigidoA: 'Público en General',
    vigencia: 'Sujeto a vigencia del Título de Perpetuidad',
    tiempoRespuesta: 'Atención prioritaria inmediata',
    ubicacion: 'Ignacio Zaragoza 404, Col. Centro, Coatzacoalcos, Ver. (Anexo del Palacio Municipal)',
    telefono: '(921) 211-2100 Ext: 2479',
    horario: 'Lunes a Viernes 09:00 a 16:30 hrs. | Sábados y Domingos 10:00 a 14:00 hrs.',
    pasos: [
      'Presentarse en la oficina del panteón donde se ubica el lote con el Título de Perpetuidad y los documentos.',
      'El administrador del panteón revisará el estado del lote y anexará boletas a sus documentos.',
      'Llevar la documentación a la Jefatura de Panteones (Anexo Palacio Municipal) para liquidar derechos o regularizar años de atraso.',
      'Si se requiere construir bóveda o monumento, solicitar el Permiso de Construcción.',
      'Realizar los pagos correspondientes en Registro Civil (Permiso de Inhumación).'
    ],
    requisitosPanteon: [
      '2 copias del Título de Perpetuidad VIGENTE.',
      '2 copias de Credencial de Elector del titular con leyenda de autorización escrita para sepultar a la persona fallecida.',
      '2 copias de las Actas de Defunción de cada una de las personas previamente sepultadas en el lote.',
      '2 fotografías impresas de la tumba actual.',
      '2 copias del Certificado de Defunción de la persona por sepultar.',
      'Si es depósito de cenizas: 2 copias del Acta de Defunción y 2 copias de Constancia de Cremación.',
      'Si falleció fuera de Coatzacoalcos: 2 copias de Hoja de Traslado.',
      'Si intervino Fiscalía: 2 copias de Hoja de Liberación.'
    ],
    requisitosRegistroCivil: [
      '2 copias de INE del tramitante.',
      'Permisos de Inhumación emitidos por la Jefatura de Panteones.',
      'Acta de Defunción correspondiente.'
    ],
    costos: [
      { concepto: 'Perpetuidad (Refrendo / Regularización)', monto: '$ 1,349.00' },
      { concepto: 'Permiso de Construcción (si se construye bóveda)', monto: '$ 1,067.00' },
      { concepto: 'Cambio de Propietario (si el titular es el difunto)', monto: '$ 1,214.00' },
      { concepto: 'Trámites en Registro Civil', monto: 'Según arancel vigente' }
    ],
    fundamentoLegal: 'Artículo 228 y Artículo 229 Capítulo VII del Código Hacendario Municipal.',
    notasImportantes: 'La perpetuidad debe estar VIGENTE obligatoriamente. Si tiene años de rezago, deben cubrirse los pagos atrasados y multas antes de autorizar el sepelio.'
  },
  {
    id: 'nicho-primera-vez',
    title: 'Nicho por Primera Vez',
    category: 'Nichos',
    shortDesc: 'Asignación de espacio en nicho municipal por primera vez para urnas de cenizas.',
    description: 'Trámite para adquisición de un derecho de nicho municipal por primera vez para resguardar cenizas funerarias.',
    dependencia: 'Jefatura de Panteones',
    dirigidoA: 'Público en General',
    vigencia: '7 Años (Renovable)',
    tiempoRespuesta: 'Atención el mismo día',
    ubicacion: 'Ignacio Zaragoza 404, Col. Centro, Coatzacoalcos, Ver. (Anexo del Palacio Municipal)',
    telefono: '(921) 211-2100 Ext: 2479',
    horario: 'Lunes a Viernes 08:30 a 16:00 hrs. | Sábados y Domingos 10:00 a 14:00 hrs.',
    pasos: [
      'Acudir al Panteón Municipal que cuente con nichos disponibles.',
      'Presentar la documentación requerida para la asignación formal del espacio.',
      'El administrador del panteón asignará el nicho y emitirá las boletas de pago.',
      'Entregar el expediente en la Jefatura de Panteones en el Anexo del Palacio Municipal.',
      'Realizar el trámite de Permiso de Inhumación de cenizas en el Registro Civil.'
    ],
    requisitosPanteon: [
      '2 copias de Credencial de Elector del titular (familiar directo: esposo/a, hijo/a o padres).',
      '2 copias de documentos comprobatorios del parentesco (Acta de Nacimiento o Acta de Matrimonio).',
      '2 copias del Acta de Defunción.',
      '2 copias de la Constancia de Cremación oficial.'
    ],
    requisitosRegistroCivil: [
      '2 copias de INE del tramitante.',
      'Acta de Defunción.',
      'Constancia de Cremación.'
    ],
    costos: [
      { concepto: 'Perpetuidad de Nicho (7 años por adelantado)', monto: '$ 1,754.00' },
      { concepto: 'Permiso de Construcción / Colocación', monto: '$ 1,067.00' },
      { concepto: 'Pago en Registro Civil (Permiso de Inhumación)', monto: 'Según arancel vigente' }
    ],
    fundamentoLegal: 'Artículo 228 y Artículo 229 Capítulo VII del Código Hacendario Municipal.',
    notasImportantes: 'Sujeto a disponibilidad de espacios en los panteones que cuenten con módulo de nichos.'
  },
  {
    id: 'deposito-cenizas-nicho',
    title: 'Depósito de Cenizas en Nicho',
    category: 'Nichos',
    shortDesc: 'Uso de un nicho existente para depositar urna de cenizas adicional.',
    description: 'Trámite para autorizar el depósito de cenizas en un nicho previamente contratado y con perpetuidad vigente.',
    dependencia: 'Jefatura de Panteones',
    dirigidoA: 'Público en General',
    vigencia: 'Sujeto a la vigencia del Título de Nicho',
    tiempoRespuesta: 'Atención el mismo día',
    ubicacion: 'Ignacio Zaragoza 404, Col. Centro, Coatzacoalcos, Ver. (Anexo del Palacio Municipal)',
    telefono: '(921) 211-2100 Ext: 2479',
    horario: 'Lunes a Viernes 08:30 a 16:00 hrs.',
    pasos: [
      'Acudir a la administración del panteón donde se ubica el nicho.',
      'Verificar que el Título de Perpetuidad del Nicho se encuentre VIGENTE.',
      'Entregar requisitos al administrador para recibir las boletas de autorización.',
      'Finalizar el pago de derechos en la Jefatura de Panteones (Anexo del Palacio Municipal).',
      'Efectuar el pago de permiso de inhumación en las oficinas del Registro Civil.'
    ],
    requisitosPanteon: [
      '2 copias del Título de Perpetuidad del Nicho VIGENTE.',
      '2 copias de Credencial de Elector del titular con leyenda escrita de autorización para el depósito de cenizas.',
      '2 copias de las Actas de Defunción de cada una de las personas cuyas cenizas ya reposan en el nicho.',
      '2 fotografías del nicho actual.',
      '2 copias del Acta de Defunción de la persona cuyas cenizas serán depositadas.',
      '2 copias de la Constancia de Cremación.'
    ],
    requisitosRegistroCivil: [
      'Copia de Credencial de Elector del tramitante.',
      '2 copias del Acta de Defunción.',
      '2 copias de la Constancia de Cremación.'
    ],
    costos: [
      { concepto: 'Perpetuidad de Nicho (si está al corriente)', monto: '$ 1,754.00' },
      { concepto: 'Recargo por año de atraso (si aplica rezago)', monto: '$ 250.00 / año' },
      { concepto: 'Multa por año de atraso (si aplica rezago)', monto: '$ 120.00 / año' },
      { concepto: 'Costo total por año de atraso', monto: '$ 370.00 / año de rezago' }
    ],
    fundamentoLegal: 'Artículo 228 y Artículo 229 Capítulo VII del Código Hacendario Municipal.',
    notasImportantes: 'Si la perpetuidad de nicho está vencida, deben regularizarse los años de atraso con sus respectivas multas.'
  },
  {
    id: 'pago-perpetuidad',
    title: 'Pago de Perpetuidad (Refrendo de Lote)',
    category: 'Mantenimiento y Derechos',
    shortDesc: 'Refrendo y actualización del derecho de perpetuidad quinquenal/septenal en fosas.',
    description: 'Trámite de actualización y pago del derecho de Perpetuidad para conservar y mantener la vigencia del lote en los panteones municipales.',
    dependencia: 'Jefatura de Panteones',
    dirigidoA: 'Público en General',
    vigencia: '7 años',
    tiempoRespuesta: 'Atención el mismo día',
    ubicacion: 'Ignacio Zaragoza 404, Col. Centro, Coatzacoalcos, Ver. (Anexo del Palacio Municipal)',
    telefono: '(921) 211-2100 Ext: 2479',
    horario: 'Lunes a Viernes 08:30 a 16:00 hrs.',
    pasos: [
      'Iniciar el trámite en la oficina del Panteón donde se encuentra la tumba/lote.',
      'Presentar la documentación exigida para validación física e histórica de la fosa.',
      'El administrador del panteón emitirá la orden de pago/boleta.',
      'Llevar las boletas a la Jefatura de Panteones en el Anexo del Palacio Municipal para efectuar el pago correspondiente.'
    ],
    requisitosPanteon: [
      'Título de Perpetuidad ORIGINAL y 1 copia fotostática.',
      '2 copias de la Credencial de Elector (INE) del titular.',
      '2 copias de las Actas de Defunción de cada una de las personas sepultadas en la tumba.',
      '2 fotografías impresas actuales de la tumba.',
      'En caso de que el titular no acuda personalmente: En las copias de su INE debe incluir leyenda de autorización firmada a favor de un representante, quien presentará además 2 copias de su propia INE.'
    ],
    requisitosRegistroCivil: [],
    costos: [
      { concepto: 'Refrendo de Perpetuidad al corriente (7 años)', monto: '$ 1,349.00' },
      { concepto: 'Año con rezago / atraso', monto: '$ 193.00 / año' },
      { concepto: 'Multa por año de atraso', monto: '$ 120.00 / año' },
      { concepto: 'Total por cada año con atraso acumulado', monto: '$ 313.00 / año' }
    ],
    fundamentoLegal: 'Artículo 228 y Artículo 229 Capítulo VII del Código Hacendario Municipal.',
    notasImportantes: 'Mantener la perpetuidad al corriente garantiza la titularidad y evita problemas en futuros sepelios o trámites de construcción.'
  },
  {
    id: 'perpetuidad-nicho',
    title: 'Perpetuidad de Nicho (Refrendo)',
    category: 'Mantenimiento y Derechos',
    shortDesc: 'Actualización y pago del derecho de mantenimiento y uso de nicho municipal.',
    description: 'Renovación y actualización del derecho de Perpetuidad correspondiente a nichos donde reposan restos cremados.',
    dependencia: 'Jefatura de Panteones',
    dirigidoA: 'Público en General',
    vigencia: '7 años',
    tiempoRespuesta: 'Atención el mismo día',
    ubicacion: 'Ignacio Zaragoza 404, Col. Centro, Coatzacoalcos, Ver. (Anexo del Palacio Municipal)',
    telefono: '(921) 211-2100 Ext: 2479',
    horario: 'Lunes a Viernes 08:30 a 16:00 hrs.',
    pasos: [
      'Iniciar la atención en la oficina administrativa del Panteón donde se ubica el nicho.',
      'Someter los documentos a la verificación de registros por el administrador.',
      'Recibir boletas con el desglose de derechos.',
      'Acudir a la Jefatura de Panteones en el Anexo del Palacio Municipal para realizar el pago e impresión de refrendo.'
    ],
    requisitosPanteon: [
      'Título de Perpetuidad de Nicho ORIGINAL y 1 copia.',
      '2 copias de la Credencial de Elector (INE) del titular.',
      '2 copias de las Actas de Defunción de las personas con cenizas depositadas.',
      '2 fotografías impresas del nicho.',
      'En caso de representante: Autorización firmada en copia de INE del titular y 2 copias de INE del representante autorizado.'
    ],
    requisitosRegistroCivil: [],
    costos: [
      { concepto: 'Perpetuidad de Nicho al corriente (7 años)', monto: '$ 1,754.00' },
      { concepto: 'Año con rezago / atraso', monto: '$ 250.00 / año' },
      { concepto: 'Multa por año de atraso', monto: '$ 120.00 / año' },
      { concepto: 'Total por cada año con atraso acumulado', monto: '$ 370.00 / año' }
    ],
    fundamentoLegal: 'Artículo 228 y Artículo 229 Capítulo VII del Código Hacendario Municipal.',
    notasImportantes: 'La renovación debe tramitarse cada 7 años para conservar el nicho asignado.'
  },
  {
    id: 'permiso-construccion',
    title: 'Permiso de Construcción de Bóveda',
    category: 'Permisos',
    shortDesc: 'Autorización para construir bóvedas o colocar monumentos empotrados en tumbas.',
    description: 'Trámite obligatorio para la edificación de bóvedas o instalación de monumentos empotrados en las fosas de los panteones municipales. Requiere que la perpetuidad esté VIGENTE.',
    dependencia: 'Jefatura de Panteones',
    dirigidoA: 'Público en General',
    vigencia: '30 días naturales',
    tiempoRespuesta: 'Atención el mismo día',
    ubicacion: 'Ignacio Zaragoza 404, Col. Centro, Coatzacoalcos, Ver. (Anexo del Palacio Municipal)',
    telefono: '(921) 211-2100 Ext: 2479',
    horario: 'Lunes a Viernes 08:30 a 16:00 hrs.',
    pasos: [
      'Iniciar la solicitud en la administración del Panteón correspondiente.',
      'Comprobar la vigencia activa del Título de Perpetuidad.',
      'Obtener la boleta de autorización firmada por el administrador del panteón.',
      'Pagar los derechos de construcción en la Jefatura de Panteones (Anexo del Palacio Municipal).'
    ],
    requisitosPanteon: [
      '2 copias del Título de Perpetuidad VIGENTE.',
      '2 copias de la Credencial de Elector del titular, indicando en las copias la solicitud de permiso para construir y la leyenda de conocimiento sobre la obligación del mantenimiento y conservación de la tumba.',
      '2 copias de las Actas de Defunción de los sepultados en el lote.',
      '2 fotografías impresas de la tumba.',
      'Si acude representante: Carta poder o autorización en copia de INE del titular y 2 copias de INE del apoderado.'
    ],
    requisitosRegistroCivil: [],
    costos: [
      { concepto: 'Permiso de Construcción Municipal', monto: '$ 1,067.00' }
    ],
    fundamentoLegal: 'Artículo 228 y Artículo 229 Capítulo VII del Código Hacendario Municipal.',
    notasImportantes: '¡ATENCIÓN! Está estrictamente prohibida la construcción de techos, capillas, bancas o estructuras de gran volumen que obstaculicen los pasillos del panteón.'
  },
  {
    id: 'cambio-propietario',
    title: 'Cambio de Propietario (Titularidad)',
    category: 'Traspasos',
    shortDesc: 'Cesión o cambio de nombre del titular de un Título de Perpetuidad.',
    description: 'Procedimiento mediante el cual se transfiere la titularidad de un lote a un familiar directo. Se realiza un ajuste de años de vigencia conforme a la normativa del año en curso.',
    dependencia: 'Jefatura de Panteones',
    dirigidoA: 'Público en General (Familiares directos)',
    vigencia: 'Sujeto a vigencia actualizada del año en curso',
    tiempoRespuesta: 'Sujeto a revisión documental',
    ubicacion: 'Ignacio Zaragoza 404, Col. Centro, Coatzacoalcos, Ver. (Anexo del Palacio Municipal)',
    telefono: '(921) 211-2100 Ext: 2479',
    horario: 'Lunes a Viernes 09:00 a 16:30 hrs.',
    pasos: [
      'Iniciar el trámite en las oficinas del Panteón donde radica el lote.',
      'Acreditar fehacientemente el parentesco directo entre el titular previo (o extinto) y el nuevo titular.',
      'El administrador del panteón expedirá las boletas de cambio de titular.',
      'Entregar expediente en la Jefatura de Panteones (Anexo Palacio Municipal) para cobro de derechos y emisión del nuevo Título.'
    ],
    requisitosPanteon: [
      'Título de Perpetuidad ORIGINAL y 1 copia fotostática.',
      '2 copias de INE del titular anterior con la leyenda expresamente escrita de cesión de derechos a favor del nuevo titular.',
      '2 copias de la Credencial de Elector del nuevo titular.',
      '2 copias de documentos probatorios de parentesco directo (Acta de Nacimiento o Acta de Matrimonio).',
      '2 copias de las Actas de Defunción de cada una de las personas difuntas en el lote.',
      '2 fotografías impresas actuales de la tumba.',
      'Si el titular de la perpetuidad falleció: Presentar 2 copias de su Acta de Defunción.'
    ],
    requisitosRegistroCivil: [],
    costos: [
      { concepto: 'Derecho de Cambio de Propietario', monto: '$ 1,214.00' },
      { concepto: 'Ajuste de años de vigencia (si aplica)', monto: '$ 193.00 / año de ajuste' }
    ],
    fundamentoLegal: 'Artículo 228 y Artículo 229 Capítulo VII del Código Hacendario Municipal.',
    notasImportantes: 'Únicamente se permite la cesión de derechos entre familiares en primer grado o línea directa comprobable.'
  },
  {
    id: 'extravio-titulo',
    title: 'Extravío (Reposición de Título de Perpetuidad)',
    category: 'Reposición',
    shortDesc: 'Reposición del documento de Título de Perpetuidad por extravío o deterioro.',
    description: 'Trámite para la expedición de un duplicado oficial del Título de Perpetuidad por pérdida, extravío o deterioro del documento original.',
    dependencia: 'Jefatura de Panteones',
    dirigidoA: 'Público en General',
    vigencia: 'Ajustada a la vigencia del año en curso',
    tiempoRespuesta: 'Sujeto a verificación de expedientes',
    ubicacion: 'Ignacio Zaragoza 404, Col. Centro, Coatzacoalcos, Ver. (Anexo del Palacio Municipal)',
    telefono: '(921) 211-2100 Ext: 2479',
    horario: 'Lunes a Viernes 08:30 a 16:00 hrs.',
    pasos: [
      'Acudir al Panteón correspondiente para la búsqueda en el libro de registros físicos.',
      'Presentar el comprobante de pago anterior o datos del lote.',
      'El administrador del panteón corroborará las fosas y anexará las boletas al expediente.',
      'Concluir en la Jefatura de Panteones (Anexo Palacio Municipal) para el pago y reposición oficial.'
    ],
    requisitosPanteon: [
      'Último recibo de pago original y 1 copia fotostática.',
      '2 copias de la Credencial de Elector (INE) del titular registrado.',
      '2 copias de las Actas de Defunción de todas las personas enterradas en el lote.',
      '2 fotografías impresas claras de la tumba.'
    ],
    requisitosRegistroCivil: [],
    costos: [
      { concepto: 'Reposición de Título por Extravío', monto: '$ 1,336.00' },
      { concepto: 'Ajuste de años de vigencia faltantes', monto: 'Según cálculo de años faltantes' }
    ],
    fundamentoLegal: 'Artículo 228 y Artículo 229 Capítulo VII del Código Hacendario Municipal.',
    notasImportantes: 'Se calcularán y añadirán los años necesarios para empatar con el periodo de vigencia del año en curso.'
  }
];
