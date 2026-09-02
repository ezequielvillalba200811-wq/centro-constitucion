import 'dotenv/config';
import express from 'express';
import cookieParser from 'cookie-parser';
import jwt from 'jsonwebtoken';
import multer from 'multer';

const app = express();

const upload = multer({
  storage: multer.memoryStorage(),

  limits: {
    fileSize: 8 * 1024 * 1024
  },

  fileFilter: (
    req,
    file,
    cb
  ) => {
    if (
      file.mimetype.startsWith(
        'image/'
      )
    ) {
      cb(null, true);
    } else {
      cb(
        new Error(
          'Solo se permiten imágenes.'
        )
      );
    }
  }
});

const PORT =
  process.env.PORT || 3000;

const PUBLIC_URL = (
  process.env.PUBLIC_URL ||
  `http://localhost:${PORT}`
).replace(/\/$/, '');

const JWT_SECRET =
  process.env.JWT_SECRET ||
  'cambiar-secreto';

const SUPABASE_URL = (
  process.env.SUPABASE_URL || ''
).replace(/\/$/, '');

const SUPABASE_SECRET_KEY =
  process.env.SUPABASE_SECRET_KEY || '';

const MP_ACCESS_TOKEN =
  process.env.MP_ACCESS_TOKEN || '';

const BUSINESS_WHATSAPP =
  process.env.BUSINESS_WHATSAPP ||
  '5491123456789';

const ADMIN_EMAIL =
  process.env.ADMIN_EMAIL || '';

const ADMIN_PASSWORD =
  process.env.ADMIN_PASSWORD || '';

const FACEBOOK_URL =
  'https://www.facebook.com/profile.php?id=61578004386934';

const INSTAGRAM_URL =
  'https://www.instagram.com/cursosconstitucion/';

const TIKTOK_URL =
  'https://www.tiktok.com/@centroconstitucion';

const GOOGLE_URL =
  'https://share.google/PQctCPxZN564FGlPw';

const ADDRESS =
  'Av. Brasil 1223, Constitución, CABA';

app.use(express.json());

app.use(
  express.urlencoded({
    extended: true
  })
);

app.use(cookieParser());

const defaultCourses = [
  {
    id: 'barberia',
    icon: '💈',
    image: '',
    name: 'Barbería',

    description:
      'Curso de corte masculino desde nivel inicial con prácticas presenciales.',

    schedules: [
      'Martes de 16:00 a 18:00',
      'Sábados de 09:00 a 11:00',
      'Sábados de 11:00 a 13:00'
    ],

    registration: 20000,
    monthlyFee: 80000
  },

  {
    id: 'peluqueria',
    icon: '✂️',
    image: '',
    name: 'Peluquería',

    description:
      'Curso de peluquería nivel inicial con prácticas presenciales.',

    schedules: [
      'Miércoles de 15:00 a 18:00',
      'Sábados de 09:00 a 12:00'
    ],

    registration: 20000,
    monthlyFee: 80000
  },

  {
    id: 'colorimetria',
    icon: '🎨',
    image: '',
    name: 'Colorimetría',

    description:
      'Aprendé teoría del color, diagnóstico y técnicas profesionales.',

    schedules: [
      'Horario próximamente'
    ],

    registration: 20000,
    monthlyFee: 80000
  },

  {
    id: 'manicuria-pedicuria',
    icon: '💅',
    image: '',
    name: 'Manicuría y Pedicuría',

    description:
      'Curso presencial de técnicas de manicuría y pedicuría.',

    schedules: [
      'Horario próximamente'
    ],

    registration: 20000,
    monthlyFee: 80000
  }
];

const defaultProducts = [
  {
    id: 'tijera-profesional',
    icon: '✂️',
    image: '',
    name: 'Tijera profesional',
    price: 45000,
    stock: 10
  },

  {
    id: 'maquina-corte',
    icon: '🪒',
    image: '',
    name: 'Máquina de corte',
    price: 90000,
    stock: 8
  },

  {
    id: 'secador-profesional',
    icon: '💨',
    image: '',
    name: 'Secador profesional',
    price: 70000,
    stock: 6
  }
];

const defaultServices = [
  {
    id: 'corte-caballero',
    icon: '💈',
    image: '',
    name: 'Corte caballero',
    description:
      'Servicio de corte masculino.',
    price: 10000
  },

  {
    id: 'corte-barba',
    icon: '🪒',
    image: '',
    name: 'Corte + barba',
    description:
      'Corte masculino y servicio de barba.',
    price: 14000
  },

  {
    id: 'lavado-planchita',
    icon: '💇',
    image: '',
    name: 'Lavado + planchita',
    description:
      'Lavado y terminación con planchita.',
    price: 15000
  }
];

let memoryCourses =
  [...defaultCourses];

let memoryProducts =
  [...defaultProducts];

let memoryServices =
  [...defaultServices];

let siteSettings = {
  backgroundImage:
    process.env.BACKGROUND_IMAGE || ''
};

function money(
  value
) {
  return new Intl
    .NumberFormat(
      'es-AR',
      {
        style: 'currency',
        currency: 'ARS',
        maximumFractionDigits: 0
      }
    )
    .format(
      Number(value || 0)
    );
}

function escapeHtml(
  value = ''
) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function slugify(
  value = ''
) {
  return String(value)
    .toLowerCase()
    .normalize('NFD')
    .replace(
      /[\u0300-\u036f]/g,
      ''
    )
    .replace(
      /[^a-z0-9]+/g,
      '-'
    )
    .replace(
      /^-+|-+$/g,
      ''
    );
}

function normalizeSchedules(
  value
) {
  if (
    Array.isArray(value)
  ) {
    return value
      .map(
        item =>
          String(item).trim()
      )
      .filter(Boolean);
  }

  if (!value) {
    return [];
  }

  return String(value)
    .split('\n')
    .map(
      item =>
        item.trim()
    )
    .filter(Boolean);
}

function whatsappNumber() {
  return String(
    BUSINESS_WHATSAPP || ''
  ).replace(
    /\D/g,
    ''
  );
}

function formatDate(
  value
) {
  if (!value) {
    return '';
  }

  try {
    return new Intl
      .DateTimeFormat(
        'es-AR',
        {
          dateStyle: 'short',
          timeStyle: 'short',
          timeZone:
            'America/Argentina/Buenos_Aires'
        }
      )
      .format(
        new Date(value)
      );
  } catch {
    return String(value);
  }
}

async function supabaseRequest(
  path,
  options = {}
) {
  if (
    !SUPABASE_URL ||
    !SUPABASE_SECRET_KEY
  ) {
    return null;
  }

  try {
    const response =
      await fetch(
        `${SUPABASE_URL}/rest/v1/${path}`,
        {
          ...options,

          headers: {
            apikey:
              SUPABASE_SECRET_KEY,

            Authorization:
              `Bearer ${SUPABASE_SECRET_KEY}`,

            'Content-Type':
              'application/json',

            ...(options.headers || {})
          }
        }
      );

    if (!response.ok) {
      const errorText =
        await response.text();

      console.error(
        'Error Supabase:',
        response.status,
        errorText
      );

      return null;
    }

    const text =
      await response.text();

    if (!text) {
      return true;
    }

    try {
      return JSON.parse(text);
    } catch {
      return text;
    }
  } catch (
    error
  ) {
    console.error(
      'Error conectando con Supabase:',
      error
    );

    return null;
  }
}

