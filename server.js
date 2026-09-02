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
    name:
      'Manicuría y Pedicuría',

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
    id:
      'tijera-profesional',

    icon:
      '✂️',

    image:
      '',

    name:
      'Tijera profesional',

    price:
      45000,

    stock:
      10
  },

  {
    id:
      'maquina-corte',

    icon:
      '🪒',

    image:
      '',

    name:
      'Máquina de corte',

    price:
      90000,

    stock:
      8
  },

  {
    id:
      'secador-profesional',

    icon:
      '💨',

    image:
      '',

    name:
      'Secador profesional',

    price:
      70000,

    stock:
      6
  }
];

let memoryCourses =
  [...defaultCourses];

let memoryProducts =
  [...defaultProducts];

let siteSettings = {
  backgroundImage:
    process.env
      .BACKGROUND_IMAGE || ''
};

function money(
  value
) {
  return new Intl
    .NumberFormat(
      'es-AR',
      {
        style:
          'currency',

        currency:
          'ARS',

        maximumFractionDigits:
          0
      }
    )
    .format(
      Number(
        value || 0
      )
    );
}

function escapeHtml(
  value = ''
) {
  return String(value)
    .replaceAll(
      '&',
      '&amp;'
    )
    .replaceAll(
      '<',
      '&lt;'
    )
    .replaceAll(
      '>',
      '&gt;'
    )
    .replaceAll(
      '"',
      '&quot;'
    )
    .replaceAll(
      "'",
      '&#039;'
    );
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
      .map(item =>
        String(item).trim()
      )
      .filter(Boolean);
  }

  if (!value) {
    return [];
  }

  return String(value)
    .split('\n')
    .map(item =>
      item.trim()
    )
    .filter(Boolean);
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
  } catch (error) {
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
        method:
          'POST',

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

    input:focus,
    textarea:focus,
    select:focus {
      border-color:
        rgba(255,255,255,.45);
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
      border:
        1px solid
        rgba(255,255,255,.1);
    }

    .social-grid {
      display: grid;
      grid-template-columns:
        repeat(
          4,
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

function socialIcons() {
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
      settings
    ] = await Promise.all([
      getCourses(),
      getProducts(),
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
                Cursos presenciales de peluquería,
                barbería, colorimetría,
                manicuría y pedicuría.
                También encontrá herramientas
                y artículos profesionales.
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
              Encontranos en nuestras
              redes sociales y mirá
              nuestros comentarios en Google.
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
              src="https://www.google.com/maps?q=${encodeURIComponent(ADDRESS)}&output=embed"
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
                href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(ADDRESS)}"
              >
                Abrir ubicación
              </a>
            </div>

          </div>
        </section>

      </main>

      <script>
        let cart = [];

        function moneyClient(
          value
        ) {
          return new Intl
            .NumberFormat(
              'es-AR',
              {
                style:
                  'currency',

                currency:
                  'ARS',

                maximumFractionDigits:
                  0
              }
            )
            .format(
              Number(value || 0)
            );
        }

        function addToCart(
          product
        ) {
          const existing =
            cart.find(
              item =>
                item.id === product.id
            );

          if (existing) {
            existing.quantity += 1;
          } else {
            cart.push({
              ...product,
              quantity: 1
            });
          }

          renderCart();
        }

        function removeFromCart(
          id
        ) {
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
              entry =>
                entry.id === id
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

          const totalContainer =
            document.getElementById(
              'cartTotal'
            );

          const input =
            document.getElementById(
              'cartItemsInput'
            );

          if (
            !container ||
            !totalContainer ||
            !input
          ) {
            return;
          }

          if (
            cart.length === 0
          ) {
            container.innerHTML =
              '<p class="muted">Tu carrito está vacío.</p>';

            totalContainer.textContent =
              'Total: $0';

            input.value =
              '[]';

            return;
          }

          container.innerHTML =
            cart
              .map(
                item => \`
                  <div class="cart-item">
                    <div>
                      <strong>
                        \${item.name}
                      </strong>

                      <div class="muted">
                        \${moneyClient(item.price)}
                        x
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
                \`
              )
              .join('');

          const total =
            cart.reduce(
              (
                sum,
                item
              ) =>
                sum +
                (
                  Number(item.price) *
                  Number(item.quantity)
                ),
              0
            );

          totalContainer.textContent =
            'Total: ' +
            moneyClient(total);

          input.value =
            JSON.stringify(
              cart.map(
                item => ({
                  id:
                    item.id,

                  quantity:
                    item.quantity
                })
              )
            );
        }

        document
          .getElementById(
            'checkoutForm'
          )
          ?.addEventListener(
            'submit',
            event => {
              if (
                cart.length === 0
              ) {
                event.preventDefault();

                alert(
                  'Agregá al menos un artículo al carrito.'
                );
              }
            }
          );
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
          String(item.id) ===
          String(req.params.id)
      );

    if (!course) {
      return res
        .status(404)
        .send(
          layout(
            'Curso no encontrado',
            `
              <main class="section">
                <div class="container">
                  <div class="panel">
                    <h1>
                      Curso no encontrado
                    </h1>

                    <a
                      class="button"
                      href="/#cursos"
                    >
                      Volver a cursos
                    </a>
                  </div>
                </div>
              </main>
            `
          )
        );
    }

    const scheduleOptions =
      (
        course.schedules
          .length
          ? course.schedules
          : [
              'Horario próximamente'
            ]
      )
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
      <main class="section">
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

                <p>
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
              </div>
            </article>

            <section class="panel">
              <h2>
                Inscribirme en este curso
              </h2>

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
                      Curso
                    </label>

                    <input
                      type="text"
                      value="${escapeHtml(course.name)}"
                      readonly
                    >
                  </div>

                  <div class="form-group full">
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
                      ${money(course.registration)}
                    </button>
                  </div>

                </div>
              </form>
            </section>

          </div>

        </div>
      </main>
    `;

    res.send(
      layout(
        course.name,
        content
      )
    );
  }
);
async function createMercadoPagoPreference(
  data
) {
  if (!MP_ACCESS_TOKEN) {
    throw new Error(
      'Mercado Pago no está configurado.'
    );
  }

  const response =
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
          JSON.stringify(data)
      }
    );

  const text =
    await response.text();

  if (!response.ok) {
    console.error(
      'Error Mercado Pago:',
      response.status,
      text
    );

    throw new Error(
      'No se pudo crear el pago.'
    );
  }

  return JSON.parse(text);
}

async function getMercadoPagoPayment(
  paymentId
) {
  if (
    !MP_ACCESS_TOKEN ||
    !paymentId
  ) {
    return null;
  }

  try {
    const response =
      await fetch(
        `https://api.mercadopago.com/v1/payments/${encodeURIComponent(paymentId)}`,
        {
          headers: {
            Authorization:
              `Bearer ${MP_ACCESS_TOKEN}`
          }
        }
      );

    if (!response.ok) {
      return null;
    }

    return await response.json();
  } catch (
    error
  ) {
    console.error(
      'Error verificando pago:',
      error
    );

    return null;
  }
}

async function updateInscriptionStatus(
  id,
  status
) {
  if (!id) {
    return;
  }

  await supabaseWrite(
    `inscriptions?id=eq.${encodeURIComponent(id)}`,
    {
      method: 'PATCH',

      body:
        JSON.stringify({
          payment_status:
            status
        })
    }
  );
}

async function getInscription(
  id
) {
  if (!id) {
    return null;
  }

  const data =
    await supabaseRequest(
      `inscriptions?id=eq.${encodeURIComponent(id)}&select=*`
    );

  if (
    Array.isArray(data) &&
    data[0]
  ) {
    return data[0];
  }

  return null;
}

async function updateOrderStatus(
  id,
  status
) {
  if (!id) {
    return;
  }

  await supabaseWrite(
    `orders?id=eq.${encodeURIComponent(id)}`,
    {
      method: 'PATCH',

      body:
        JSON.stringify({
          payment_status:
            status
        })
    }
  );
}

async function getOrder(
  id
) {
  if (!id) {
    return null;
  }

  const data =
    await supabaseRequest(
      `orders?id=eq.${encodeURIComponent(id)}&select=*`
    );

  if (
    Array.isArray(data) &&
    data[0]
  ) {
    return data[0];
  }

  return null;
}

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

      if (
        !firstName ||
        !lastName ||
        !document ||
        !birthDate ||
        !whatsapp ||
        !courseId ||
        !schedule
      ) {
        return res
          .status(400)
          .send(
            layout(
              'Faltan datos',
              `
                <main class="section">
                  <div class="container">
                    <div class="panel">
                      <h1>
                        Faltan datos
                      </h1>

                      <p>
                        Completá todos los campos.
                      </p>

                      <a
                        class="button"
                        href="/course/${encodeURIComponent(courseId || '')}"
                      >
                        Volver
                      </a>
                    </div>
                  </div>
                </main>
              `
            )
          );
      }

      const courses =
        await getCourses();

      const course =
        courses.find(
          item =>
            String(item.id) ===
            String(courseId)
        );

      if (!course) {
        throw new Error(
          'El curso no existe.'
        );
      }

      const inscriptionId =
        `ins-${Date.now()}-${Math.random()
          .toString(36)
          .slice(2, 8)}`;

      await supabaseWrite(
        'inscriptions',
        {
          method: 'POST',

          body:
            JSON.stringify({
              id:
                inscriptionId,

              first_name:
                String(firstName).trim(),

              last_name:
                String(lastName).trim(),

              document:
                String(document).trim(),

              birth_date:
                birthDate,

              whatsapp:
                String(whatsapp).trim(),

              course_id:
                course.id,

              course_name:
                course.name,

              schedule:
                String(schedule).trim(),

              amount:
                Number(
                  course.registration
                ),

              payment_status:
                'pending',

              created_at:
                new Date()
                  .toISOString()
            })
        }
      );

      const preference =
        await createMercadoPagoPreference(
          {
            items: [
              {
                title:
                  `Inscripción ${course.name}`,

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

            payer: {
              name:
                String(firstName).trim(),

              surname:
                String(lastName).trim()
            },

            external_reference:
              inscriptionId,

            back_urls: {
              success:
                `${PUBLIC_URL}/payment/success?inscription_id=${encodeURIComponent(inscriptionId)}`,

              pending:
                `${PUBLIC_URL}/payment/pending?inscription_id=${encodeURIComponent(inscriptionId)}`,

              failure:
                `${PUBLIC_URL}/payment/failure?inscription_id=${encodeURIComponent(inscriptionId)}`
            },

            auto_return:
              'approved'
          }
        );

      if (
        !preference ||
        !preference.init_point
      ) {
        throw new Error(
          'Mercado Pago no devolvió un enlace de pago.'
        );
      }

      return res.redirect(
        preference.init_point
      );
    } catch (
      error
    ) {
      console.error(
        error
      );

      return res
        .status(500)
        .send(
          layout(
            'Error',
            `
              <main class="section">
                <div class="container">
                  <div class="panel">
                    <h1>
                      No se pudo iniciar la inscripción
                    </h1>

                    <p>
                      ${escapeHtml(
                        error.message ||
                        'Ocurrió un error.'
                      )}
                    </p>

                    <a
                      class="button"
                      href="/#cursos"
                    >
                      Volver a cursos
                    </a>
                  </div>
                </div>
              </main>
            `
          )
        );
    }
  }
);

app.get(
  '/payment/success',
  async (
    req,
    res
  ) => {
    const inscriptionId =
      String(
        req.query
          .inscription_id || ''
      );

    const paymentId =
      String(
        req.query
          .payment_id || ''
      );

    let approved =
      false;

    if (paymentId) {
      const payment =
        await getMercadoPagoPayment(
          paymentId
        );

      approved =
        payment &&
        payment.status ===
          'approved' &&
        String(
          payment.external_reference ||
          ''
        ) === inscriptionId;
    }

    if (approved) {
      try {
        await updateInscriptionStatus(
          inscriptionId,
          'paid'
        );
      } catch (
        error
      ) {
        console.error(error);
      }
    }

    const inscription =
      await getInscription(
        inscriptionId
      );

    if (!approved) {
      return res.send(
        layout(
          'Pago en revisión',
          `
            <main class="section">
              <div class="container">
                <div class="panel">
                  <h1>
                    Estamos verificando el pago
                  </h1>

                  <p>
                    Si Mercado Pago aprobó la operación,
                    la inscripción quedará registrada
                    como pagada.
                  </p>

                  <a
                    class="button"
                    href="/"
                  >
                    Volver al inicio
                  </a>
                </div>
              </div>
            </main>
          `
        )
      );
    }

    const whatsappText =
      inscription
        ? encodeURIComponent(
            `Hola, soy ${inscription.first_name} ${inscription.last_name}. Ya pagué la inscripción para ${inscription.course_name}, horario ${inscription.schedule}.`
          )
        : encodeURIComponent(
            'Hola, ya pagué mi inscripción.'
          );

    return res.send(
      layout(
        'Inscripción pagada',
        `
          <main class="section">
            <div class="container">
              <div class="panel">

                <h1>
                  Inscripción pagada ✅
                </h1>

                <p>
                  Tu pago fue aprobado.
                </p>

                ${
                  inscription
                    ? `
                      <p>
                        <strong>
                          Curso:
                        </strong>
                        ${escapeHtml(inscription.course_name)}
                      </p>

                      <p>
                        <strong>
                          Horario:
                        </strong>
                        ${escapeHtml(inscription.schedule)}
                      </p>
                    `
                    : ''
                }

                <div class="actions">
                  <a
                    class="button"
                    target="_blank"
                    rel="noopener noreferrer"
                    href="https://wa.me/${encodeURIComponent(BUSINESS_WHATSAPP)}?text=${whatsappText}"
                  >
                    Enviar datos por WhatsApp
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
          </main>
        `
      )
    );
  }
);

app.get(
  '/payment/pending',
  async (
    req,
    res
  ) => {
    const inscriptionId =
      String(
        req.query
          .inscription_id || ''
      );

    try {
      await updateInscriptionStatus(
        inscriptionId,
        'pending'
      );
    } catch (
      error
    ) {
      console.error(error);
    }

    res.send(
      layout(
        'Pago pendiente',
        `
          <main class="section">
            <div class="container">
              <div class="panel">

                <h1>
                  Pago pendiente
                </h1>

                <p>
                  Mercado Pago todavía
                  no confirmó el pago.
                </p>

                <a
                  class="button"
                  href="/"
                >
                  Volver al inicio
                </a>

              </div>
            </div>
          </main>
        `
      )
    );
  }
);

app.get(
  '/payment/failure',
  async (
    req,
    res
  ) => {
    const inscriptionId =
      String(
        req.query
          .inscription_id || ''
      );

    try {
      await updateInscriptionStatus(
        inscriptionId,
        'failed'
      );
    } catch (
      error
    ) {
      console.error(error);
    }

    res.send(
      layout(
        'Pago rechazado',
        `
          <main class="section">
            <div class="container">
              <div class="panel">

                <h1>
                  El pago no se completó
                </h1>

                <p>
                  Podés volver al curso
                  e intentarlo nuevamente.
                </p>

                <a
                  class="button"
                  href="/#cursos"
                >
                  Volver a cursos
                </a>

              </div>
            </div>
          </main>
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
          req.body
            .buyerName || ''
        ).trim();

      const buyerWhatsapp =
        String(
          req.body
            .buyerWhatsapp || ''
        ).trim();

      let requestedItems = [];

      try {
        requestedItems =
          JSON.parse(
            req.body.items ||
            '[]'
          );
      } catch {
        requestedItems = [];
      }

      if (
        !buyerName ||
        !buyerWhatsapp ||
        !Array.isArray(requestedItems) ||
        requestedItems.length === 0
      ) {
        throw new Error(
          'Completá tus datos y agregá al menos un artículo.'
        );
      }

      const products =
        await getProducts();

      const orderItems = [];

      for (
        const requested of
        requestedItems
      ) {
        const product =
          products.find(
            item =>
              String(item.id) ===
              String(requested.id)
          );

        if (!product) {
          continue;
        }

        const quantity =
          Math.max(
            1,
            Math.floor(
              Number(
                requested.quantity || 1
              )
            )
          );

        if (
          Number(product.stock) <
          quantity
        ) {
          throw new Error(
            `No hay stock suficiente de ${product.name}.`
          );
        }

        orderItems.push({
          id:
            product.id,

          name:
            product.name,

          price:
            Number(
              product.price
            ),

          quantity
        });
      }

      if (
        orderItems.length === 0
      ) {
        throw new Error(
          'No se encontraron artículos válidos.'
        );
      }

      const total =
        orderItems.reduce(
          (
            sum,
            item
          ) =>
            sum +
            (
              item.price *
              item.quantity
            ),
          0
        );

      const orderId =
        `order-${Date.now()}-${Math.random()
          .toString(36)
          .slice(2, 8)}`;

      await supabaseWrite(
        'orders',
        {
          method:
            'POST',

          body:
            JSON.stringify({
              id:
                orderId,

              buyer_name:
                buyerName,

              buyer_whatsapp:
                buyerWhatsapp,

              items:
                orderItems,

              total:
                total,

              payment_status:
                'pending',

              created_at:
                new Date()
                  .toISOString()
            })
        }
      );

      const preference =
        await createMercadoPagoPreference(
          {
            items:
              orderItems.map(
                item => ({
                  title:
                    item.name,

                  quantity:
                    item.quantity,

                  currency_id:
                    'ARS',

                  unit_price:
                    item.price
                })
              ),

            external_reference:
              orderId,

            back_urls: {
              success:
                `${PUBLIC_URL}/order/success?order_id=${encodeURIComponent(orderId)}`,

              pending:
                `${PUBLIC_URL}/order/pending?order_id=${encodeURIComponent(orderId)}`,

              failure:
                `${PUBLIC_URL}/order/failure?order_id=${encodeURIComponent(orderId)}`
            },

            auto_return:
              'approved'
          }
        );

      if (
        !preference ||
        !preference.init_point
      ) {
        throw new Error(
          'No se pudo crear el pago.'
        );
      }

      return res.redirect(
        preference.init_point
      );
    } catch (
      error
    ) {
      console.error(
        error
      );

      return res
        .status(400)
        .send(
          layout(
            'Error en la compra',
            `
              <main class="section">
                <div class="container">
                  <div class="panel">

                    <h1>
                      No se pudo iniciar la compra
                    </h1>

                    <p>
                      ${escapeHtml(
                        error.message ||
                        'Ocurrió un error.'
                      )}
                    </p>

                    <a
                      class="button"
                      href="/#articulos"
                    >
                      Volver a artículos
                    </a>

                  </div>
                </div>
              </main>
            `
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
    const orderId =
      String(
        req.query
          .order_id || ''
      );

    const paymentId =
      String(
        req.query
          .payment_id || ''
      );

    let approved =
      false;

    if (paymentId) {
      const payment =
        await getMercadoPagoPayment(
          paymentId
        );

      approved =
        payment &&
        payment.status ===
          'approved' &&
        String(
          payment.external_reference ||
          ''
        ) === orderId;
    }

    if (approved) {
      try {
        await updateOrderStatus(
          orderId,
          'paid'
        );
      } catch (
        error
      ) {
        console.error(error);
      }
    }

    const order =
      await getOrder(
        orderId
      );

    if (!approved) {
      return res.send(
        layout(
          'Pago en revisión',
          `
            <main class="section">
              <div class="container">
                <div class="panel">

                  <h1>
                    Estamos verificando el pago
                  </h1>

                  <p>
                    Si Mercado Pago aprobó la compra,
                    aparecerá como pagada
                    en el panel.
                  </p>

                  <a
                    class="button"
                    href="/"
                  >
                    Volver al inicio
                  </a>

                </div>
              </div>
            </main>
          `
        )
      );
    }

    const orderMessage =
      order
        ? encodeURIComponent(
            `Hola, soy ${order.buyer_name}. Ya pagué mi compra por ${money(order.total)}. Pedido: ${order.id}.`
          )
        : encodeURIComponent(
            'Hola, ya pagué mi compra.'
          );

    return res.send(
      layout(
        'Compra pagada',
        `
          <main class="section">
            <div class="container">
              <div class="panel">

                <h1>
                  Compra pagada ✅
                </h1>

                <p>
                  Mercado Pago confirmó
                  tu compra.
                </p>

                ${
                  order
                    ? `
                      <p>
                        <strong>
                          Total:
                        </strong>
                        ${money(order.total)}
                      </p>
                    `
                    : ''
                }

                <div class="actions">

                  <a
                    class="button"
                    target="_blank"
                    rel="noopener noreferrer"
                    href="https://wa.me/${encodeURIComponent(BUSINESS_WHATSAPP)}?text=${orderMessage}"
                  >
                    Enviar pedido por WhatsApp
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
          </main>
        `
      )
    );
  }
);

app.get(
  '/order/pending',
  async (
    req,
    res
  ) => {
    const orderId =
      String(
        req.query
          .order_id || ''
      );

    try {
      await updateOrderStatus(
        orderId,
        'pending'
      );
    } catch (
      error
    ) {
      console.error(error);
    }

    res.send(
      layout(
        'Pago pendiente',
        `
          <main class="section">
            <div class="container">
              <div class="panel">

                <h1>
                  Pago pendiente
                </h1>

                <p>
                  Mercado Pago todavía
                  no confirmó la compra.
                </p>

                <a
                  class="button"
                  href="/"
                >
                  Volver al inicio
                </a>

              </div>
            </div>
          </main>
        `
      )
    );
  }
);

app.get(
  '/order/failure',
  async (
    req,
    res
  ) => {
    const orderId =
      String(
        req.query
          .order_id || ''
      );

    try {
      await updateOrderStatus(
        orderId,
        'failed'
      );
    } catch (
      error
    ) {
      console.error(error);
    }

    res.send(
      layout(
        'Pago rechazado',
        `
          <main class="section">
            <div class="container">
              <div class="panel">

                <h1>
                  El pago no se completó
                </h1>

                <p>
                  Podés volver a los artículos
                  e intentarlo nuevamente.
                </p>

                <a
                  class="button"
                  href="/#articulos"
                >
                  Volver a artículos
                </a>

              </div>
            </div>
          </main>
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
    const content = `
      <main class="section">
        <div class="container">

          <div
            class="panel"
            style="
              max-width:520px;
              margin:40px auto;
            "
          >

            <h1>
              Administrador
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
      </main>
    `;

    res.send(
      layout(
        'Administrador',
        content
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
              <main class="section">
                <div class="container">
                  <div class="panel">

                    <h1>
                      Datos incorrectos
                    </h1>

                    <p>
                      Revisá el correo
                      y la contraseña.
                    </p>

                    <a
                      class="button"
                      href="/admin/login"
                    >
                      Volver
                    </a>

                  </div>
                </div>
              </main>
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
    try {
      const [
        courses,
        products,
        settings,
        inscriptions,
        orders
      ] = await Promise.all([
        getCourses(),
        getProducts(),
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
                    value="${escapeHtml(course.image || '')}"
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
                        Icono
                      </label>

                      <input
                        type="text"
                        name="icon"
                        value="${escapeHtml(course.icon || '')}"
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
                      >${escapeHtml(course.description || '')}</textarea>
                    </div>

                    <div class="form-group full">
                      <label>
                        Horarios
                      </label>

                      <textarea
                        name="schedules"
                        placeholder="Un horario por línea"
                      >${escapeHtml(
                        course.schedules.join('\n')
                      )}</textarea>
                    </div>

                    <div class="form-group">
                      <label>
                        Inscripción
                      </label>

                      <input
                        type="number"
                        name="registration"
                        min="0"
                        value="${Number(course.registration || 0)}"
                        required
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
                        value="${Number(course.monthlyFee || 0)}"
                        required
                      >
                    </div>

                    <div class="form-group full">
                      <button
                        class="button full"
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
                    value="${escapeHtml(product.image || '')}"
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
                        Icono
                      </label>

                      <input
                        type="text"
                        name="icon"
                        value="${escapeHtml(product.icon || '')}"
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
                        value="${Number(product.price || 0)}"
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
                        value="${Number(product.stock || 0)}"
                        required
                      >
                    </div>

                    <div class="form-group full">
                      <button
                        class="button full"
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

      const inscriptionsHtml =
        Array.isArray(inscriptions) &&
        inscriptions.length > 0
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
                      ${escapeHtml(item.payment_status || 'pending')}
                    </td>
                  </tr>
                `
              )
              .join('')
          : `
            <tr>
              <td colspan="7">
                Todavía no hay inscripciones.
              </td>
            </tr>
          `;

      const ordersHtml =
        Array.isArray(orders) &&
        orders.length > 0
          ? orders
              .map(
                item => `
                  <tr>
                    <td>
                      ${escapeHtml(item.id || '')}
                    </td>

                    <td>
                      ${escapeHtml(item.buyer_name || '')}
                    </td>

                    <td>
                      ${escapeHtml(item.buyer_whatsapp || '')}
                    </td>

                    <td>
                      ${money(item.total)}
                    </td>

                    <td>
                      ${escapeHtml(item.payment_status || 'pending')}
                    </td>
                  </tr>
                `
              )
              .join('')
          : `
            <tr>
              <td colspan="5">
                Todavía no hay pedidos.
              </td>
            </tr>
          `;

      const content = `
        <main class="section">
          <div class="container">

            <div
              class="actions"
              style="
                justify-content:space-between;
                margin-bottom:20px;
              "
            >
              <h1>
                Panel administrador
              </h1>

              <a
                class="button dark"
                href="/admin/logout"
              >
                Cerrar sesión
              </a>
            </div>

            <div class="admin-grid">

              <section class="panel">
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

                  <input
                    type="hidden"
                    name="currentBackgroundImage"
                    value="${escapeHtml(settings.backgroundImage || '')}"
                  >

                  <div class="form-grid">

                    <div class="form-group full">
                      <label>
                        Elegir nueva foto de fondo
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
              </section>

              <section class="panel">
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
                        Icono
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
                        placeholder="Ejemplo:
Martes de 16:00 a 18:00
Sábado de 10:00 a 12:00"
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
                        value="20000"
                        required
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
                        value="80000"
                        required
                      >
                    </div>

                    <div class="form-group full">
                      <button
                        class="button full"
                        type="submit"
                      >
                        Agregar curso
                      </button>
                    </div>

                  </div>
                </form>
              </section>

              <section class="panel">
                <h2>
                  Editar cursos
                </h2>

                <div class="admin-grid">
                  ${courseForms}
                </div>
              </section>

              <section class="panel">
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
                        Icono
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
                        class="button full"
                        type="submit"
                      >
                        Agregar artículo
                      </button>
                    </div>

                  </div>
                </form>
              </section>

              <section class="panel">
                <h2>
                  Editar artículos
                </h2>

                <div class="admin-grid">
                  ${productForms}
                </div>
              </section>

              <section class="panel">
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
                      </tr>
                    </thead>

                    <tbody>
                      ${inscriptionsHtml}
                    </tbody>
                  </table>
                </div>
              </section>

              <section class="panel">
                <h2>
                  Pedidos
                </h2>

                <div class="table-wrap">
                  <table>
                    <thead>
                      <tr>
                        <th>
                          Pedido
                        </th>

                        <th>
                          Cliente
                        </th>

                        <th>
                          WhatsApp
                        </th>

                        <th>
                          Total
                        </th>

                        <th>
                          Estado
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      ${ordersHtml}
                    </tbody>
                  </table>
                </div>
              </section>

            </div>

          </div>
        </main>
      `;

      res.send(
        layout(
          'Panel administrador',
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
            'Error cargando el panel',
            error.message
          )
        );
    }
  }
);
app.post(
  '/admin/settings',
  adminRequired,
  upload.single(
    'backgroundFile'
  ),
  async (
    req,
    res
  ) => {
    try {
      let backgroundImage =
        String(
          req.body
            .currentBackgroundImage ||
          ''
        ).trim();

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
            method:
              'PATCH',

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
            method:
              'POST',

            body:
              JSON.stringify({
                key:
                  'main',

                background_image:
                  backgroundImage
              })
          }
        );
      }

      siteSettings.backgroundImage =
        backgroundImage;

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
  upload.single(
    'imageFile'
  ),
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

      let schedules =
        normalizeSchedules(
          req.body.schedules
        );

      if (
        schedules.length === 0
      ) {
        schedules = [
          'Horario próximamente'
        ];
      }

      const id =
        `${slugify(name)}-${Date.now()}`;

      const databaseCourse = {
        id,

        icon:
          String(
            req.body.icon ||
            '✂️'
          ).trim(),

        image,

        name,

        description:
          String(
            req.body
              .description ||
            ''
          ).trim(),

        schedules,

        registration:
          Number(
            req.body
              .registration ||
            0
          ),

        monthly_fee:
          Number(
            req.body
              .monthlyFee ||
            0
          )
      };

      await supabaseWrite(
        'courses',
        {
          method:
            'POST',

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
  upload.single(
    'imageFile'
  ),
  async (
    req,
    res
  ) => {
    try {
      const id =
        String(
          req.body.id || ''
        ).trim();

      const name =
        String(
          req.body.name || ''
        ).trim();

      if (
        !id ||
        !name
      ) {
        throw new Error(
          'Faltan datos del curso.'
        );
      }

      let image =
        String(
          req.body
            .currentImage ||
          ''
        ).trim();

      if (req.file) {
        image =
          await uploadImageToSupabase(
            req.file,
            'courses'
          );
      }

      let schedules =
        normalizeSchedules(
          req.body.schedules
        );

      if (
        schedules.length === 0
      ) {
        schedules = [
          'Horario próximamente'
        ];
      }

      const updatedCourse = {
        icon:
          String(
            req.body.icon ||
            '✂️'
          ).trim(),

        image,

        name,

        description:
          String(
            req.body
              .description ||
            ''
          ).trim(),

        schedules,

        registration:
          Number(
            req.body
              .registration ||
            0
          ),

        monthly_fee:
          Number(
            req.body
              .monthlyFee ||
            0
          )
      };

      await supabaseWrite(
        `courses?id=eq.${encodeURIComponent(id)}`,
        {
          method:
            'PATCH',

          body:
            JSON.stringify(
              updatedCourse
            )
        }
      );

      const index =
        memoryCourses.findIndex(
          item =>
            String(item.id) ===
            id
        );

      if (
        index !== -1
      ) {
        memoryCourses[index] =
          databaseCourseToApp({
            id,
            ...updatedCourse
          });
      }

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
            'No se pudo guardar el curso',
            error.message
          )
        );
    }
  }
);

app.post(
  '/admin/product/add',
  adminRequired,
  upload.single(
    'imageFile'
  ),
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
            req.body.icon ||
            '🛍️'
          ).trim(),

        image,

        name,

        price:
          Number(
            req.body.price ||
            0
          ),

        stock:
          Number(
            req.body.stock ||
            0
          )
      };

      await supabaseWrite(
        'products',
        {
          method:
            'POST',

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
  upload.single(
    'imageFile'
  ),
  async (
    req,
    res
  ) => {
    try {
      const id =
        String(
          req.body.id || ''
        ).trim();

      const name =
        String(
          req.body.name || ''
        ).trim();

      if (
        !id ||
        !name
      ) {
        throw new Error(
          'Faltan datos del artículo.'
        );
      }

      let image =
        String(
          req.body
            .currentImage ||
          ''
        ).trim();

      if (req.file) {
        image =
          await uploadImageToSupabase(
            req.file,
            'products'
          );
      }

      const updatedProduct = {
        icon:
          String(
            req.body.icon ||
            '🛍️'
          ).trim(),

        image,

        name,

        price:
          Number(
            req.body.price ||
            0
          ),

        stock:
          Number(
            req.body.stock ||
            0
          )
      };

      await supabaseWrite(
        `products?id=eq.${encodeURIComponent(id)}`,
        {
          method:
            'PATCH',

          body:
            JSON.stringify(
              updatedProduct
            )
        }
      );

      const index =
        memoryProducts.findIndex(
          item =>
            String(item.id) ===
            id
        );

      if (
        index !== -1
      ) {
        memoryProducts[index] =
          databaseProductToApp({
            id,
            ...updatedProduct
          });
      }

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
            'No se pudo guardar el artículo',
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
      ok: true
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
            <main class="section">
              <div class="container">
                <div class="panel">

                  <h1>
                    Página no encontrada
                  </h1>

                  <a
                    class="button"
                    href="/"
                  >
                    Volver al inicio
                  </a>

                </div>
              </div>
            </main>
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

    if (
      error instanceof
      multer.MulterError
    ) {
      return res
        .status(400)
        .send(
          errorPage(
            'Error con la imagen',
            error.code ===
              'LIMIT_FILE_SIZE'
              ? 'La imagen es demasiado grande. El máximo es 8 MB.'
              : error.message
          )
        );
    }

    return res
      .status(500)
      .send(
        errorPage(
          'Ocurrió un error',
          error.message ||
          'Intentá nuevamente.'
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
app.post(
  '/admin/settings',
  adminRequired,
  upload.single(
    'backgroundFile'
  ),
  async (
    req,
    res
  ) => {
    try {
      let backgroundImage =
        String(
          req.body
            .currentBackgroundImage ||
          ''
        ).trim();

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
            method:
              'PATCH',

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
            method:
              'POST',

            body:
              JSON.stringify({
                key:
                  'main',

                background_image:
                  backgroundImage
              })
          }
        );
      }

      siteSettings.backgroundImage =
        backgroundImage;

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
  upload.single(
    'imageFile'
  ),
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

      let schedules =
        normalizeSchedules(
          req.body.schedules
        );

      if (
        schedules.length === 0
      ) {
        schedules = [
          'Horario próximamente'
        ];
      }

      const id =
        `${slugify(name)}-${Date.now()}`;

      const databaseCourse = {
        id,

        icon:
          String(
            req.body.icon ||
            '✂️'
          ).trim(),

        image,

        name,

        description:
          String(
            req.body
              .description ||
            ''
          ).trim(),

        schedules,

        registration:
          Number(
            req.body
              .registration ||
            0
          ),

        monthly_fee:
          Number(
            req.body
              .monthlyFee ||
            0
          )
      };

      await supabaseWrite(
        'courses',
        {
          method:
            'POST',

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
  upload.single(
    'imageFile'
  ),
  async (
    req,
    res
  ) => {
    try {
      const id =
        String(
          req.body.id || ''
        ).trim();

      const name =
        String(
          req.body.name || ''
        ).trim();

      if (
        !id ||
        !name
      ) {
        throw new Error(
          'Faltan datos del curso.'
        );
      }

      let image =
        String(
          req.body
            .currentImage ||
          ''
        ).trim();

      if (req.file) {
        image =
          await uploadImageToSupabase(
            req.file,
            'courses'
          );
      }

      let schedules =
        normalizeSchedules(
          req.body.schedules
        );

      if (
        schedules.length === 0
      ) {
        schedules = [
          'Horario próximamente'
        ];
      }

      const updatedCourse = {
        icon:
          String(
            req.body.icon ||
            '✂️'
          ).trim(),

        image,

        name,

        description:
          String(
            req.body
              .description ||
            ''
          ).trim(),

        schedules,

        registration:
          Number(
            req.body
              .registration ||
            0
          ),

        monthly_fee:
          Number(
            req.body
              .monthlyFee ||
            0
          )
      };

      await supabaseWrite(
        `courses?id=eq.${encodeURIComponent(id)}`,
        {
          method:
            'PATCH',

          body:
            JSON.stringify(
              updatedCourse
            )
        }
      );

      const index =
        memoryCourses.findIndex(
          item =>
            String(item.id) ===
            id
        );

      if (
        index !== -1
      ) {
        memoryCourses[index] =
          databaseCourseToApp({
            id,
            ...updatedCourse
          });
      }

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
            'No se pudo guardar el curso',
            error.message
          )
        );
    }
  }
);

app.post(
  '/admin/product/add',
  adminRequired,
  upload.single(
    'imageFile'
  ),
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
            req.body.icon ||
            '🛍️'
          ).trim(),

        image,

        name,

        price:
          Number(
            req.body.price ||
            0
          ),

        stock:
          Number(
            req.body.stock ||
            0
          )
      };

      await supabaseWrite(
        'products',
        {
          method:
            'POST',

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
  upload.single(
    'imageFile'
  ),
  async (
    req,
    res
  ) => {
    try {
      const id =
        String(
          req.body.id || ''
        ).trim();

      const name =
        String(
          req.body.name || ''
        ).trim();

      if (
        !id ||
        !name
      ) {
        throw new Error(
          'Faltan datos del artículo.'
        );
      }

      let image =
        String(
          req.body
            .currentImage ||
          ''
        ).trim();

      if (req.file) {
        image =
          await uploadImageToSupabase(
            req.file,
            'products'
          );
      }

      const updatedProduct = {
        icon:
          String(
            req.body.icon ||
            '🛍️'
          ).trim(),

        image,

        name,

        price:
          Number(
            req.body.price ||
            0
          ),

        stock:
          Number(
            req.body.stock ||
            0
          )
      };

      await supabaseWrite(
        `products?id=eq.${encodeURIComponent(id)}`,
        {
          method:
            'PATCH',

          body:
            JSON.stringify(
              updatedProduct
            )
        }
      );

      const index =
        memoryProducts.findIndex(
          item =>
            String(item.id) ===
            id
        );

      if (
        index !== -1
      ) {
        memoryProducts[index] =
          databaseProductToApp({
            id,
            ...updatedProduct
          });
      }

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
            'No se pudo guardar el artículo',
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
      ok: true
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
            <main class="section">
              <div class="container">
                <div class="panel">

                  <h1>
                    Página no encontrada
                  </h1>

                  <a
                    class="button"
                    href="/"
                  >
                    Volver al inicio
                  </a>

                </div>
              </div>
            </main>
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

    if (
      error instanceof
      multer.MulterError
    ) {
      return res
        .status(400)
        .send(
          errorPage(
            'Error con la imagen',
            error.code ===
              'LIMIT_FILE_SIZE'
              ? 'La imagen es demasiado grande. El máximo es 8 MB.'
              : error.message
          )
        );
    }

    return res
      .status(500)
      .send(
        errorPage(
          'Ocurrió un error',
          error.message ||
          'Intentá nuevamente.'
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