async function supabaseWrite(
  path,
  options = {}
) {
  if (
    !SUPABASE_URL ||
    !SUPABASE_SECRET_KEY
  ) {
    throw new Error(
      'Falta configurar Supabase en Render.'
    );
  }

  const response =
    await fetch(
      `${SUPABASE_URL}/rest/v1/${path}`,
      {
        ...options,

        headers: {
          apikey:
            SUPABASE_SECRET_KEY,

          Authorization:
            `Bearer ${SUPABASE_SECRET_KEY}`,

          'Content-Type':
            'application/json',

          Prefer:
            'return=representation',

          ...(options.headers || {})
        }
      }
    );

  const text =
    await response.text();

  if (!response.ok) {
    console.error(
      'Error guardando en Supabase:',
      response.status,
      text
    );

    throw new Error(
      text ||
      'No se pudo guardar el cambio.'
    );
  }

  if (!text) {
    return true;
  }

  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

async function uploadImageToSupabase(
  file,
  folder = 'general'
) {
  if (!file) {
    return '';
  }

  if (
    !SUPABASE_URL ||
    !SUPABASE_SECRET_KEY
  ) {
    throw new Error(
      'Supabase no está configurado.'
    );
  }

  const extension =
    (
      file.originalname
        .split('.')
        .pop() ||
      'jpg'
    )
      .toLowerCase()
      .replace(
        /[^a-z0-9]/g,
        ''
      );

  const fileName =
    `${folder}/${Date.now()}-${Math.random()
      .toString(36)
      .slice(2)}.${extension}`;

  const uploadResponse =
    await fetch(
      `${SUPABASE_URL}/storage/v1/object/site-images/${fileName}`,
      {
        method: 'POST',

        headers: {
          apikey:
            SUPABASE_SECRET_KEY,

          Authorization:
            `Bearer ${SUPABASE_SECRET_KEY}`,

          'Content-Type':
            file.mimetype,

          'x-upsert':
            'true'
        },

        body:
          file.buffer
      }
    );

  if (!uploadResponse.ok) {
    const text =
      await uploadResponse.text();

    console.error(
      'Error subiendo imagen:',
      text
    );

    throw new Error(
      'No se pudo subir la imagen.'
    );
  }

  return (
    `${SUPABASE_URL}/storage/v1/object/public/site-images/${fileName}`
  );
}
function databaseCourseToApp(
  course
) {
  return {
    id:
      course.id,

    icon:
      course.icon || '✂️',

    image:
      course.image || '',

    name:
      course.name || '',

    description:
      course.description || '',

    schedules:
      normalizeSchedules(
        course.schedules
      ),

    registration:
      Number(
        course.registration || 0
      ),

    monthlyFee:
      Number(
        course.monthly_fee || 0
      )
  };
}

function databaseProductToApp(
  product
) {
  return {
    id:
      product.id,

    icon:
      product.icon || '🛍️',

    image:
      product.image || '',

    name:
      product.name || '',

    price:
      Number(
        product.price || 0
      ),

    stock:
      Number(
        product.stock || 0
      )
  };
}

function databaseServiceToApp(
  service
) {
  return {
    id:
      service.id,

    icon:
      service.icon || '💇',

    image:
      service.image || '',

    name:
      service.name || '',

    description:
      service.description || '',

    price:
      Number(
        service.price || 0
      )
  };
}

async function getCourses() {
  const data =
    await supabaseRequest(
      'courses?select=*&order=name.asc'
    );

  if (
    Array.isArray(data) &&
    data.length > 0
  ) {
    memoryCourses =
      data.map(
        databaseCourseToApp
      );
  }

  return memoryCourses;
}

async function getProducts() {
  const data =
    await supabaseRequest(
      'products?select=*&order=name.asc'
    );

  if (
    Array.isArray(data) &&
    data.length > 0
  ) {
    memoryProducts =
      data.map(
        databaseProductToApp
      );
  }

  return memoryProducts;
}

async function getServices() {
  const data =
    await supabaseRequest(
      'services?select=*&order=name.asc'
    );

  if (
    Array.isArray(data) &&
    data.length > 0
  ) {
    memoryServices =
      data.map(
        databaseServiceToApp
      );
  }

  return memoryServices;
}

async function getSiteSettings() {
  const data =
    await supabaseRequest(
      'site_settings?key=eq.main&select=*'
    );

  if (
    Array.isArray(data) &&
    data[0]
  ) {
    siteSettings = {
      backgroundImage:
        data[0]
          .background_image || ''
    };
  }

  return siteSettings;
}

function createAdminToken() {
  return jwt.sign(
    {
      role:
        'admin'
    },

    JWT_SECRET,

    {
      expiresIn:
        '7d'
    }
  );
}

function adminRequired(
  req,
  res,
  next
) {
  const token =
    req.cookies
      .admin_token;

  if (!token) {
    return res.redirect(
      '/admin/login'
    );
  }

  try {
    const payload =
      jwt.verify(
        token,
        JWT_SECRET
      );

    if (
      payload.role !==
      'admin'
    ) {
      throw new Error(
        'Acceso inválido'
      );
    }

    next();
  } catch {
    res.clearCookie(
      'admin_token'
    );

    return res.redirect(
      '/admin/login'
    );
  }
}

function errorPage(
  title,
  message
) {
  return `
    <div style="
      max-width:700px;
      margin:60px auto;
      padding:25px;
      font-family:Arial,sans-serif;
      text-align:center;
    ">
      <h1>
        ${escapeHtml(title)}
      </h1>

      <p style="
        font-size:18px;
        line-height:1.5;
      ">
        ${escapeHtml(message)}
      </p>

      <a
        href="/admin"
        style="
          display:inline-block;
          margin-top:20px;
          padding:12px 20px;
          background:#111;
          color:white;
          text-decoration:none;
          border-radius:8px;
        "
      >
        Volver al panel
      </a>
    </div>
  `;
}

function layout(
  title,
  content,
  options = {}
) {
  const backgroundImage =
    options.backgroundImage ||
    siteSettings.backgroundImage ||
    '';

  const backgroundStyle =
    backgroundImage
      ? `
        body::before {
          content: '';
          position: fixed;
          inset: 0;
          background:
            linear-gradient(
              rgba(0,0,0,.66),
              rgba(0,0,0,.72)
            ),
            url('${escapeHtml(backgroundImage)}')
            center center / cover no-repeat;
          z-index: -2;
        }
      `
      : `
        body::before {
          content: '';
          position: fixed;
          inset: 0;
          background:
            linear-gradient(
              135deg,
              #0f0f0f,
              #1d1d1d
            );
          z-index: -2;
        }
      `;

  return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">

  <meta
    name="viewport"
    content="width=device-width, initial-scale=1.0"
  >

  <title>
    ${escapeHtml(title)}
  </title>

  <style>
    * {
      box-sizing: border-box;
    }

    html {
      scroll-behavior: smooth;
    }

    body {
      margin: 0;
      font-family:
        Arial,
        Helvetica,
        sans-serif;
      color: #fff;
      min-height: 100vh;
      background: #111;
    }

    ${backgroundStyle}

    body::after {
      content: '';
      position: fixed;
      inset: 0;
      background:
        radial-gradient(
          circle at top,
          rgba(255,255,255,.06),
          transparent 40%
        );
      z-index: -1;
      pointer-events: none;
    }

    a {
      color: inherit;
    }

    img {
      max-width: 100%;
      display: block;
    }

    .container {
      width:
        min(
          1120px,
          calc(100% - 28px)
        );
      margin: 0 auto;
    }

    .navbar {
      position: sticky;
      top: 0;
      z-index: 1000;
      backdrop-filter:
        blur(14px);
      background:
        rgba(10,10,10,.88);
      border-bottom:
        1px solid
        rgba(255,255,255,.08);
    }

    .nav-inner {
      min-height: 70px;
      display: flex;
      align-items: center;
      justify-content:
        space-between;
      gap: 18px;
    }

    .brand {
      font-size: 21px;
      font-weight: 800;
      text-decoration: none;
      letter-spacing: .2px;
    }

    .nav-links {
      display: flex;
      gap: 10px;
      flex-wrap: wrap;
      justify-content: flex-end;
    }

    .nav-links a {
      text-decoration: none;
      padding: 10px 12px;
      border-radius: 10px;
      color: #eee;
      font-size: 14px;
    }

    .nav-links a:hover {
      background:
        rgba(255,255,255,.08);
    }

    .hero {
      padding:
        85px 0 55px;
      text-align: center;
    }

    .hero-box {
      max-width: 850px;
      margin: 0 auto;
      padding: 35px 24px;
      border:
        1px solid
        rgba(255,255,255,.12);
      border-radius: 24px;
      background:
        rgba(12,12,12,.72);
      backdrop-filter:
        blur(12px);
      box-shadow:
        0 25px 80px
        rgba(0,0,0,.35);
    }

    .hero h1 {
      margin:
        0 0 15px;
      font-size:
        clamp(
          34px,
          7vw,
          70px
        );
      line-height: 1;
    }

    .hero p {
      margin:
        0 auto 25px;
      max-width: 680px;
      font-size: 18px;
      line-height: 1.6;
      color: #ddd;
    }

    .section {
      padding:
        55px 0;
    }

    .section-title {
      margin:
        0 0 8px;
      text-align: center;
      font-size:
        clamp(
          27px,
          5vw,
          42px
        );
    }

    .section-subtitle {
      margin:
        0 auto 28px;
      max-width: 720px;
      text-align: center;
      color: #d0d0d0;
      line-height: 1.5;
    }

    .grid {
      display: grid;
      grid-template-columns:
        repeat(
          auto-fit,
          minmax(240px, 1fr)
        );
      gap: 18px;
    }

    .card {
      overflow: hidden;
      border-radius: 18px;
      background:
        rgba(18,18,18,.88);
      border:
        1px solid
        rgba(255,255,255,.1);
      box-shadow:
        0 15px 40px
        rgba(0,0,0,.22);
    }

    .card-image {
      height: 215px;
      display: flex;
      align-items: center;
      justify-content: center;
      background:
        rgba(255,255,255,.05);
      overflow: hidden;
      font-size: 70px;
    }

    .card-image img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .card-body {
      padding: 20px;
    }

    .card h3 {
      margin:
        0 0 10px;
      font-size: 23px;
    }

    .card p {
      color: #d5d5d5;
      line-height: 1.5;
    }

    .price {
      font-size: 23px;
      font-weight: 800;
      margin:
        12px 0;
    }

    .muted {
      color: #bbb;
    }

    .button {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      padding: 12px 18px;
      border: none;
      border-radius: 11px;
      background: #fff;
      color: #111;
      font-weight: 800;
      text-decoration: none;
      cursor: pointer;
      font-size: 15px;
    }

    .button:hover {
      opacity: .9;
    }

    .button.dark {
      background: #222;
      color: white;
      border:
        1px solid
        rgba(255,255,255,.12);
    }

    .button.danger {
      background: #b91c1c;
      color: white;
    }

    .button.full {
      width: 100%;
    }

    .actions {
      display: flex;
      gap: 10px;
      flex-wrap: wrap;
    }

    .panel {
      padding: 22px;
      border-radius: 18px;
      border:
        1px solid
        rgba(255,255,255,.1);
      background:
        rgba(18,18,18,.9);
    }

    .form-grid {
      display: grid;
      grid-template-columns:
        repeat(
          2,
          minmax(0,1fr)
        );
      gap: 14px;
    }

    .form-group {
      display: flex;
      flex-direction: column;
      gap: 7px;
    }

    .form-group.full {
      grid-column:
        1 / -1;
    }

    label {
      font-weight: 700;
      font-size: 14px;
    }

    input,
    textarea,
    select {
      width: 100%;
      padding: 12px 13px;
      border-radius: 10px;
      border:
        1px solid
        rgba(255,255,255,.15);
      background: #111;
      color: white;
      outline: none;
      font: inherit;
    }

    textarea {
      min-height: 110px;
      resize: vertical;
    }

    .table-wrap {
      overflow-x: auto;
    }

    table {
      width: 100%;
      border-collapse: collapse;
      min-width: 760px;
    }

    th,
    td {
      padding: 12px 10px;
      border-bottom:
        1px solid
        rgba(255,255,255,.1);
      text-align: left;
      vertical-align: top;
    }

    th {
      color: #ccc;
      font-size: 13px;
    }

    .admin-grid {
      display: grid;
      gap: 20px;
    }

    .admin-item {
      border:
        1px solid
        rgba(255,255,255,.1);
      border-radius: 16px;
      padding: 18px;
      background:
        rgba(255,255,255,.03);
    }

    .preview-image {
      width: 110px;
      height: 110px;
      object-fit: cover;
      border-radius: 14px;
      margin-bottom: 12px;
    }

    .social-grid {
      display: grid;
      grid-template-columns:
        repeat(
          5,
          minmax(0, 1fr)
        );
      gap: 14px;
    }

    .social-link {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 120px;
      text-decoration: none;
      background:
        rgba(18,18,18,.88);
      border-radius: 17px;
      border:
        1px solid
        rgba(255,255,255,.1);
      gap: 10px;
      font-weight: 700;
    }

    .social-link svg {
      width: 34px;
      height: 34px;
      fill: currentColor;
    }

    .map {
      width: 100%;
      min-height: 380px;
      border: 0;
      border-radius: 18px;
    }

    .cart {
      margin-top: 25px;
    }

    .cart-item {
      display: flex;
      justify-content:
        space-between;
      gap: 15px;
      padding:
        12px 0;
      border-bottom:
        1px solid
        rgba(255,255,255,.08);
    }

    .notice {
      padding: 13px 15px;
      border-radius: 10px;
      background:
        rgba(255,255,255,.07);
      margin-bottom: 15px;
    }

    .footer {
      padding:
        40px 0;
      text-align: center;
      color: #aaa;
      border-top:
        1px solid
        rgba(255,255,255,.08);
      margin-top: 50px;
    }

    @media (
      max-width: 720px
    ) {
      .nav-inner {
        align-items:
          flex-start;
        flex-direction:
          column;
        padding:
          14px 0;
      }

      .nav-links {
        width: 100%;
        justify-content:
          flex-start;
      }

      .hero {
        padding-top: 45px;
      }

      .form-grid {
        grid-template-columns:
          1fr;
      }

      .social-grid {
        grid-template-columns:
          repeat(
            2,
            minmax(0,1fr)
          );
      }
    }
  </style>
</head>

<body>

  <header class="navbar">
    <div class="container nav-inner">

      <a
        class="brand"
        href="/"
      >
        Centro Constitución
      </a>

      <nav class="nav-links">
        <a href="/#cursos">
          Cursos
        </a>

        <a href="/#salon">
          Salón
        </a>

        <a href="/#articulos">
          Artículos
        </a>

        <a href="/#ubicacion">
          Ubicación
        </a>

        <a href="/admin">
          Admin
        </a>
      </nav>

    </div>
  </header>

  ${content}

  <footer class="footer">
    <div class="container">
      Centro Constitución ·
      ${escapeHtml(ADDRESS)}
    </div>
  </footer>

</body>
</html>
  `;
}
function courseImageHtml(
  course
) {
  if (course.image) {
    return `
      <img
        src="${escapeHtml(course.image)}"
        alt="${escapeHtml(course.name)}"
      >
    `;
  }

  return escapeHtml(
    course.icon || '✂️'
  );
}

function productImageHtml(
  product
) {
  if (product.image) {
    return `
      <img
        src="${escapeHtml(product.image)}"
        alt="${escapeHtml(product.name)}"
      >
    `;
  }

  return escapeHtml(
    product.icon || '🛍️'
  );
}

function serviceImageHtml(
  service
) {
  if (service.image) {
    return `
      <img
        src="${escapeHtml(service.image)}"
        alt="${escapeHtml(service.name)}"
      >
    `;
  }

  return escapeHtml(
    service.icon || '💇'
  );
}

function socialIcons() {
  const whatsappUrl =
    `https://wa.me/${whatsappNumber()}`;

  return `
    <div class="social-grid">

      <a
        class="social-link"
        href="${FACEBOOK_URL}"
        target="_blank"
        rel="noopener noreferrer"
      >
        <svg viewBox="0 0 24 24">
          <path
            d="M22 12a10 10 0 1 0-11.56 9.88v-6.99H7.9V12h2.54V9.8c0-2.5 1.49-3.89 3.77-3.89 1.09 0 2.23.2 2.23.2v2.45h-1.26c-1.24 0-1.63.77-1.63 1.56V12h2.77l-.44 2.89h-2.33v6.99A10 10 0 0 0 22 12"
          />
        </svg>

        Facebook
      </a>

      <a
        class="social-link"
        href="${INSTAGRAM_URL}"
        target="_blank"
        rel="noopener noreferrer"
      >
        <svg viewBox="0 0 24 24">
          <path
            d="M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5m0 2a3 3 0 0 0-3 3v10a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3V7a3 3 0 0 0-3-3H7m10.5 1.5A1.5 1.5 0 1 1 16 7a1.5 1.5 0 0 1 1.5-1.5M12 7a5 5 0 1 1-5 5 5 5 0 0 1 5-5m0 2a3 3 0 1 0 3 3 3 3 0 0 0-3-3"
          />
        </svg>

        Instagram
      </a>

      <a
        class="social-link"
        href="${TIKTOK_URL}"
        target="_blank"
        rel="noopener noreferrer"
      >
        <svg viewBox="0 0 24 24">
          <path
            d="M16.6 5.82A4.28 4.28 0 0 1 14.88 3h-3.1v12.4a2.6 2.6 0 1 1-2.6-2.6c.27 0 .53.04.78.12V9.76a5.72 5.72 0 1 0 5 5.67V9.14a7.35 7.35 0 0 0 4.3 1.38V7.46a4.3 4.3 0 0 1-2.66-1.64"
          />
        </svg>

        TikTok
      </a>

      <a
        class="social-link"
        href="${GOOGLE_URL}"
        target="_blank"
        rel="noopener noreferrer"
      >
        <svg viewBox="0 0 24 24">
          <path
            d="M21.35 11.1H12v2.98h5.35c-.23 1.49-1.71 4.38-5.35 4.38A6.46 6.46 0 0 1 5.54 12 6.46 6.46 0 0 1 12 5.54c2.07 0 3.46.88 4.25 1.64l2.9-2.8A10.45 10.45 0 0 0 12 1.58 10.42 10.42 0 0 0 1.58 12 10.42 10.42 0 0 0 12 22.42c6.93 0 10.42-4.87 10.42-10.42 0-.7-.08-1.23-.17-1.75z"
          />
        </svg>

        Google
      </a>

      <a
        class="social-link"
        href="${whatsappUrl}"
        target="_blank"
        rel="noopener noreferrer"
      >
        <svg viewBox="0 0 24 24">
          <path
            d="M12 2a9.82 9.82 0 0 0-8.38 14.95L2 22l5.18-1.58A9.9 9.9 0 1 0 12 2m0 17.8a7.72 7.72 0 0 1-3.93-1.08l-.28-.17-3.08.94.95-3-.18-.31A7.69 7.69 0 1 1 12 19.8m4.22-5.77c-.23-.12-1.36-.67-1.57-.75-.21-.07-.36-.11-.51.12-.15.23-.59.75-.72.91-.13.15-.26.17-.49.05a6.26 6.26 0 0 1-1.85-1.14 6.94 6.94 0 0 1-1.28-1.59c-.13-.23-.01-.35.1-.47.1-.1.23-.26.34-.39.12-.13.15-.23.23-.38.08-.16.04-.29-.02-.41-.05-.12-.51-1.24-.7-1.69-.18-.45-.37-.39-.51-.4h-.44c-.16 0-.41.06-.62.29-.21.23-.82.8-.82 1.95s.84 2.26.95 2.42c.12.16 1.65 2.52 4 3.53.56.24.99.38 1.33.49.56.18 1.07.15 1.47.09.45-.07 1.36-.56 1.55-1.1.19-.54.19-1 .13-1.1-.06-.1-.21-.16-.44-.28"
          />
        </svg>

        WhatsApp
      </a>

    </div>
  `;
}

app.get(
  '/',
  async (
    req,
    res
  ) => {
    const [
      courses,
      products,
      services,
      settings
    ] = await Promise.all([
      getCourses(),
      getProducts(),
      getServices(),
      getSiteSettings()
    ]);

    const coursesHtml =
      courses
        .map(
          course => `
            <article class="card">
              <div class="card-image">
                ${courseImageHtml(course)}
              </div>

              <div class="card-body">
                <h3>
                  ${escapeHtml(course.name)}
                </h3>

                <p>
                  ${escapeHtml(course.description)}
                </p>

                <p class="muted">
                  <strong>
                    Horarios:
                  </strong>
                  <br>
                  ${
                    course.schedules
                      .map(
                        schedule =>
                          escapeHtml(schedule)
                      )
                      .join('<br>')
                  }
                </p>

                <p>
                  Inscripción:
                  <strong>
                    ${money(course.registration)}
                  </strong>
                </p>

                <p>
                  Cuota:
                  <strong>
                    ${money(course.monthlyFee)}
                  </strong>
                </p>

                <a
                  class="button"
                  href="/course/${encodeURIComponent(course.id)}"
                >
                  Ver curso
                </a>
              </div>
            </article>
          `
        )
        .join('');

    const servicesHtml =
      services
        .map(
          service => `
            <article class="card">
              <div class="card-image">
                ${serviceImageHtml(service)}
              </div>

              <div class="card-body">
                <h3>
                  ${escapeHtml(service.name)}
                </h3>

                <p>
                  ${escapeHtml(service.description)}
                </p>

                <div class="price">
                  ${money(service.price)}
                </div>

                <a
                  class="button full"
                  target="_blank"
                  rel="noopener noreferrer"
                  href="https://wa.me/${whatsappNumber()}?text=${encodeURIComponent(
                    `Hola, quisiera consultar por el servicio ${service.name} de ${money(service.price)}.`
                  )}"
                >
                  Consultar por WhatsApp
                </a>
              </div>
            </article>
          `
        )
        .join('');

    const productsHtml =
      products
        .map(
          product => `
            <article class="card">
              <div class="card-image">
                ${productImageHtml(product)}
              </div>

              <div class="card-body">
                <h3>
                  ${escapeHtml(product.name)}
                </h3>

                <div class="price">
                  ${money(product.price)}
                </div>

                <p class="muted">
                  Stock:
                  ${Number(product.stock || 0)}
                </p>

                <button
                  class="button full"
                  type="button"
                  onclick='addToCart(${JSON.stringify({
                    id:
                      product.id,

                    name:
                      product.name,

                    price:
                      product.price
                  })})'
                  ${
                    Number(
                      product.stock || 0
                    ) <= 0
                      ? 'disabled'
                      : ''
                  }
                >
                  ${
                    Number(
                      product.stock || 0
                    ) > 0
                      ? 'Agregar al carrito'
                      : 'Sin stock'
                  }
                </button>
              </div>
            </article>
          `
        )
        .join('');

    const content = `
      <main>

        <section class="hero">
          <div class="container">

            <div class="hero-box">
              <h1>
                Centro Constitución
              </h1>

              <p>
                Cursos presenciales,
                servicios de salón
                y artículos profesionales
                de peluquería y barbería.
              </p>

              <div
                class="actions"
                style="
                  justify-content:center;
                "
              >
                <a
                  class="button"
                  href="#cursos"
                >
                  Ver cursos
                </a>

                <a
                  class="button dark"
                  href="#salon"
                >
                  Ver salón
                </a>

                <a
                  class="button dark"
                  href="#articulos"
                >
                  Ver artículos
                </a>
              </div>
            </div>

          </div>
        </section>

        <section
          class="section"
          id="cursos"
        >
          <div class="container">

            <h2 class="section-title">
              Cursos
            </h2>

            <p class="section-subtitle">
              Elegí el curso que quieras
              y consultá horarios,
              inscripción y cuota.
            </p>

            <div class="grid">
              ${coursesHtml}
            </div>

          </div>
        </section>

        <section
          class="section"
          id="salon"
        >
          <div class="container">

            <h2 class="section-title">
              Salón
            </h2>

            <p class="section-subtitle">
              Conocé nuestros servicios
              y sus precios.
            </p>

            <div class="grid">
              ${servicesHtml}
            </div>

          </div>
        </section>

        <section
          class="section"
          id="articulos"
        >
          <div class="container">

            <h2 class="section-title">
              Artículos
            </h2>

            <p class="section-subtitle">
              Herramientas y productos
              para peluquería y barbería.
            </p>

            <div class="grid">
              ${productsHtml}
            </div>

            <div
              class="panel cart"
              id="cartPanel"
            >
              <h3>
                Carrito
              </h3>

              <div id="cartItems">
                <p class="muted">
                  Tu carrito está vacío.
                </p>
              </div>

              <div
                id="cartTotal"
                class="price"
              >
                Total: $0
              </div>

              <form
                id="checkoutForm"
                action="/checkout/products"
                method="POST"
              >

                <input
                  type="hidden"
                  name="items"
                  id="cartItemsInput"
                  value="[]"
                >

                <div class="form-grid">

                  <div class="form-group">
                    <label>
                      Nombre
                    </label>

                    <input
                      type="text"
                      name="buyerName"
                      required
                    >
                  </div>

                  <div class="form-group">
                    <label>
                      WhatsApp
                    </label>

                    <input
                      type="tel"
                      name="buyerWhatsapp"
                      required
                    >
                  </div>

                  <div class="form-group full">
                    <button
                      class="button"
                      type="submit"
                    >
                      Comprar y pagar
                    </button>
                  </div>

                </div>
              </form>
            </div>

          </div>
        </section>
                <section class="section">
          <div class="container">

            <h2 class="section-title">
              Seguinos
            </h2>

            <p class="section-subtitle">
              Encontranos también en nuestras redes
              y consultanos por WhatsApp.
            </p>

            ${socialIcons()}

          </div>
        </section>

        <section
          class="section"
          id="ubicacion"
        >
          <div class="container">

            <h2 class="section-title">
              Ubicación
            </h2>

            <p class="section-subtitle">
              ${escapeHtml(ADDRESS)}
            </p>

            <iframe
              class="map"
              loading="lazy"
              allowfullscreen
              referrerpolicy="no-referrer-when-downgrade"
              src="https://www.google.com/maps?q=${encodeURIComponent(
                ADDRESS
              )}&output=embed"
            ></iframe>

            <div
              class="actions"
              style="
                justify-content:center;
                margin-top:18px;
              "
            >
              <a
                class="button"
                target="_blank"
                rel="noopener noreferrer"
                href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                  ADDRESS
                )}"
              >
                Abrir ubicación
              </a>
            </div>

          </div>
        </section>

      </main>

      <script>
        let cart = [];

        function formatMoney(value) {
          return new Intl.NumberFormat(
            'es-AR',
            {
              style: 'currency',
              currency: 'ARS',
              maximumFractionDigits: 0
            }
          ).format(
            Number(value || 0)
          );
        }

        function addToCart(product) {
          const found =
            cart.find(
              item =>
                item.id === product.id
            );

          if (found) {
            found.quantity += 1;
          } else {
            cart.push({
              ...product,
              quantity: 1
            });
          }

          renderCart();
        }

        function removeFromCart(id) {
          cart =
            cart.filter(
              item =>
                item.id !== id
            );

          renderCart();
        }

        function changeQuantity(
          id,
          amount
        ) {
          const item =
            cart.find(
              item =>
                item.id === id
            );

          if (!item) {
            return;
          }

          item.quantity += amount;

          if (
            item.quantity <= 0
          ) {
            removeFromCart(id);
            return;
          }

          renderCart();
        }

        function renderCart() {
          const container =
            document.getElementById(
              'cartItems'
            );

          const totalElement =
            document.getElementById(
              'cartTotal'
            );

          const input =
            document.getElementById(
              'cartItemsInput'
            );

          if (
            cart.length === 0
          ) {
            container.innerHTML =
              '<p class="muted">Tu carrito está vacío.</p>';

            totalElement.textContent =
              'Total: $0';

            input.value = '[]';

            return;
          }

          let total = 0;

          container.innerHTML =
            cart
              .map(
                item => {
                  const subtotal =
                    Number(
                      item.price || 0
                    ) *
                    Number(
                      item.quantity || 0
                    );

                  total += subtotal;

                  return \`
                    <div class="cart-item">
                      <div>
                        <strong>
                          \${item.name}
                        </strong>

                        <div class="muted">
                          \${formatMoney(
                            item.price
                          )}
                          ×
                          \${item.quantity}
                        </div>
                      </div>

                      <div class="actions">
                        <button
                          class="button dark"
                          type="button"
                          onclick="changeQuantity('\${item.id}', -1)"
                        >
                          -
                        </button>

                        <button
                          class="button dark"
                          type="button"
                          onclick="changeQuantity('\${item.id}', 1)"
                        >
                          +
                        </button>

                        <button
                          class="button danger"
                          type="button"
                          onclick="removeFromCart('\${item.id}')"
                        >
                          Quitar
                        </button>
                      </div>
                    </div>
                  \`;
                }
              )
              .join('');

          totalElement.textContent =
            'Total: ' +
            formatMoney(total);

          input.value =
            JSON.stringify(cart);
        }
      </script>
    `;

    res.send(
      layout(
        'Centro Constitución',
        content,
        {
          backgroundImage:
            settings.backgroundImage
        }
      )
    );
  }
);

app.get(
  '/course/:id',
  async (
    req,
    res
  ) => {
    const courses =
      await getCourses();

    const course =
      courses.find(
        item =>
          item.id ===
          req.params.id
      );

    if (!course) {
      return res
        .status(404)
        .send(
          layout(
            'Curso no encontrado',
            `
              <section class="section">
                <div class="container">
                  <div class="panel">
                    <h1>
                      Curso no encontrado
                    </h1>

                    <a
                      class="button"
                      href="/"
                    >
                      Volver
                    </a>
                  </div>
                </div>
              </section>
            `
          )
        );
    }

    const scheduleOptions =
      course.schedules
        .map(
          schedule => `
            <option
              value="${escapeHtml(schedule)}"
            >
              ${escapeHtml(schedule)}
            </option>
          `
        )
        .join('');

    const content = `
      <section class="section">
        <div class="container">

          <div class="grid">

            <article class="card">

              <div class="card-image">
                ${courseImageHtml(course)}
              </div>

              <div class="card-body">

                <h1>
                  ${escapeHtml(course.name)}
                </h1>

                <p>
                  ${escapeHtml(course.description)}
                </p>

                <p>
                  <strong>
                    Inscripción:
                  </strong>
                  ${money(course.registration)}
                </p>

                <p>
                  <strong>
                    Cuota:
                  </strong>
                  ${money(course.monthlyFee)}
                </p>

              </div>
            </article>

            <div class="panel">

              <h2>
                Inscribite
              </h2>

              <p class="muted">
                Completá tus datos
                y continuá con el pago.
              </p>

              <form
                action="/inscription/start"
                method="POST"
              >

                <input
                  type="hidden"
                  name="courseId"
                  value="${escapeHtml(course.id)}"
                >

                <div class="form-grid">

                  <div class="form-group">
                    <label>
                      Nombre
                    </label>

                    <input
                      type="text"
                      name="firstName"
                      required
                    >
                  </div>

                  <div class="form-group">
                    <label>
                      Apellido
                    </label>

                    <input
                      type="text"
                      name="lastName"
                      required
                    >
                  </div>

                  <div class="form-group">
                    <label>
                      DNI
                    </label>

                    <input
                      type="text"
                      name="document"
                      required
                    >
                  </div>

                  <div class="form-group">
                    <label>
                      Fecha de nacimiento
                    </label>

                    <input
                      type="date"
                      name="birthDate"
                      required
                    >
                  </div>

                  <div class="form-group">
                    <label>
                      WhatsApp
                    </label>

                    <input
                      type="tel"
                      name="whatsapp"
                      required
                    >
                  </div>

                  <div class="form-group">
                    <label>
                      Horario
                    </label>

                    <select
                      name="schedule"
                      required
                    >
                      ${scheduleOptions}
                    </select>
                  </div>

                  <div class="form-group full">
                    <button
                      class="button full"
                      type="submit"
                    >
                      Inscribirme y pagar
                    </button>
                  </div>

                </div>
              </form>

            </div>

          </div>
        </div>
      </section>
    `;

    res.send(
      layout(
        course.name,
        content
      )
    );
  }
);

app.post(
  '/inscription/start',
  async (
    req,
    res
  ) => {
    try {
      const {
        firstName,
        lastName,
        document,
        birthDate,
        whatsapp,
        courseId,
        schedule
      } = req.body;

      const courses =
        await getCourses();

      const course =
        courses.find(
          item =>
            item.id === courseId
        );

      if (!course) {
        throw new Error(
          'El curso seleccionado no existe.'
        );
      }

      const inscriptionId =
        `ins-${Date.now()}-${Math.random()
          .toString(36)
          .slice(2, 8)}`;

      const inscription = {
        id:
          inscriptionId,

        first_name:
          String(
            firstName || ''
          ).trim(),

        last_name:
          String(
            lastName || ''
          ).trim(),

        document:
          String(
            document || ''
          ).trim(),

        birth_date:
          birthDate || null,

        whatsapp:
          String(
            whatsapp || ''
          ).trim(),

        course_id:
          course.id,

        course_name:
          course.name,

        schedule:
          String(
            schedule || ''
          ).trim(),

        amount:
          Number(
            course.registration || 0
          ),

        status:
          'pending',

        created_at:
          new Date().toISOString()
      };

      await supabaseWrite(
        'inscriptions',
        {
          method: 'POST',

          body:
            JSON.stringify(
              inscription
            )
        }
      );

      if (!MP_ACCESS_TOKEN) {
        throw new Error(
          'Mercado Pago no está configurado.'
        );
      }

      const preferenceResponse =
        await fetch(
          'https://api.mercadopago.com/checkout/preferences',
          {
            method: 'POST',

            headers: {
              Authorization:
                `Bearer ${MP_ACCESS_TOKEN}`,

              'Content-Type':
                'application/json'
            },

            body:
              JSON.stringify({
                items: [
                  {
                    id:
                      course.id,

                    title:
                      `Inscripción - ${course.name}`,

                    quantity:
                      1,

                    currency_id:
                      'ARS',

                    unit_price:
                      Number(
                        course.registration
                      )
                  }
                ],

                external_reference:
                  inscriptionId,

                back_urls: {
                  success:
                    `${PUBLIC_URL}/inscription/success`,

                  pending:
                    `${PUBLIC_URL}/inscription/pending`,

                  failure:
                    `${PUBLIC_URL}/inscription/failure`
                },

                auto_return:
                  'approved'
              })
          }
        );

      const preference =
        await preferenceResponse
          .json();

      if (
        !preferenceResponse.ok
      ) {
        console.error(
          'Error Mercado Pago:',
          preference
        );

        throw new Error(
          'No se pudo iniciar el pago.'
        );
      }

      const checkoutUrl =
        preference.init_point ||
        preference.sandbox_init_point;

      if (!checkoutUrl) {
        throw new Error(
          'Mercado Pago no devolvió un enlace de pago.'
        );
      }

      res.redirect(
        checkoutUrl
      );
    } catch (
      error
    ) {
      console.error(
        error
      );

      res
        .status(500)
        .send(
          errorPage(
            'No se pudo iniciar la inscripción',
            error.message
          )
        );
    }
  }
);

app.get(
  '/inscription/success',
  async (
    req,
    res
  ) => {
    try {
      const paymentId =
        req.query.payment_id ||
        req.query.collection_id;

      const externalReference =
        req.query.external_reference;

      let paid = false;

      if (
        paymentId &&
        MP_ACCESS_TOKEN
      ) {
        const paymentResponse =
          await fetch(
            `https://api.mercadopago.com/v1/payments/${encodeURIComponent(
              paymentId
            )}`,
            {
              headers: {
                Authorization:
                  `Bearer ${MP_ACCESS_TOKEN}`
              }
            }
          );

        if (
          paymentResponse.ok
        ) {
          const payment =
            await paymentResponse
              .json();

          paid =
            payment.status ===
            'approved';
        }
      }

      if (
        paid &&
        externalReference
      ) {
        await supabaseWrite(
          `inscriptions?id=eq.${encodeURIComponent(
            externalReference
          )}`,
          {
            method: 'PATCH',

            body:
              JSON.stringify({
                status:
                  'paid',

                payment_id:
                  String(
                    paymentId || ''
                  ),

                paid_at:
                  new Date()
                    .toISOString()
              })
          }
        );
      }

      const text =
        paid
          ? 'Hola, ya aboné la inscripción desde la página web.'
          : 'Hola, hice una inscripción desde la página web y quiero consultar el estado del pago.';

      const content = `
        <section class="section">
          <div class="container">

            <div class="panel">

              <h1>
                ${
                  paid
                    ? '¡Pago confirmado!'
                    : 'Inscripción recibida'
                }
              </h1>

              <p>
                ${
                  paid
                    ? 'Tu inscripción quedó registrada como pagada.'
                    : 'Recibimos tu inscripción. Podés comunicarte con nosotros para verificar el pago.'
                }
              </p>

              <a
                class="button"
                target="_blank"
                rel="noopener noreferrer"
                href="https://wa.me/${whatsappNumber()}?text=${encodeURIComponent(
                  text
                )}"
              >
                Continuar por WhatsApp
              </a>

              <a
                class="button dark"
                href="/"
              >
                Volver al inicio
              </a>

            </div>
          </div>
        </section>
      `;

      res.send(
        layout(
          'Inscripción',
          content
        )
      );
    } catch (
      error
    ) {
      console.error(
        error
      );

      res
        .status(500)
        .send(
          errorPage(
            'Error',
            'No se pudo verificar la inscripción.'
          )
        );
    }
  }
);

app.get(
  '/inscription/pending',
  (
    req,
    res
  ) => {
    res.send(
      layout(
        'Pago pendiente',
        `
          <section class="section">
            <div class="container">
              <div class="panel">
                <h1>
                  Pago pendiente
                </h1>

                <p>
                  Tu inscripción quedó registrada.
                  El pago todavía está pendiente.
                </p>

                <a
                  class="button"
                  href="/"
                >
                  Volver
                </a>
              </div>
            </div>
          </section>
        `
      )
    );
  }
);

app.get(
  '/inscription/failure',
  (
    req,
    res
  ) => {
    res.send(
      layout(
        'Pago no realizado',
        `
          <section class="section">
            <div class="container">
              <div class="panel">
                <h1>
                  El pago no se completó
                </h1>

                <p>
                  La inscripción quedó registrada
                  para que también puedas verla
                  desde el panel Admin.
                </p>

                <a
                  class="button"
                  href="/"
                >
                  Volver
                </a>
              </div>
            </div>
          </section>
        `
      )
    );
  }
);
app.post(
  '/checkout/products',
  async (
    req,
    res
  ) => {
    try {
      const buyerName =
        String(
          req.body.buyerName || ''
        ).trim();

      const buyerWhatsapp =
        String(
          req.body.buyerWhatsapp || ''
        ).trim();

      let items = [];

      try {
        items =
          JSON.parse(
            req.body.items || '[]'
          );
      } catch {
        items = [];
      }

      if (!buyerName) {
        throw new Error(
          'Falta el nombre del comprador.'
        );
      }

      if (!buyerWhatsapp) {
        throw new Error(
          'Falta el WhatsApp del comprador.'
        );
      }

      if (
        !Array.isArray(items) ||
        items.length === 0
      ) {
        throw new Error(
          'El carrito está vacío.'
        );
      }

      const products =
        await getProducts();

      const cleanItems = [];

      let total = 0;

      for (
        const item
        of items
      ) {
        const product =
          products.find(
            product =>
              product.id ===
              item.id
          );

        if (!product) {
          continue;
        }

        const quantity =
          Math.max(
            1,
            Number(
              item.quantity || 1
            )
          );

        const unitPrice =
          Number(
            product.price || 0
          );

        const subtotal =
          unitPrice *
          quantity;

        total += subtotal;

        cleanItems.push({
          id:
            product.id,

          name:
            product.name,

          quantity,

          unit_price:
            unitPrice,

          subtotal
        });
      }

      if (
        cleanItems.length === 0
      ) {
        throw new Error(
          'No hay productos válidos en el carrito.'
        );
      }

      const orderId =
        `ord-${Date.now()}-${Math.random()
          .toString(36)
          .slice(2, 8)}`;

      const order = {
        id:
          orderId,

        buyer_name:
          buyerName,

        buyer_whatsapp:
          buyerWhatsapp,

        items:
          cleanItems,

        total:
          total,

        status:
          'pending',

        created_at:
          new Date()
            .toISOString()
      };

      await supabaseWrite(
        'orders',
        {
          method: 'POST',

          body:
            JSON.stringify(
              order
            )
        }
      );

      if (!MP_ACCESS_TOKEN) {
        throw new Error(
          'Mercado Pago no está configurado.'
        );
      }

      const mpItems =
        cleanItems.map(
          item => ({
            id:
              item.id,

            title:
              item.name,

            quantity:
              item.quantity,

            currency_id:
              'ARS',

            unit_price:
              Number(
                item.unit_price
              )
          })
        );

      const preferenceResponse =
        await fetch(
          'https://api.mercadopago.com/checkout/preferences',
          {
            method: 'POST',

            headers: {
              Authorization:
                `Bearer ${MP_ACCESS_TOKEN}`,

              'Content-Type':
                'application/json'
            },

            body:
              JSON.stringify({
                items:
                  mpItems,

                external_reference:
                  orderId,

                back_urls: {
                  success:
                    `${PUBLIC_URL}/order/success`,

                  pending:
                    `${PUBLIC_URL}/order/pending`,

                  failure:
                    `${PUBLIC_URL}/order/failure`
                },

                auto_return:
                  'approved'
              })
          }
        );

      const preference =
        await preferenceResponse
          .json();

      if (
        !preferenceResponse.ok
      ) {
        console.error(
          'Error Mercado Pago:',
          preference
        );

        throw new Error(
          'No se pudo iniciar el pago.'
        );
      }

      const checkoutUrl =
        preference.init_point ||
        preference.sandbox_init_point;

      if (!checkoutUrl) {
        throw new Error(
          'Mercado Pago no devolvió el enlace de pago.'
        );
      }

      res.redirect(
        checkoutUrl
      );
    } catch (
      error
    ) {
      console.error(
        error
      );

      res
        .status(500)
        .send(
          errorPage(
            'No se pudo iniciar la compra',
            error.message
          )
        );
    }
  }
);

app.get(
  '/order/success',
  async (
    req,
    res
  ) => {
    try {
      const paymentId =
        req.query.payment_id ||
        req.query.collection_id;

      const externalReference =
        req.query.external_reference;

      let paid = false;

      if (
        paymentId &&
        MP_ACCESS_TOKEN
      ) {
        const paymentResponse =
          await fetch(
            `https://api.mercadopago.com/v1/payments/${encodeURIComponent(
              paymentId
            )}`,
            {
              headers: {
                Authorization:
                  `Bearer ${MP_ACCESS_TOKEN}`
              }
            }
          );

        if (
          paymentResponse.ok
        ) {
          const payment =
            await paymentResponse
              .json();

          paid =
            payment.status ===
            'approved';
        }
      }

      if (
        paid &&
        externalReference
      ) {
        await supabaseWrite(
          `orders?id=eq.${encodeURIComponent(
            externalReference
          )}`,
          {
            method: 'PATCH',

            body:
              JSON.stringify({
                status:
                  'paid',

                payment_id:
                  String(
                    paymentId || ''
                  ),

                paid_at:
                  new Date()
                    .toISOString()
              })
          }
        );
      }

      const message =
        paid
          ? 'Hola, ya aboné una compra desde la página web.'
          : 'Hola, hice una compra desde la página web y quiero consultar el estado del pago.';

      res.send(
        layout(
          'Compra',
          `
            <section class="section">
              <div class="container">
                <div class="panel">

                  <h1>
                    ${
                      paid
                        ? '¡Pago confirmado!'
                        : 'Compra registrada'
                    }
                  </h1>

                  <p>
                    ${
                      paid
                        ? 'La compra quedó registrada como pagada en el panel Admin.'
                        : 'La compra quedó registrada. Podés consultar el estado del pago por WhatsApp.'
                    }
                  </p>

                  <div class="actions">

                    <a
                      class="button"
                      target="_blank"
                      rel="noopener noreferrer"
                      href="https://wa.me/${whatsappNumber()}?text=${encodeURIComponent(
                        message
                      )}"
                    >
                      Continuar por WhatsApp
                    </a>

                    <a
                      class="button dark"
                      href="/"
                    >
                      Volver al inicio
                    </a>

                  </div>
                </div>
              </div>
            </section>
          `
        )
      );
    } catch (
      error
    ) {
      console.error(
        error
      );

      res
        .status(500)
        .send(
          errorPage(
            'Error',
            'No se pudo verificar la compra.'
          )
        );
    }
  }
);

app.get(
  '/order/pending',
  (
    req,
    res
  ) => {
    res.send(
      layout(
        'Pago pendiente',
        `
          <section class="section">
            <div class="container">
              <div class="panel">

                <h1>
                  Pago pendiente
                </h1>

                <p>
                  La compra quedó registrada
                  en el panel Admin,
                  pero el pago todavía
                  figura como pendiente.
                </p>

                <a
                  class="button"
                  href="/"
                >
                  Volver
                </a>

              </div>
            </div>
          </section>
        `
      )
    );
  }
);

app.get(
  '/order/failure',
  (
    req,
    res
  ) => {
    res.send(
      layout(
        'Pago no realizado',
        `
          <section class="section">
            <div class="container">
              <div class="panel">

                <h1>
                  El pago no se completó
                </h1>

                <p>
                  Los datos de la compra
                  quedaron igualmente registrados
                  en el panel Admin.
                </p>

                <a
                  class="button"
                  href="/"
                >
                  Volver
                </a>

              </div>
            </div>
          </section>
        `
      )
    );
  }
);

app.get(
  '/admin/login',
  (
    req,
    res
  ) => {
    res.send(
      layout(
        'Admin',
        `
          <section class="section">
            <div class="container">

              <div
                class="panel"
                style="
                  max-width:500px;
                  margin:40px auto;
                "
              >

                <h1>
                  Panel Admin
                </h1>

                <form
                  action="/admin/login"
                  method="POST"
                >

                  <div class="form-grid">

                    <div class="form-group full">
                      <label>
                        Email
                      </label>

                      <input
                        type="email"
                        name="email"
                        required
                      >
                    </div>

                    <div class="form-group full">
                      <label>
                        Contraseña
                      </label>

                      <input
                        type="password"
                        name="password"
                        required
                      >
                    </div>

                    <div class="form-group full">
                      <button
                        class="button full"
                        type="submit"
                      >
                        Entrar
                      </button>
                    </div>

                  </div>

                </form>

              </div>
            </div>
          </section>
        `
      )
    );
  }
);

app.post(
  '/admin/login',
  (
    req,
    res
  ) => {
    const email =
      String(
        req.body.email || ''
      ).trim();

    const password =
      String(
        req.body.password || ''
      );

    if (
      email !== ADMIN_EMAIL ||
      password !== ADMIN_PASSWORD
    ) {
      return res
        .status(401)
        .send(
          layout(
            'Acceso denegado',
            `
              <section class="section">
                <div class="container">
                  <div class="panel">
                    <h1>
                      Datos incorrectos
                    </h1>

                    <a
                      class="button"
                      href="/admin/login"
                    >
                      Intentar de nuevo
                    </a>
                  </div>
                </div>
              </section>
            `
          )
        );
    }

    const token =
      createAdminToken();

    res.cookie(
      'admin_token',
      token,
      {
        httpOnly: true,
        sameSite: 'lax',
        secure:
          PUBLIC_URL.startsWith(
            'https://'
          ),
        maxAge:
          7 *
          24 *
          60 *
          60 *
          1000
      }
    );

    res.redirect(
      '/admin'
    );
  }
);

app.get(
  '/admin/logout',
  (
    req,
    res
  ) => {
    res.clearCookie(
      'admin_token'
    );

    res.redirect(
      '/admin/login'
    );
  }
);
app.get(
  '/admin',
  adminRequired,
  async (
    req,
    res
  ) => {
    const [
      courses,
      products,
      services,
      settings,
      inscriptions,
      orders
    ] = await Promise.all([
      getCourses(),
      getProducts(),
      getServices(),
      getSiteSettings(),
      supabaseRequest(
        'inscriptions?select=*&order=created_at.desc'
      ),
      supabaseRequest(
        'orders?select=*&order=created_at.desc'
      )
    ]);

    const courseForms =
      courses
        .map(
          course => `
            <div class="admin-item">

              ${
                course.image
                  ? `
                    <img
                      class="preview-image"
                      src="${escapeHtml(course.image)}"
                      alt="${escapeHtml(course.name)}"
                    >
                  `
                  : ''
              }

              <h3>
                ${escapeHtml(course.name)}
              </h3>

              <form
                action="/admin/course/update"
                method="POST"
                enctype="multipart/form-data"
              >

                <input
                  type="hidden"
                  name="id"
                  value="${escapeHtml(course.id)}"
                >

                <input
                  type="hidden"
                  name="currentImage"
                  value="${escapeHtml(course.image)}"
                >

                <div class="form-grid">

                  <div class="form-group">
                    <label>
                      Nombre
                    </label>

                    <input
                      type="text"
                      name="name"
                      value="${escapeHtml(course.name)}"
                      required
                    >
                  </div>

                  <div class="form-group">
                    <label>
                      Ícono
                    </label>

                    <input
                      type="text"
                      name="icon"
                      value="${escapeHtml(course.icon)}"
                    >
                  </div>

                  <div class="form-group full">
                    <label>
                      Foto
                    </label>

                    <input
                      type="file"
                      name="imageFile"
                      accept="image/*"
                    >
                  </div>

                  <div class="form-group full">
                    <label>
                      Descripción
                    </label>

                    <textarea
                      name="description"
                    >${escapeHtml(course.description)}</textarea>
                  </div>

                  <div class="form-group full">
                    <label>
                      Horarios
                    </label>

                    <textarea
                      name="schedules"
                    >${escapeHtml(course.schedules.join('\n'))}</textarea>
                  </div>

                  <div class="form-group">
                    <label>
                      Inscripción
                    </label>

                    <input
                      type="number"
                      name="registration"
                      value="${Number(course.registration || 0)}"
                      min="0"
                    >
                  </div>

                  <div class="form-group">
                    <label>
                      Cuota
                    </label>

                    <input
                      type="number"
                      name="monthlyFee"
                      value="${Number(course.monthlyFee || 0)}"
                      min="0"
                    >
                  </div>

                  <div class="form-group full">
                    <button
                      class="button"
                      type="submit"
                    >
                      Guardar cambios
                    </button>
                  </div>

                </div>
              </form>
            </div>
          `
        )
        .join('');

    const serviceForms =
      services
        .map(
          service => `
            <div class="admin-item">

              ${
                service.image
                  ? `
                    <img
                      class="preview-image"
                      src="${escapeHtml(service.image)}"
                      alt="${escapeHtml(service.name)}"
                    >
                  `
                  : ''
              }

              <h3>
                ${escapeHtml(service.name)}
              </h3>

              <form
                action="/admin/service/update"
                method="POST"
                enctype="multipart/form-data"
              >

                <input
                  type="hidden"
                  name="id"
                  value="${escapeHtml(service.id)}"
                >

                <input
                  type="hidden"
                  name="currentImage"
                  value="${escapeHtml(service.image)}"
                >

                <div class="form-grid">

                  <div class="form-group">
                    <label>
                      Nombre
                    </label>

                    <input
                      type="text"
                      name="name"
                      value="${escapeHtml(service.name)}"
                      required
                    >
                  </div>

                  <div class="form-group">
                    <label>
                      Ícono
                    </label>

                    <input
                      type="text"
                      name="icon"
                      value="${escapeHtml(service.icon)}"
                    >
                  </div>

                  <div class="form-group full">
                    <label>
                      Foto
                    </label>

                    <input
                      type="file"
                      name="imageFile"
                      accept="image/*"
                    >
                  </div>

                  <div class="form-group full">
                    <label>
                      Descripción
                    </label>

                    <textarea
                      name="description"
                    >${escapeHtml(service.description)}</textarea>
                  </div>

                  <div class="form-group">
                    <label>
                      Precio
                    </label>

                    <input
                      type="number"
                      name="price"
                      value="${Number(service.price || 0)}"
                      min="0"
                    >
                  </div>

                  <div class="form-group full">
                    <button
                      class="button"
                      type="submit"
                    >
                      Guardar cambios
                    </button>
                  </div>

                </div>
              </form>
            </div>
          `
        )
        .join('');

    const productForms =
      products
        .map(
          product => `
            <div class="admin-item">

              ${
                product.image
                  ? `
                    <img
                      class="preview-image"
                      src="${escapeHtml(product.image)}"
                      alt="${escapeHtml(product.name)}"
                    >
                  `
                  : ''
              }

              <h3>
                ${escapeHtml(product.name)}
              </h3>

              <form
                action="/admin/product/update"
                method="POST"
                enctype="multipart/form-data"
              >

                <input
                  type="hidden"
                  name="id"
                  value="${escapeHtml(product.id)}"
                >

                <input
                  type="hidden"
                  name="currentImage"
                  value="${escapeHtml(product.image)}"
                >

                <div class="form-grid">

                  <div class="form-group">
                    <label>
                      Nombre
                    </label>

                    <input
                      type="text"
                      name="name"
                      value="${escapeHtml(product.name)}"
                      required
                    >
                  </div>

                  <div class="form-group">
                    <label>
                      Ícono
                    </label>

                    <input
                      type="text"
                      name="icon"
                      value="${escapeHtml(product.icon)}"
                    >
                  </div>

                  <div class="form-group full">
                    <label>
                      Foto
                    </label>

                    <input
                      type="file"
                      name="imageFile"
                      accept="image/*"
                    >
                  </div>

                  <div class="form-group">
                    <label>
                      Precio
                    </label>

                    <input
                      type="number"
                      name="price"
                      value="${Number(product.price || 0)}"
                      min="0"
                    >
                  </div>

                  <div class="form-group">
                    <label>
                      Stock
                    </label>

                    <input
                      type="number"
                      name="stock"
                      value="${Number(product.stock || 0)}"
                      min="0"
                    >
                  </div>

                  <div class="form-group full">
                    <button
                      class="button"
                      type="submit"
                    >
                      Guardar cambios
                    </button>
                  </div>

                </div>
              </form>
            </div>
          `
        )
        .join('');

    const inscriptionsRows =
      Array.isArray(inscriptions)
        ? inscriptions
            .map(
              item => `
                <tr>
                  <td>
                    ${escapeHtml(
                      `${item.first_name || ''} ${item.last_name || ''}`
                    )}
                  </td>

                  <td>
                    ${escapeHtml(item.document || '')}
                  </td>

                  <td>
                    ${escapeHtml(item.whatsapp || '')}
                  </td>

                  <td>
                    ${escapeHtml(item.course_name || '')}
                  </td>

                  <td>
                    ${escapeHtml(item.schedule || '')}
                  </td>

                  <td>
                    ${money(item.amount)}
                  </td>

                  <td>
                    ${escapeHtml(item.status || '')}
                  </td>

                  <td>
                    ${escapeHtml(formatDate(item.created_at))}
                  </td>
                </tr>
              `
            )
            .join('')
        : '';

    const ordersRows =
      Array.isArray(orders)
        ? orders
            .map(
              order => {
                const itemsText =
                  Array.isArray(order.items)
                    ? order.items
                        .map(
                          item =>
                            `${item.name} x${item.quantity}`
                        )
                        .join(', ')
                    : '';

                return `
                  <tr>
                    <td>
                      ${escapeHtml(order.buyer_name || '')}
                    </td>

                    <td>
                      ${escapeHtml(order.buyer_whatsapp || '')}
                    </td>

                    <td>
                      ${escapeHtml(itemsText)}
                    </td>

                    <td>
                      ${money(order.total)}
                    </td>

                    <td>
                      ${escapeHtml(order.status || '')}
                    </td>

                    <td>
                      ${escapeHtml(formatDate(order.created_at))}
                    </td>
                  </tr>
                `;
              }
            )
            .join('')
        : '';

    const content = `
      <section class="section">
        <div class="container">

          <div
            class="actions"
            style="
              justify-content:space-between;
              margin-bottom:25px;
            "
          >
            <div>
              <h1 style="margin:0;">
                Panel Admin
              </h1>

              <p class="muted">
                Administrá toda la página desde acá.
              </p>
            </div>

            <a
              class="button dark"
              href="/admin/logout"
            >
              Cerrar sesión
            </a>
          </div>

          <div class="admin-grid">

            <div class="panel">
              <h2>
                Fondo de la página
              </h2>

              ${
                settings.backgroundImage
                  ? `
                    <img
                      class="preview-image"
                      src="${escapeHtml(settings.backgroundImage)}"
                      alt="Fondo actual"
                    >
                  `
                  : ''
              }

              <form
                action="/admin/settings"
                method="POST"
                enctype="multipart/form-data"
              >

                <div class="form-grid">

                  <div class="form-group full">
                    <label>
                      Cambiar imagen de fondo
                    </label>

                    <input
                      type="file"
                      name="backgroundFile"
                      accept="image/*"
                    >
                  </div>

                  <div class="form-group full">
                    <button
                      class="button"
                      type="submit"
                    >
                      Guardar fondo
                    </button>
                  </div>

                </div>
              </form>
            </div>

            <div class="panel">
              <h2>
                Agregar curso
              </h2>

              <form
                action="/admin/course/add"
                method="POST"
                enctype="multipart/form-data"
              >

                <div class="form-grid">

                  <div class="form-group">
                    <label>
                      Nombre
                    </label>

                    <input
                      type="text"
                      name="name"
                      required
                    >
                  </div>

                  <div class="form-group">
                    <label>
                      Ícono
                    </label>

                    <input
                      type="text"
                      name="icon"
                      value="✂️"
                    >
                  </div>

                  <div class="form-group full">
                    <label>
                      Foto
                    </label>

                    <input
                      type="file"
                      name="imageFile"
                      accept="image/*"
                    >
                  </div>

                  <div class="form-group full">
                    <label>
                      Descripción
                    </label>

                    <textarea
                      name="description"
                    ></textarea>
                  </div>

                  <div class="form-group full">
                    <label>
                      Horarios
                    </label>

                    <textarea
                      name="schedules"
                      placeholder="Un horario por línea"
                    ></textarea>
                  </div>

                  <div class="form-group">
                    <label>
                      Inscripción
                    </label>

                    <input
                      type="number"
                      name="registration"
                      min="0"
                    >
                  </div>

                  <div class="form-group">
                    <label>
                      Cuota
                    </label>

                    <input
                      type="number"
                      name="monthlyFee"
                      min="0"
                    >
                  </div>

                  <div class="form-group full">
                    <button
                      class="button"
                      type="submit"
                    >
                      Agregar curso
                    </button>
                  </div>

                </div>
              </form>
            </div>

            <div class="panel">
              <h2>
                Editar cursos
              </h2>

              <div class="admin-grid">
                ${courseForms}
              </div>
            </div>

            <div class="panel">
              <h2>
                Agregar servicio del salón
              </h2>

              <form
                action="/admin/service/add"
                method="POST"
                enctype="multipart/form-data"
              >

                <div class="form-grid">

                  <div class="form-group">
                    <label>
                      Nombre del servicio
                    </label>

                    <input
                      type="text"
                      name="name"
                      required
                    >
                  </div>

                  <div class="form-group">
                    <label>
                      Ícono
                    </label>

                    <input
                      type="text"
                      name="icon"
                      value="💇"
                    >
                  </div>

                  <div class="form-group full">
                    <label>
                      Foto
                    </label>

                    <input
                      type="file"
                      name="imageFile"
                      accept="image/*"
                    >
                  </div>

                  <div class="form-group full">
                    <label>
                      Descripción
                    </label>

                    <textarea
                      name="description"
                    ></textarea>
                  </div>

                  <div class="form-group">
                    <label>
                      Precio
                    </label>

                    <input
                      type="number"
                      name="price"
                      min="0"
                      required
                    >
                  </div>

                  <div class="form-group full">
                    <button
                      class="button"
                      type="submit"
                    >
                      Agregar servicio
                    </button>
                  </div>

                </div>
              </form>
            </div>

            <div class="panel">
              <h2>
                Editar servicios del salón
              </h2>

              <div class="admin-grid">
                ${serviceForms}
              </div>
            </div>

            <div class="panel">
              <h2>
                Agregar artículo
              </h2>

              <form
                action="/admin/product/add"
                method="POST"
                enctype="multipart/form-data"
              >

                <div class="form-grid">

                  <div class="form-group">
                    <label>
                      Nombre
                    </label>

                    <input
                      type="text"
                      name="name"
                      required
                    >
                  </div>

                  <div class="form-group">
                    <label>
                      Ícono
                    </label>

                    <input
                      type="text"
                      name="icon"
                      value="🛍️"
                    >
                  </div>

                  <div class="form-group full">
                    <label>
                      Foto
                    </label>

                    <input
                      type="file"
                      name="imageFile"
                      accept="image/*"
                    >
                  </div>

                  <div class="form-group">
                    <label>
                      Precio
                    </label>

                    <input
                      type="number"
                      name="price"
                      min="0"
                      required
                    >
                  </div>

                  <div class="form-group">
                    <label>
                      Stock
                    </label>

                    <input
                      type="number"
                      name="stock"
                      min="0"
                      required
                    >
                  </div>

                  <div class="form-group full">
                    <button
                      class="button"
                      type="submit"
                    >
                      Agregar artículo
                    </button>
                  </div>

                </div>
              </form>
            </div>

            <div class="panel">
              <h2>
                Editar artículos
              </h2>

              <div class="admin-grid">
                ${productForms}
              </div>
            </div>

            <div class="panel">
              <h2>
                Inscripciones
              </h2>

              <div class="table-wrap">
                <table>

                  <thead>
                    <tr>
                      <th>
                        Alumno
                      </th>

                      <th>
                        DNI
                      </th>

                      <th>
                        WhatsApp
                      </th>

                      <th>
                        Curso
                      </th>

                      <th>
                        Horario
                      </th>

                      <th>
                        Importe
                      </th>

                      <th>
                        Estado
                      </th>

                      <th>
                        Fecha
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    ${
                      inscriptionsRows ||
                      `
                        <tr>
                          <td colspan="8">
                            No hay inscripciones todavía.
                          </td>
                        </tr>
                      `
                    }
                  </tbody>

                </table>
              </div>
            </div>

            <div class="panel">
              <h2>
                Ventas
              </h2>

              <div class="table-wrap">
                <table>

                  <thead>
                    <tr>
                      <th>
                        Cliente
                      </th>

                      <th>
                        WhatsApp
                      </th>

                      <th>
                        Artículos
                      </th>

                      <th>
                        Total
                      </th>

                      <th>
                        Estado
                      </th>

                      <th>
                        Fecha
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    ${
                      ordersRows ||
                      `
                        <tr>
                          <td colspan="6">
                            No hay ventas todavía.
                          </td>
                        </tr>
                      `
                    }
                  </tbody>

                </table>
              </div>
            </div>

          </div>
        </div>
      </section>
    `;

    res.send(
      layout(
        'Panel Admin',
        content,
        {
          backgroundImage:
            settings.backgroundImage
        }
      )
    );
  }
);
app.post(
  '/admin/settings',
  adminRequired,
  upload.single('backgroundFile'),
  async (
    req,
    res
  ) => {
    try {
      let backgroundImage =
        siteSettings.backgroundImage || '';

      if (req.file) {
        backgroundImage =
          await uploadImageToSupabase(
            req.file,
            'backgrounds'
          );
      }

      const existing =
        await supabaseRequest(
          'site_settings?key=eq.main&select=*'
        );

      if (
        Array.isArray(existing) &&
        existing.length > 0
      ) {
        await supabaseWrite(
          'site_settings?key=eq.main',
          {
            method: 'PATCH',

            body:
              JSON.stringify({
                background_image:
                  backgroundImage
              })
          }
        );
      } else {
        await supabaseWrite(
          'site_settings',
          {
            method: 'POST',

            body:
              JSON.stringify({
                key: 'main',

                background_image:
                  backgroundImage
              })
          }
        );
      }

      siteSettings = {
        backgroundImage
      };

      res.redirect(
        '/admin'
      );
    } catch (
      error
    ) {
      console.error(
        error
      );

      res
        .status(500)
        .send(
          errorPage(
            'No se pudo guardar el fondo',
            error.message
          )
        );
    }
  }
);

app.post(
  '/admin/course/add',
  adminRequired,
  upload.single('imageFile'),
  async (
    req,
    res
  ) => {
    try {
      const name =
        String(
          req.body.name || ''
        ).trim();

      if (!name) {
        throw new Error(
          'El curso necesita un nombre.'
        );
      }

      let image = '';

      if (req.file) {
        image =
          await uploadImageToSupabase(
            req.file,
            'courses'
          );
      }

      const id =
        `${slugify(name)}-${Date.now()}`;

      const databaseCourse = {
        id,

        icon:
          String(
            req.body.icon || '✂️'
          ).trim(),

        image,

        name,

        description:
          String(
            req.body.description || ''
          ).trim(),

        schedules:
          normalizeSchedules(
            req.body.schedules
          ),

        registration:
          Number(
            req.body.registration || 0
          ),

        monthly_fee:
          Number(
            req.body.monthlyFee || 0
          )
      };

      await supabaseWrite(
        'courses',
        {
          method: 'POST',

          body:
            JSON.stringify(
              databaseCourse
            )
        }
      );

      memoryCourses.push(
        databaseCourseToApp(
          databaseCourse
        )
      );

      res.redirect(
        '/admin'
      );
    } catch (
      error
    ) {
      console.error(
        error
      );

      res
        .status(500)
        .send(
          errorPage(
            'No se pudo agregar el curso',
            error.message
          )
        );
    }
  }
);

app.post(
  '/admin/course/update',
  adminRequired,
  upload.single('imageFile'),
  async (
    req,
    res
  ) => {
    try {
      const id =
        String(
          req.body.id || ''
        ).trim();

      if (!id) {
        throw new Error(
          'Falta el identificador del curso.'
        );
      }

      let image =
        String(
          req.body.currentImage || ''
        ).trim();

      if (req.file) {
        image =
          await uploadImageToSupabase(
            req.file,
            'courses'
          );
      }

      const databaseCourse = {
        icon:
          String(
            req.body.icon || '✂️'
          ).trim(),

        image,

        name:
          String(
            req.body.name || ''
          ).trim(),

        description:
          String(
            req.body.description || ''
          ).trim(),

        schedules:
          normalizeSchedules(
            req.body.schedules
          ),

        registration:
          Number(
            req.body.registration || 0
          ),

        monthly_fee:
          Number(
            req.body.monthlyFee || 0
          )
      };

      await supabaseWrite(
        `courses?id=eq.${encodeURIComponent(
          id
        )}`,
        {
          method: 'PATCH',

          body:
            JSON.stringify(
              databaseCourse
            )
        }
      );

      memoryCourses =
        memoryCourses.map(
          course =>
            course.id === id
              ? databaseCourseToApp({
                  id,
                  ...databaseCourse
                })
              : course
        );

      res.redirect(
        '/admin'
      );
    } catch (
      error
    ) {
      console.error(
        error
      );

      res
        .status(500)
        .send(
          errorPage(
            'No se pudo actualizar el curso',
            error.message
          )
        );
    }
  }
);

app.post(
  '/admin/service/add',
  adminRequired,
  upload.single('imageFile'),
  async (
    req,
    res
  ) => {
    try {
      const name =
        String(
          req.body.name || ''
        ).trim();

      if (!name) {
        throw new Error(
          'El servicio necesita un nombre.'
        );
      }

      let image = '';

      if (req.file) {
        image =
          await uploadImageToSupabase(
            req.file,
            'services'
          );
      }

      const id =
        `${slugify(name)}-${Date.now()}`;

      const databaseService = {
        id,

        icon:
          String(
            req.body.icon || '💇'
          ).trim(),

        image,

        name,

        description:
          String(
            req.body.description || ''
          ).trim(),

        price:
          Number(
            req.body.price || 0
          )
      };

      await supabaseWrite(
        'services',
        {
          method: 'POST',

          body:
            JSON.stringify(
              databaseService
            )
        }
      );

      memoryServices.push(
        databaseServiceToApp(
          databaseService
        )
      );

      res.redirect(
        '/admin'
      );
    } catch (
      error
    ) {
      console.error(
        error
      );

      res
        .status(500)
        .send(
          errorPage(
            'No se pudo agregar el servicio',
            error.message
          )
        );
    }
  }
);

app.post(
  '/admin/service/update',
  adminRequired,
  upload.single('imageFile'),
  async (
    req,
    res
  ) => {
    try {
      const id =
        String(
          req.body.id || ''
        ).trim();

      if (!id) {
        throw new Error(
          'Falta el identificador del servicio.'
        );
      }

      let image =
        String(
          req.body.currentImage || ''
        ).trim();

      if (req.file) {
        image =
          await uploadImageToSupabase(
            req.file,
            'services'
          );
      }

      const databaseService = {
        icon:
          String(
            req.body.icon || '💇'
          ).trim(),

        image,

        name:
          String(
            req.body.name || ''
          ).trim(),

        description:
          String(
            req.body.description || ''
          ).trim(),

        price:
          Number(
            req.body.price || 0
          )
      };

      await supabaseWrite(
        `services?id=eq.${encodeURIComponent(
          id
        )}`,
        {
          method: 'PATCH',

          body:
            JSON.stringify(
              databaseService
            )
        }
      );

      memoryServices =
        memoryServices.map(
          service =>
            service.id === id
              ? databaseServiceToApp({
                  id,
                  ...databaseService
                })
              : service
        );

      res.redirect(
        '/admin'
      );
    } catch (
      error
    ) {
      console.error(
        error
      );

      res
        .status(500)
        .send(
          errorPage(
            'No se pudo actualizar el servicio',
            error.message
          )
        );
    }
  }
);

app.post(
  '/admin/product/add',
  adminRequired,
  upload.single('imageFile'),
  async (
    req,
    res
  ) => {
    try {
      const name =
        String(
          req.body.name || ''
        ).trim();

      if (!name) {
        throw new Error(
          'El artículo necesita un nombre.'
        );
      }

      let image = '';

      if (req.file) {
        image =
          await uploadImageToSupabase(
            req.file,
            'products'
          );
      }

      const id =
        `${slugify(name)}-${Date.now()}`;

      const databaseProduct = {
        id,

        icon:
          String(
            req.body.icon || '🛍️'
          ).trim(),

        image,

        name,

        price:
          Number(
            req.body.price || 0
          ),

        stock:
          Number(
            req.body.stock || 0
          )
      };

      await supabaseWrite(
        'products',
        {
          method: 'POST',

          body:
            JSON.stringify(
              databaseProduct
            )
        }
      );

      memoryProducts.push(
        databaseProductToApp(
          databaseProduct
        )
      );

      res.redirect(
        '/admin'
      );
    } catch (
      error
    ) {
      console.error(
        error
      );

      res
        .status(500)
        .send(
          errorPage(
            'No se pudo agregar el artículo',
            error.message
          )
        );
    }
  }
);

app.post(
  '/admin/product/update',
  adminRequired,
  upload.single('imageFile'),
  async (
    req,
    res
  ) => {
    try {
      const id =
        String(
          req.body.id || ''
        ).trim();

      if (!id) {
        throw new Error(
          'Falta el identificador del artículo.'
        );
      }

      let image =
        String(
          req.body.currentImage || ''
        ).trim();

      if (req.file) {
        image =
          await uploadImageToSupabase(
            req.file,
            'products'
          );
      }

      const databaseProduct = {
        icon:
          String(
            req.body.icon || '🛍️'
          ).trim(),

        image,

        name:
          String(
            req.body.name || ''
          ).trim(),

        price:
          Number(
            req.body.price || 0
          ),

        stock:
          Number(
            req.body.stock || 0
          )
      };

      await supabaseWrite(
        `products?id=eq.${encodeURIComponent(
          id
        )}`,
        {
          method: 'PATCH',

          body:
            JSON.stringify(
              databaseProduct
            )
        }
      );

      memoryProducts =
        memoryProducts.map(
          product =>
            product.id === id
              ? databaseProductToApp({
                  id,
                  ...databaseProduct
                })
              : product
        );

      res.redirect(
        '/admin'
      );
    } catch (
      error
    ) {
      console.error(
        error
      );

      res
        .status(500)
        .send(
          errorPage(
            'No se pudo actualizar el artículo',
            error.message
          )
        );
    }
  }
);
app.get(
  '/health',
  (
    req,
    res
  ) => {
    res.json({
      ok: true,
      service:
        'Centro Constitución'
    });
  }
);

app.use(
  (
    req,
    res
  ) => {
    res
      .status(404)
      .send(
        layout(
          'Página no encontrada',
          `
            <section class="section">
              <div class="container">
                <div class="panel">

                  <h1>
                    Página no encontrada
                  </h1>

                  <p>
                    La página que buscás
                    no existe.
                  </p>

                  <a
                    class="button"
                    href="/"
                  >
                    Volver al inicio
                  </a>

                </div>
              </div>
            </section>
          `
        )
      );
  }
);

app.use(
  (
    error,
    req,
    res,
    next
  ) => {
    console.error(
      error
    );

    res
      .status(500)
      .send(
        errorPage(
          'Ocurrió un error',
          error.message ||
          'Error interno del servidor.'
        )
      );
  }
);

app.listen(
  PORT,
  () => {
    console.log(
      `Centro Constitución funcionando en puerto ${PORT}`
    );
  }
);
